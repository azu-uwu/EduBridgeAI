const express = require("express");
const cors = require("cors");

const { clientOrigins } = require("./config/env");
const healthRoutes = require("./routes/health.routes");
const { createAiRoutes } = require("./routes/ai.routes");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

function createApp(options = {}) {
    const app = express();

    app.disable("x-powered-by");

    // Cấu hình CORS cho frontend.
    app.use(
        cors({
            origin(origin, callback) {
                // Cho phép Postman hoặc yêu cầu không có Origin.
                if (!origin || clientOrigins.includes(origin)) {
                    return callback(null, true);
                }

                const error = new Error("Origin không được cho phép.");
                error.code = "CORS_NOT_ALLOWED";

                return callback(error);
            },
            methods: ["GET", "POST", "OPTIONS"],
            allowedHeaders: ["Content-Type"],
            credentials: false,
        })
    );

    // Ba POST AI: limiter → Content-Type → JSON parser 100 KiB → validation → controller.
    app.use("/api", createAiRoutes(options));

    // Gắn routes health: /api + /health = /api/health.
    app.use("/api", healthRoutes);

    // Đặt sau tất cả routes.
    app.use(notFound);
    app.use(errorHandler);

    return app;
}

const app = createApp();

module.exports = app;
module.exports.createApp = createApp;
