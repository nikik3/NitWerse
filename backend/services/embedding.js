import OpenAI from "openai";

const EMBEDDING_DELAY_MS = 1200;
const MAX_RETRIES = 3;

let healthCache = { result: null, expiresAt: 0 };
const embeddingQueue = [];
let isProcessingQueue = false;

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

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseEmbeddingError(error) {
    const status = error?.status || error?.response?.status;
    const rawMessage = error?.error?.message || error?.message || "Embedding request failed";
    let message = rawMessage;

    if (status === 401) {
        message = "Invalid OpenAI API key. Check OPENAI_API_KEY on Render.";
    } else if (
        status === 402 ||
        rawMessage.toLowerCase().includes("quota") ||
        rawMessage.toLowerCase().includes("billing") ||
        rawMessage.toLowerCase().includes("insufficient")
    ) {
        message = "OpenAI billing needed. Add a payment method at platform.openai.com/account/billing (free credits still apply).";
    } else if (status === 429) {
        message = "OpenAI is busy — wait 30 seconds and try again. Free accounts have low rate limits.";
    }

    return { status, message };
}

async function callEmbeddingApi(text) {
    const openai = getOpenAIClient();
    if (!openai) {
        return { embedding: null, error: "OPENAI_API_KEY is not configured" };
    }

    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text.trim(),
            });
            return { embedding: response.data[0].embedding, error: null };
        } catch (error) {
            lastError = parseEmbeddingError(error);
            const isRetryable = lastError.status === 429 && attempt < MAX_RETRIES - 1;

            if (!isRetryable) break;

            await sleep(1500 * (attempt + 1));
        }
    }

    console.error("Embedding API error:", lastError?.status, lastError?.message);
    return { embedding: null, error: lastError?.message || "Embedding request failed" };
}

async function processEmbeddingQueue() {
    if (isProcessingQueue) return;
    isProcessingQueue = true;

    while (embeddingQueue.length > 0) {
        const { text, resolve } = embeddingQueue.shift();
        const result = await callEmbeddingApi(text);
        resolve(result);

        if (embeddingQueue.length > 0) {
            await sleep(EMBEDDING_DELAY_MS);
        }
    }

    isProcessingQueue = false;
}

export async function getEmbedding(text) {
    if (!text?.trim()) {
        return { embedding: null, error: "Empty text" };
    }

    return new Promise((resolve) => {
        embeddingQueue.push({ text, resolve });
        processEmbeddingQueue();
    });
}

export async function checkEmbeddingHealth() {
    if (!isEmbeddingEnabled()) {
        return {
            enabled: false,
            working: false,
            message: "OPENAI_API_KEY is not set on the server.",
        };
    }

    if (healthCache.expiresAt > Date.now() && healthCache.result) {
        return healthCache.result;
    }

    const { embedding, error } = await getEmbedding("nitwerse health check");

    const result = {
        enabled: true,
        working: Boolean(embedding),
        message: embedding
            ? "OpenAI embeddings are working. Send messages, wait a few seconds, then search."
            : error || "OpenAI API call failed.",
    };

    healthCache = {
        result,
        expiresAt: Date.now() + (embedding ? 10 * 60 * 1000 : 60 * 1000),
    };

    return result;
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
