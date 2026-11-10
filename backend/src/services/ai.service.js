const AppError = require("../utils/app-error");
const mockService = require("./mock.service");
const geminiService = require("./gemini.service");
const { aiMode } = require("../config/env");
const {
    simplifyOutputSchema,
    explainOutputSchema,
    summarizeOutputSchema,
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

module.exports = {
    simplify,
    explain,
    summarize,
};
