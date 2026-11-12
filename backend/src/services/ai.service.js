const AppError = require("../utils/app-error");
const mockService = require("./mock.service");
const geminiService = require("./gemini.service");
const { aiMode } = require("../config/env");
const {
    simplifyOutputSchema,
    explainOutputSchema,
    summarizeOutputSchema,
    explainDifficultWordsOutputSchema,
} = require("../schemas/ai.response.schemas");

function validateOutput(schema, parsed) {
    try {
        return schema.parse(parsed);
    } catch {
        throw new AppError(
            502,
            "AI_INVALID_RESPONSE",
            "Kết quả từ AI không đúng định dạng mong đợi."
        );
    }
}

function normalizeString(value) {
    return String(value)
        .normalize("NFC")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}

function tokenize(value) {
    const normalized = normalizeString(value);
    return normalized === "" ? [] : normalized.split(" ");
}

function isWholeWordInText(word, text) {
    const wordTokens = tokenize(word);
    const textTokens = tokenize(text);
    if (wordTokens.length === 0 || wordTokens.length > textTokens.length) {
        return false;
    }
    for (let i = 0; i <= textTokens.length - wordTokens.length; i++) {
        let matched = true;
        for (let j = 0; j < wordTokens.length; j++) {
            if (textTokens[i + j] !== wordTokens[j]) {
                matched = false;
                break;
            }
        }
        if (matched) return true;
    }
    return false;
}

function cleanAndFilterWords(words, text) {
    const seen = new Set();
    const result = [];
    for (const item of words) {
        const normalizedWord = normalizeString(item.word);
        if (normalizedWord === "") continue;
        if (seen.has(normalizedWord)) continue;
        if (!isWholeWordInText(item.word, text)) continue;
        seen.add(normalizedWord);
        result.push({
            word: item.word,
            meaning: item.meaning,
            example: item.example,
        });
    }
    return result;
}

async function simplify(text, level) {
    if (aiMode === "gemini") {
        const parsed = await geminiService.simplify(text, level);
        const validated = validateOutput(simplifyOutputSchema, parsed);
        return {
            data: { simplifiedText: validated.simplifiedText, level },
            mode: "gemini",
        };
    }
    return {
        data: mockService.simplify(text, level),
        mode: "mock",
    };
}

async function explain(term, context) {
    if (aiMode === "gemini") {
        const parsed = await geminiService.explain(term, context);
        const validated = validateOutput(explainOutputSchema, parsed);
        return {
            data: { term, meaning: validated.meaning, examples: validated.examples },
            mode: "gemini",
        };
    }
    return {
        data: mockService.explain(term, context),
        mode: "mock",
    };
}

async function summarize(text) {
    if (aiMode === "gemini") {
        const parsed = await geminiService.summarize(text);
        const validated = validateOutput(summarizeOutputSchema, parsed);
        return {
            data: { summary: validated.summary, keyPoints: validated.keyPoints },
            mode: "gemini",
        };
    }
    return {
        data: mockService.summarize(text),
        mode: "mock",
    };
}

async function explainDifficultWords(text) {
    let parsed;
    if (aiMode === "gemini") {
        parsed = await geminiService.explainDifficultWords(text);
        parsed = validateOutput(explainDifficultWordsOutputSchema, parsed);
    } else {
        parsed = mockService.explainDifficultWords(text);
    }
    const words = cleanAndFilterWords(parsed.words, text);
    return {
        data: { words },
        mode: aiMode,
    };
}

module.exports = {
    simplify,
    explain,
    summarize,
    explainDifficultWords,
};
