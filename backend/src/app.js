const express = require("express");
const cors = require("cors");

const { clientOrigins } = require("./config/env");
const healthRoutes = require("./routes/health.routes");
const notFound = require("./middlewares/notFound.middleware");
const errorHandler = require("./middlewares/error.middleware");

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

// Gắn routes: /api + /health = /api/health.
app.use("/api", healthRoutes);

// Đặt sau tất cả routes.
app.use(notFound);
app.use(errorHandler);

module.exports = app;