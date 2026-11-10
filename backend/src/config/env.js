// Đọc các biến trong file .env vào process.env.
require("dotenv").config();

// Biến môi trường được đọc dưới dạng chuỗi, cần chuyển sang số khi dùng.
const port = Number(process.env.PORT || 5000);

// Kiểm tra cổng có hợp lệ không.
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT phải là số nguyên từ 1 đến 65535.");
}

// Chuyển danh sách địa chỉ frontend thành mảng.
const clientOrigins = (
  process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Chế độ AI: "mock" (mặc định) hoặc "gemini".
const aiMode = process.env.AI_MODE || "mock";
if (aiMode !== "mock" && aiMode !== "gemini") {
  throw new Error('AI_MODE phải là "mock" hoặc "gemini".');
}

// Thời gian chờ mỗi lần gọi AI (ms).
const aiTimeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);
if (!Number.isInteger(aiTimeoutMs) || aiTimeoutMs <= 0) {
  throw new Error("AI_TIMEOUT_MS phải là số nguyên dương.");
}

// Giới hạn truy cập ba API AI (ms).
const rateLimitWindowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60000);
if (!Number.isInteger(rateLimitWindowMs) || rateLimitWindowMs <= 0) {
  throw new Error("RATE_LIMIT_WINDOW_MS phải là số nguyên dương.");
}

const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 10);
if (!Number.isInteger(rateLimitMax) || rateLimitMax <= 0) {
  throw new Error("RATE_LIMIT_MAX phải là số nguyên dương.");
}

// Chế độ gemini bắt buộc có key và model; mock không cần hai biến này.
if (aiMode === "gemini") {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY là bắt buộc khi AI_MODE=gemini.");
  }
  if (!process.env.GEMINI_MODEL) {
    throw new Error("GEMINI_MODEL là bắt buộc khi AI_MODE=gemini.");
  }
}

// Xuất cấu hình để các file khác sử dụng.
module.exports = {
  port,
  clientOrigins,
  nodeEnv: process.env.NODE_ENV || "development",
  aiMode,
  aiTimeoutMs,
  rateLimitWindowMs,
  rateLimitMax,
};