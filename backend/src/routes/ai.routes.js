const express = require("express");
const rateLimit = require("express-rate-limit");

const { rateLimitWindowMs, rateLimitMax } = require("../config/env");
const { requireJsonContentType } = require("../middlewares/content-type.middleware");
const { validate } = require("../middlewares/validation.middleware");
const {
    simplifySchema,
    explainSchema,
    summarizeSchema,
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

    return router;
}

module.exports = { createAiRoutes };
