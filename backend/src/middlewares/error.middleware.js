function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    let status = 500;
    let code = "INTERNAL_SERVER_ERROR";
    let message = "Hệ thống gặp lỗi. Vui lòng thử lại sau.";

    if (err.type === "entity.parse.failed") {
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
    }

    if (status === 500) {
        console.error("Lỗi nội bộ:", err.name);
    }

    res.status(status).json({
        success: false,
        error: {
            code,
            message,
        },
    });
}

module.exports = errorHandler;