const AppError = require("../utils/app-error");

function requireJsonContentType(req, res, next) {
    const contentType = (req.get("Content-Type") || "").trim();

    if (!contentType.toLowerCase().startsWith("application/json")) {
        const err = new AppError(
            415,
            "UNSUPPORTED_MEDIA_TYPE",
            "Yêu cầu Content-Type: application/json."
        );
        return next(err);
    }

    next();
}

module.exports = { requireJsonContentType };
