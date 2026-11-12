const z = require("zod");

// Schema kiểm tra đầu ra từ Gemini (theo hợp đồng API). Dùng sau khi nhận phản hồi.
// cannot_process / ly_do là trường nội bộ dùng để biểu thị từ chối xử lý,
// không được trả thẳng cho frontend.

const simplifyOutputSchema = z
    .object({
        simplifiedText: z
            .string()
            .min(1, "simplifiedText không được để trống."),
        cannot_process: z.boolean().optional(),
        ly_do: z.string().optional(),
    })
    .strict();

const explainOutputSchema = z
    .object({
        meaning: z.string().min(1, "meaning không được để trống."),
        examples: z
            .array(z.string().min(1))
            .min(1, "examples phải có ít nhất 1 phần tử.")
            .max(3, "examples tối đa 3 phần tử."),
        cannot_process: z.boolean().optional(),
        ly_do: z.string().optional(),
    })
    .strict();

const summarizeOutputSchema = z
    .object({
        summary: z.string().min(1, "summary không được để trống."),
        keyPoints: z
            .array(z.string().min(1))
            .min(1, "keyPoints phải có ít nhất 1 phần tử.")
            .max(7, "keyPoints tối đa 7 phần tử."),
        cannot_process: z.boolean().optional(),
        ly_do: z.string().optional(),
    })
    .strict();

const explainDifficultWordsOutputSchema = z
    .object({
        words: z
            .array(
                z.object({
                    word: z.string().min(1, "word không được để trống."),
                    meaning: z.string().min(1, "meaning không được để trống."),
                    example: z.string().min(1, "example không được để trống."),
                })
            )
            .max(8, "words tối đa 8 phần tử."),
        cannot_process: z.boolean().optional(),
        ly_do: z.string().optional(),
    })
    .strict();

module.exports = {
    simplifyOutputSchema,
    explainOutputSchema,
    summarizeOutputSchema,
    explainDifficultWordsOutputSchema,
};
