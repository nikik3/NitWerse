import OpenAI from "openai";

function getApiKey() {
    return process.env.OPENAI_API_KEY?.trim() || null;
}

export function isEmbeddingEnabled() {
    return Boolean(getApiKey());
}

function getOpenAIClient() {
    const apiKey = getApiKey();
    if (!apiKey) return null;
    return new OpenAI({ apiKey });
}

export async function getEmbedding(text) {
    if (!text?.trim()) {
        return { embedding: null, error: "Empty text" };
    }

    const openai = getOpenAIClient();
    if (!openai) {
        return { embedding: null, error: "OPENAI_API_KEY is not configured" };
    }

    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.trim(),
        });
        return { embedding: response.data[0].embedding, error: null };
    } catch (error) {
        const status = error?.status || error?.response?.status;
        let message = error?.message || "Embedding request failed";

        if (status === 401) {
            message = "Invalid OpenAI API key. Check OPENAI_API_KEY on Render.";
        } else if (status === 429) {
            message = "OpenAI rate limit reached. Try again in a moment.";
        } else if (status === 402 || message.toLowerCase().includes("quota")) {
            message = "OpenAI quota exceeded. Add billing or create a new API key.";
        }

        console.error("Embedding API error:", status, message);
        return { embedding: null, error: message };
    }
}

export function cosineSimilarity(a, b) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];
    }

    const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
    return magnitude === 0 ? 0 : dot / magnitude;
}
