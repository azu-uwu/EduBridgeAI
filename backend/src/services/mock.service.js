// Dịch vụ mock trả về dữ liệu minh họa, đúng schema hợp đồng, gắn nhãn mock.
// Không giả vờ đã xử lý bằng AI thật. Kết quả xác định để kiểm thử.

function simplify(text, level) {
    return {
        simplifiedText: `[${level}] ${text}`,
        level,
    };
}

function explain(term, context) {
    const meaning = context
        ? `Nghĩa của "${term}" trong ngữ cảnh: ${context}`
        : `Nghĩa thông thường của "${term}".`;
    return {
        term,
        meaning,
        examples: [`Ví dụ sử dụng từ "${term}" trong câu văn.`],
    };
}

function summarize(text) {
    const preview = text.trim().slice(0, 60);
    return {
        summary: `Bản tóm tắt nội dung: ${preview}`,
        keyPoints: [`Ý chính từ đoạn văn: ${preview}`],
    };
}

function explainDifficultWords(text) {
    const preview = text.trim().slice(0, 60);
    return {
        words: [
            {
                word: preview,
                meaning: `Nghĩa minh họa của "${preview}".`,
                example: `Ví dụ sử dụng "${preview}" trong câu văn.`,
            },
        ],
    };
}

module.exports = {
    simplify,
    explain,
    summarize,
    explainDifficultWords,
};
