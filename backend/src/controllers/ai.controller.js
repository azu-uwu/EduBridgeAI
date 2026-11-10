const aiService = require("../services/ai.service");

async function simplify(req, res) {
    const { text, level } = req.body;
    const { data, mode } = await aiService.simplify(text, level);
    res.status(200).json({
        success: true,
        data: {
            simplifiedText: data.simplifiedText,
            level,
        },
        meta: { mode },
    });
}

async function explain(req, res) {
    const { term, context } = req.body;
    const { data, mode } = await aiService.explain(term, context);
    res.status(200).json({
        success: true,
        data: {
            term: data.term,
            meaning: data.meaning,
            examples: data.examples,
        },
        meta: { mode },
    });
}

async function summarize(req, res) {
    const { text } = req.body;
    const { data, mode } = await aiService.summarize(text);
    res.status(200).json({
        success: true,
        data: {
            summary: data.summary,
            keyPoints: data.keyPoints,
        },
        meta: { mode },
    });
}

module.exports = {
    simplify,
    explain,
    summarize,
};
