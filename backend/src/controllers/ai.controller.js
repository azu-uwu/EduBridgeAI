const aiService = require("../services/ai.service");

function simplify(req, res) {
    const { text, level } = req.body;
    const result = aiService.simplify(text, level);
    res.status(200).json({
        success: true,
        data: {
            simplifiedText: result.simplifiedText,
            level: result.level,
        },
        meta: { mode: "mock" },
    });
}

function explain(req, res) {
    const { term, context } = req.body;
    const result = aiService.explain(term, context);
    res.status(200).json({
        success: true,
        data: {
            term: result.term,
            meaning: result.meaning,
            examples: result.examples,
        },
        meta: { mode: "mock" },
    });
}

function summarize(req, res) {
    const { text } = req.body;
    const result = aiService.summarize(text);
    res.status(200).json({
        success: true,
        data: {
            summary: result.summary,
            keyPoints: result.keyPoints,
        },
        meta: { mode: "mock" },
    });
}

module.exports = {
    simplify,
    explain,
    summarize,
};
