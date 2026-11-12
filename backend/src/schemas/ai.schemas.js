const z = require("zod");

// Đếm ký tự bằng Unicode code point sau khi trim (theo hợp đồng API).
function unicodeCodePointLength(value) {
    return Array.from(value).length;
}

const textField = z
    .string()
    .trim()
    .refine(
        (val) => unicodeCodePointLength(val) >= 1,
        { message: "Vui lòng nhập nội dung văn bản." }
    )
    .refine(
        (val) => unicodeCodePointLength(val) <= 5000,
        { message: "Văn bản quá dài (tối đa 5.000 ký tự)." }
    );

const termField = z
    .string()
    .trim()
    .refine(
        (val) => unicodeCodePointLength(val) >= 1,
        { message: "Vui lòng nhập từ hoặc cụm từ cần giải thích." }
    )
    .refine(
        (val) => unicodeCodePointLength(val) <= 100,
        { message: "Từ quá dài (tối đa 100 ký tự)." }
    );

const contextField = z
    .string()
    .trim()
    .refine(
        (val) => unicodeCodePointLength(val) <= 1000,
        { message: "Ngữ cảnh quá dài (tối đa 1.000 ký tự)." }
    );

const levelField = z
    .enum(["basic", "intermediate", "advanced"], {
        errorMap: () => ({ message: "Level phải là basic, intermediate hoặc advanced." }),
    })
    .default("basic");

const simplifySchema = z
    .object({
        text: textField,
        level: levelField,
    })
    .strict();

const explainSchema = z
    .object({
        term: termField,
        context: contextField.optional(),
    })
    .strict();

const summarizeSchema = z
    .object({
        text: textField,
    })
    .strict();

const explainDifficultWordsSchema = z
    .object({
        text: textField,
    })
    .strict();

module.exports = {
    simplifySchema,
    explainSchema,
    summarizeSchema,
    explainDifficultWordsSchema,
};
