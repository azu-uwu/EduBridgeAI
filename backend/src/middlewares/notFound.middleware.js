function notFound(req, res) {
    res.status(404).json({
        success: false,
        error: {
            code: "NOT_FOUND",
            message: "API không tồn tại.",
        },
    });
}

module.exports = notFound;