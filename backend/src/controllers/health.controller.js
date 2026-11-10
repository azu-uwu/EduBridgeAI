function getHealth(req, res) {
    res.status(200).json({
        success: true,
        message: "Backend EduBridge AI đang hoạt động.",
        data: {
            status: "ok",
        },
    });
}

module.exports = { getHealth };