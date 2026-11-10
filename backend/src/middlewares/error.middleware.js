const AppError = require("../utils/app-error");

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    let status = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "Hệ thống gặp lỗi. Vui lòng thử lại sau.";
    let details = undefined;

    if (err instanceof AppError) {
        status = err.status;
        code = err.code;
        message = err.message;
        details = err.details;
    } else if (err.type === "entity.parse.failed") {
        status = 400;
        code = "INVALID_JSON";
        message = "Dữ liệu JSON không hợp lệ.";
    } else if (err.type === "entity.too.large") {
        status = 413;
        code = "PAYLOAD_TOO_LARGE";
        message = "Dữ liệu gửi lên vượt quá kích thước cho phép.";
    } else if (err.code === "CORS_NOT_ALLOWED") {
        status = 403;
        code = "CORS_NOT_ALLOWED";
        message = "Địa chỉ frontend chưa được cấu hình CORS.";
    } else if (err.status) {
        status = err.status;
        code = err.code || "INTERNAL_SERVER_ERROR";
        message = err.message;
        details = err.details;
    }

    if (status === 500) {
        console.error("Lỗi nội bộ:", err.name);
    }

    const body = {
        success: false,
        error: {
            code,
            message,
        },
    };
    if (details) {
        body.error.details = details;
    }

    res.status(status).json(body);
}

module.exports = errorHandler;