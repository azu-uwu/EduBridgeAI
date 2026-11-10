const AppError = require("../utils/app-error");
const mockService = require("./mock.service");
const { aiMode } = require("../config/env");

// Chọn chế độ và trả mock hoặc báo lỗi khi chưa tích hợp provider.
// Chưa gọi Gemini thật ở giai đoạn này.

function simplify(text, level) {
    if (aiMode === "gemini") {
        throw new AppError(
            503,
            "AI_UNAVAILABLE",
            "Chế độ gemini chưa được tích hợp tại giai đoạn này."
        );
    }
    return mockService.simplify(text, level);
}

function explain(term, context) {
    if (aiMode === "gemini") {
        throw new AppError(
            503,
            "AI_UNAVAILABLE",
            "Chế độ gemini chưa được tích hợp tại giai đoạn này."
        );
    }
    return mockService.explain(term, context);
}

function summarize(text) {
    if (aiMode === "gemini") {
        throw new AppError(
            503,
            "AI_UNAVAILABLE",
            "Chế độ gemini chưa được tích hợp tại giai đoạn này."
        );
    }
    return mockService.summarize(text);
}

module.exports = {
    simplify,
    explain,
    summarize,
};
