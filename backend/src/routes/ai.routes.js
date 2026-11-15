const express = require("express");
const rateLimit = require("express-rate-limit");

const { rateLimitWindowMs, rateLimitMax } = require("../config/env");
const { requireJsonContentType } = require("../middlewares/content-type.middleware");
const { validate } = require("../middlewares/validation.middleware");
const {
    simplifySchema,
    explainSchema,
    summarizeSchema,
    explainDifficultWordsSchema,
} = require("../schemas/ai.schemas");
const aiController = require("../controllers/ai.controller");

function createAiRoutes(options = {}) {
    const router = express.Router();

    const {
        windowMs = rateLimitWindowMs,
        max = rateLimitMax,
        store = undefined,
    } = options;

    // Hạn mức dùng chung cho cả ba API AI (áp dụng theo từng route).
    const aiLimiter = rateLimit({
        windowMs,
        max,
        store,
        standardHeaders: true,
        legacyHeaders: false,
        handler(_req, res) {
            res.status(429).json({
                success: false,
                error: {
                    code: "RATE_LIMITED",
                    message: "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
                },
            });
        },
    });

    const jsonParser = express.json({ limit: "100kb" });

    router.post(
        "/simplify",
        aiLimiter,
        requireJsonContentType,
        jsonParser,
        validate(simplifySchema),
        aiController.simplify
    );

    router.post(
        "/explain",
        aiLimiter,
        requireJsonContentType,
        jsonParser,
        validate(explainSchema),
        aiController.explain
    );

    router.post(
        "/summarize",
        aiLimiter,
        requireJsonContentType,
        jsonParser,
        validate(summarizeSchema),
        aiController.summarize
    );

    router.post(
        ["/explain-difficult-words", "/explain-difficult-word"],
        aiLimiter,
        requireJsonContentType,
        jsonParser,
        validate(explainDifficultWordsSchema),
        aiController.explainDifficultWords
    );

    // Audio TTS stream cho mọi trình duyệt (Chrome, Cốc Cốc, Firefox, Edge...)
    router.get("/tts", (req, res) => {
        const text = String(req.query.text || "").trim();
        if (!text) {
            return res.status(400).send("Thiếu tham số text");
        }
        const cleanText = text.slice(0, 250);
        const speedParam = req.query.speed === "slow" ? "&ttsspeed=0.3" : "";
        const https = require("https");
        const ttsUrl =
            "https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob" +
            speedParam +
            "&q=" +
            encodeURIComponent(cleanText);

        https.get(ttsUrl, { headers: { "User-Agent": "Mozilla/5.0" } }, (proxyRes) => {
            if (proxyRes.statusCode !== 200) {
                return res.status(502).send("Lỗi dịch vụ âm thanh upstream");
            }
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Accept-Ranges", "bytes");
            res.setHeader("Cache-Control", "public, max-age=86400");
            proxyRes.pipe(res);
        }).on("error", () => {
            res.status(500).send("Lỗi kết nối âm thanh");
        });
    });

    return router;
}

module.exports = { createAiRoutes };
