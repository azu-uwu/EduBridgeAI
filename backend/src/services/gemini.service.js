const { GoogleGenAI, ApiError } = require("@google/genai");
const AppError = require("../utils/app-error");

const DEFAULT_TIMEOUT_MS = 30000;

let client = null;

function getClient() {
    if (!client) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new AppError(503, "AI_UNAVAILABLE", "Thiếu cấu hình Gemini API key.");
        }
        client = new GoogleGenAI({ apiKey });
    }
    return client;
}

function resetClient() {
    client = null;
}

function resolveTimeoutMs() {
    const ms = Number(process.env.AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
    if (!Number.isInteger(ms) || ms <= 0) {
        return DEFAULT_TIMEOUT_MS;
    }
    return ms;
}

function resolveModel() {
    return process.env.GEMINI_MODEL;
}

function isAbortError(err) {
    if (!err) return false;
    const name = String(err.name || "");
    const code = String(err.code || "");
    const message = String(err.message || "");
    return name === "AbortError" || code === "ABORTED" || /abort/i.test(message);
}

function mapProviderError(err) {
    if (isAbortError(err)) {
        return new AppError(504, "AI_TIMEOUT", "Vượt thời gian chờ xử lý AI.");
    }
    if (err instanceof ApiError) {
        const status = err.status;
        if (status === 429) {
            return new AppError(503, "AI_UNAVAILABLE", "Gemini hết quota hoặc bị giới hạn tốc độ.");
        }
        if (status >= 500) {
            return new AppError(503, "AI_UNAVAILABLE", "Dịch vụ Gemini đang lỗi.");
        }
        if (status === 403 || status === 404) {
            return new AppError(503, "AI_UNAVAILABLE", "API key hoặc model Gemini không dùng được.");
        }
        if (status === 400) {
            return new AppError(503, "AI_UNAVAILABLE", "Yêu cầu gửi đến Gemini không hợp lệ.");
        }
        return new AppError(503, "AI_UNAVAILABLE", "Lỗi từ Gemini API.");
    }
    if (err && err.code) {
        const code = String(err.code);
        if (code === "ETIMEDOUT" || code === "ESOCKETTIMEDOUT") {
            return new AppError(504, "AI_TIMEOUT", "Vượt thời gian chờ xử lý AI.");
        }
        return new AppError(503, "AI_UNAVAILABLE", "Lỗi kết nối đến Gemini.");
    }
    return new AppError(503, "AI_UNAVAILABLE", "Lỗi khi gọi dịch vụ AI.");
}

async function generateWithDeadline(model, systemInstruction, userContent, responseJsonSchema) {
    const timeoutMs = resolveTimeoutMs();
    const controller = new AbortController();
    let timedOut = false;
    const timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, timeoutMs);

    const startTime = Date.now();
    const ai = getClient();
    try {
        const response = await ai.models.generateContent({
            model,
            contents: userContent,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseJsonSchema,
                abortSignal: controller.signal,
            },
        });
        clearTimeout(timeoutId);
        return response;
    } catch (err) {
        clearTimeout(timeoutId);
        const durationMs = Date.now() - startTime;
        if (timedOut || isAbortError(err)) {
            console.error(
                "AI provider timeout aborted:",
                "name=AbortError, durationMs=" + durationMs,
            );
            throw new AppError(504, "AI_TIMEOUT", "Vượt thời gian chờ xử lý AI.");
        }
        logProviderErrorSafe(err, durationMs);
        throw mapProviderError(err);
    }
}

function logProviderErrorSafe(err, durationMs) {
    // Chỉ ghi metadata chẩn đoán, KHÔNG ghi key, prompt, input/output hay toàn bộ đối tượng lỗi.
    const parts = [];
    if (err && err.name) parts.push("name=" + String(err.name));
    if (err && Number.isInteger(err.status)) parts.push("status=" + err.status);
    if (err && err.code) parts.push("code=" + String(err.code));
    if (err && err.cause && err.cause.code) parts.push("cause.code=" + String(err.cause.code));
    if (err && err.message) parts.push("message=" + String(err.message).slice(0, 200));
    parts.push("durationMs=" + durationMs);
    console.error("AI provider error:", parts.join(" "));
}

function parseAndCheck(response) {
    const text = response && response.text !== undefined ? String(response.text) : "";
    if (text.trim() === "") {
        throw new AppError(502, "AI_INVALID_RESPONSE", "Phản hồi từ AI trống.");
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new AppError(502, "AI_INVALID_RESPONSE", "Phản hồi từ AI không phải JSON hợp lệ.");
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new AppError(502, "AI_INVALID_RESPONSE", "Phản hồi từ AI không phải đối tượng JSON.");
    }
    if (parsed.cannot_process === true) {
        throw new AppError(422, "AI_CANNOT_PROCESS", String(parsed.ly_do || "Không đủ cơ sở để xử lý."));
    }
    return parsed;
}

async function simplify(text, level) {
    const { systemInstruction, buildUserContent, responseJsonSchema } =
        require("../prompts/simplify.prompt");
    const model = resolveModel();
    const response = await generateWithDeadline(
        model,
        systemInstruction,
        buildUserContent({ text, level }),
        responseJsonSchema
    );
    return parseAndCheck(response);
}

async function explain(term, context) {
    const { systemInstruction, buildUserContent, responseJsonSchema } =
        require("../prompts/explain.prompt");
    const model = resolveModel();
    const response = await generateWithDeadline(
        model,
        systemInstruction,
        buildUserContent({ term, context }),
        responseJsonSchema
    );
    return parseAndCheck(response);
}

async function summarize(text) {
    const { systemInstruction, buildUserContent, responseJsonSchema } =
        require("../prompts/summarize.prompt");
    const model = resolveModel();
    const response = await generateWithDeadline(
        model,
        systemInstruction,
        buildUserContent({ text }),
        responseJsonSchema
    );
    return parseAndCheck(response);
}

async function explainDifficultWords(text) {
    const { systemInstruction, buildUserContent, responseJsonSchema } =
        require("../prompts/explain-difficult-words.prompt");
    const model = resolveModel();
    const response = await generateWithDeadline(
        model,
        systemInstruction,
        buildUserContent({ text }),
        responseJsonSchema
    );
    return parseAndCheck(response);
}

module.exports = {
    simplify,
    explain,
    summarize,
    explainDifficultWords,
    getClient,
    resetClient,
    generateWithDeadline,
    mapProviderError,
    parseAndCheck,
};
