function validate(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                field: issue.path.length > 0 ? issue.path.join(".") : "body",
                message: issue.message,
            }));

            const err = new Error("Dữ liệu đầu vào không hợp lệ.");
            err.status = 400;
            err.code = "VALIDATION_ERROR";
            err.details = details;
            return next(err);
        }

        req.body = result.data;
        next();
    };
}

module.exports = { validate };
