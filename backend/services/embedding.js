import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

export function isEmbeddingEnabled() {
    return Boolean(openai);
}

export async function getEmbedding(text) {
    if (!openai || !text?.trim()) return null;

    try {
        const response = await openai.embeddings.create({
            model: "text-embedding-3-small",
            input: text.trim(),
        });
        return response.data[0].embedding;
    } catch (error) {
        console.error("Embedding API error:", error.message);
        return null;
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
