const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");
const AppError = require("../src/utils/app-error");
const { createApp } = require("../src/app");

// ---------- Helper: nạp lại ai.service / gemini.service với một chế độ ----------

function reloadServices(mode) {
    const origAiMode = process.env.AI_MODE;
    const origKey = process.env.GEMINI_API_KEY;
    const origModel = process.env.GEMINI_MODEL;
    const origTimeout = process.env.AI_TIMEOUT_MS;

    process.env.AI_MODE = mode;
    if (mode === "gemini") {
        process.env.GEMINI_API_KEY = "test-key";
        process.env.GEMINI_MODEL = "test-model";
    } else {
        delete process.env.GEMINI_API_KEY;
        delete process.env.GEMINI_MODEL;
    }
    // AI_TIMEOUT_MS phải luôn hợp lệ khi nạp lại env.js.
    process.env.AI_TIMEOUT_MS = "30000";

    const mods = [
        "../src/config/env",
        "../src/services/mock.service",
        "../src/services/gemini.service",
        "../src/services/ai.service",
    ];
    mods.forEach((m) => delete require.cache[require.resolve(m)]);

    const aiService = require("../src/services/ai.service");
    const geminiService = require("../src/services/gemini.service");

    return {
        aiService,
        geminiService,
        restore: () => {
            process.env.AI_MODE = origAiMode;
            if (origKey === undefined) delete process.env.GEMINI_API_KEY;
            else process.env.GEMINI_API_KEY = origKey;
            if (origModel === undefined) delete process.env.GEMINI_MODEL;
            else process.env.GEMINI_MODEL = origModel;
            if (origTimeout === undefined) delete process.env.AI_TIMEOUT_MS;
            else process.env.AI_TIMEOUT_MS = origTimeout;
            mods.forEach((m) => delete require.cache[require.resolve(m)]);
            delete require.cache[require.resolve("../src/services/gemini.service")];
        },
    };
}

// ---------- mapProviderError ----------

test("mapProviderError: ApiError 429 (quota) -> 503 AI_UNAVAILABLE", () => {
    const { mapProviderError } = require("../src/services/gemini.service");
    const { ApiError } = require("@google/genai");
    const mapped = mapProviderError(new ApiError({ status: 429, message: "quota exceeded" }));
    assert.strictEqual(mapped.status, 503);
    assert.strictEqual(mapped.code, "AI_UNAVAILABLE");
});

test("mapProviderError: ApiError >=500 -> 503 AI_UNAVAILABLE", () => {
    const { mapProviderError } = require("../src/services/gemini.service");
    const { ApiError } = require("@google/genai");
    const mapped = mapProviderError(new ApiError({ status: 503, message: "sai" }));
    assert.strictEqual(mapped.status, 503);
    assert.strictEqual(mapped.code, "AI_UNAVAILABLE");
});

test("mapProviderError: ApiError 403/404 (key/model sai) -> 503 AI_UNAVAILABLE", () => {
    const { mapProviderError } = require("../src/services/gemini.service");
    const { ApiError } = require("@google/genai");
    for (const status of [403, 404]) {
        const mapped = mapProviderError(new ApiError({ status, message: "x" }));
        assert.strictEqual(mapped.status, 503);
        assert.strictEqual(mapped.code, "AI_UNAVAILABLE");
    }
});

test("mapProviderError: lỗi mạng ECONNREFUSED -> 503 AI_UNAVAILABLE", () => {
    const { mapProviderError } = require("../src/services/gemini.service");
    const netErr = new Error("connect ECONNREFUSED");
    netErr.code = "ECONNREFUSED";
    const mapped = mapProviderError(netErr);
    assert.strictEqual(mapped.status, 503);
    assert.strictEqual(mapped.code, "AI_UNAVAILABLE");
});

test("mapProviderError: ETIMEDOUT -> 504 AI_TIMEOUT", () => {
    const { mapProviderError } = require("../src/services/gemini.service");
    const netErr = new Error("connect ETIMEDOUT");
    netErr.code = "ETIMEDOUT";
    const mapped = mapProviderError(netErr);
    assert.strictEqual(mapped.status, 504);
    assert.strictEqual(mapped.code, "AI_TIMEOUT");
});

test("mapProviderError: AbortError -> 504 AI_TIMEOUT", () => {
    const { mapProviderError } = require("../src/services/gemini.service");
    const abortErr = new DOMException("The operation was aborted.", "AbortError");
    const mapped = mapProviderError(abortErr);
    assert.strictEqual(mapped.status, 504);
    assert.strictEqual(mapped.code, "AI_TIMEOUT");
});

test("mapProviderError: lỗi không xác định -> 503 AI_UNAVAILABLE", () => {
    const { mapProviderError } = require("../src/services/gemini.service");
    const mapped = mapProviderError(new Error("bất ngờ"));
    assert.strictEqual(mapped.status, 503);
    assert.strictEqual(mapped.code, "AI_UNAVAILABLE");
});

// ---------- parseAndCheck ----------

test("parseAndCheck: phản hồi trống -> 502 AI_INVALID_RESPONSE", () => {
    const { parseAndCheck } = require("../src/services/gemini.service");
    assert.throws(
        () => parseAndCheck({ text: "" }),
        (err) => err.status === 502 && err.code === "AI_INVALID_RESPONSE"
    );
});

test("parseAndCheck: JSON hỏng -> 502 AI_INVALID_RESPONSE", () => {
    const { parseAndCheck } = require("../src/services/gemini.service");
    assert.throws(
        () => parseAndCheck({ text: "{not json" }),
        (err) => err.status === 502 && err.code === "AI_INVALID_RESPONSE"
    );
});

test("parseAndCheck: JSON không phải đối tượng -> 502 AI_INVALID_RESPONSE", () => {
    const { parseAndCheck } = require("../src/services/gemini.service");
    assert.throws(
        () => parseAndCheck({ text: "[1,2,3]" }),
        (err) => err.status === 502 && err.code === "AI_INVALID_RESPONSE"
    );
});

test("parseAndCheck: cannot_process=true -> 422 AI_CANNOT_PROCESS", () => {
    const { parseAndCheck } = require("../src/services/gemini.service");
    assert.throws(
        () =>
            parseAndCheck({
                text: JSON.stringify({ cannot_process: true, ly_do: "Không đủ cơ sở." }),
            }),
        (err) => err.status === 422 && err.code === "AI_CANNOT_PROCESS" && /Không đủ cơ sở/.test(err.message)
    );
});

test("parseAndCheck: đối tượng hợp lệ -> trả về dữ liệu", () => {
    const { parseAndCheck } = require("../src/services/gemini.service");
    const parsed = parseAndCheck({
        text: JSON.stringify({ simplifiedText: "Đã xử lý.", cannot_process: false }),
    });
    assert.strictEqual(parsed.simplifiedText, "Đã xử lý.");
});

// ---------- generateWithDeadline: hủy thực tế và không retry ----------

function makeAbortAwareClient(generateContentImpl) {
    return {
        models: {
            generateContent: async (params) => {
                const signal = params.config && params.config.abortSignal;
                return new Promise((resolve, reject) => {
                    const onAbort = () =>
                        reject(new DOMException("The operation was aborted.", "AbortError"));
                    if (signal && signal.aborted) {
                        return onAbort();
                    }
                    signal.addEventListener("abort", onAbort, { once: true });
                    generateContentImpl()
                        .then((res) => {
                            signal.removeEventListener("abort", onAbort);
                            resolve(res);
                        })
                        .catch(reject);
                });
            },
        },
    };
}

test("generateWithDeadline: provider phản hồi kịp thời -> trả về response", async () => {
    const { generateWithDeadline, getClient, resetClient } =
        require("../src/services/gemini.service");
    const origKey = process.env.GEMINI_API_KEY;
    const origModel = process.env.GEMINI_MODEL;
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "test-model";
    resetClient();
    const fakeResponse = { text: JSON.stringify({ simplifiedText: "ok" }) };
    const client = getClient();
    client.models.generateContent = async () => fakeResponse;
    try {
        const res = await generateWithDeadline(
            "test-model",
            "sys",
            "user content",
            { $schema: "http://json-schema.org/draft-07/schema#", type: "object", properties: {} }
        );
        assert.strictEqual(res, fakeResponse);
    } finally {
        resetClient();
        process.env.GEMINI_API_KEY = origKey;
        process.env.GEMINI_MODEL = origModel;
    }
});

test("generateWithDeadline: vượt hạn chờ -> 504 AI_TIMEOUT", async () => {
    const { generateWithDeadline, getClient, resetClient } =
        require("../src/services/gemini.service");
    const origKey = process.env.GEMINI_API_KEY;
    const origModel = process.env.GEMINI_MODEL;
    const origTimeout = process.env.AI_TIMEOUT_MS;
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "test-model";
    process.env.AI_TIMEOUT_MS = "50";
    resetClient();
    // Provider không bao giờ phản hồi, nhưng tuân theo abortSignal => deadline hủy thực tế.
    const client = getClient();
    client.models.generateContent = makeAbortAwareClient(() => new Promise(() => {})).models.generateContent;
    try {
        await assert.rejects(
            generateWithDeadline(
                "test-model",
                "sys",
                "user content",
                { $schema: "http://json-schema.org/draft-07/schema#", type: "object", properties: {} }
            ),
            (err) => err.status === 504 && err.code === "AI_TIMEOUT"
        );
    } finally {
        resetClient();
        if (origTimeout === undefined) delete process.env.AI_TIMEOUT_MS;
        else process.env.AI_TIMEOUT_MS = origTimeout;
        if (origKey === undefined) delete process.env.GEMINI_API_KEY;
        else process.env.GEMINI_API_KEY = origKey;
        if (origModel === undefined) delete process.env.GEMINI_MODEL;
        else process.env.GEMINI_MODEL = origModel;
    }
});

// ---------- ai.service ở chế độ gemini với provider stub ----------

function stubSimplify(geminiService, behavior) {
    const original = geminiService.simplify;
    geminiService.simplify = behavior;
    return original;
}

test("ai.service gemini: provider thành công -> dữ liệu và mode=gemini", async () => {
    const { aiService, geminiService, restore } = reloadServices("gemini");
    const original = stubSimplify(geminiService, async () => ({
        simplifiedText: "Bản đơn giản hóa.",
    }));
    try {
        const result = await aiService.simplify("Văn bản cần xử lý.", "basic");
        assert.strictEqual(result.mode, "gemini");
        assert.strictEqual(result.data.simplifiedText, "Bản đơn giản hóa.");
        assert.strictEqual(result.data.level, "basic");
    } finally {
        geminiService.simplify = original;
        restore();
    }
});

test("ai.service gemini: provider cannot_process -> 422 AI_CANNOT_PROCESS", async () => {
    const { aiService, geminiService, restore } = reloadServices("gemini");
    const original = stubSimplify(geminiService, async () => {
        throw new AppError(422, "AI_CANNOT_PROCESS", "Không đủ cơ sở.");
    });
    try {
        await assert.rejects(
            aiService.simplify("x", "basic"),
            (err) => err.status === 422 && err.code === "AI_CANNOT_PROCESS"
        );
    } finally {
        geminiService.simplify = original;
        restore();
    }
});

test("ai.service gemini: provider trả schema sai -> 502 AI_INVALID_RESPONSE", async () => {
    const { aiService, geminiService, restore } = reloadServices("gemini");
    const original = stubSimplify(geminiService, async () => ({
        cannot_process: false,
    }));
    try {
        await assert.rejects(
            aiService.simplify("x", "basic"),
            (err) => err.status === 502 && err.code === "AI_INVALID_RESPONSE"
        );
    } finally {
        geminiService.simplify = original;
        restore();
    }
});

test("ai.service gemini: provider quota/lỗi mạng -> 503 AI_UNAVAILABLE", async () => {
    const { aiService, geminiService, restore } = reloadServices("gemini");
    const original = stubSimplify(geminiService, async () => {
        throw new AppError(503, "AI_UNAVAILABLE", "Hết quota.");
    });
    try {
        await assert.rejects(
            aiService.simplify("x", "basic"),
            (err) => err.status === 503 && err.code === "AI_UNAVAILABLE"
        );
    } finally {
        geminiService.simplify = original;
        restore();
    }
});

test("ai.service gemini: provider timeout -> 504 AI_TIMEOUT", async () => {
    const { aiService, geminiService, restore } = reloadServices("gemini");
    const original = stubSimplify(geminiService, async () => {
        throw new AppError(504, "AI_TIMEOUT", "Vượt thời gian chờ.");
    });
    try {
        await assert.rejects(
            aiService.simplify("x", "basic"),
            (err) => err.status === 504 && err.code === "AI_TIMEOUT"
        );
    } finally {
        geminiService.simplify = original;
        restore();
    }
});

test("ai.service gemini: provider không được gọi lại sau lỗi (không retry)", async () => {
    const { aiService, geminiService, restore } = reloadServices("gemini");
    let calls = 0;
    const original = stubSimplify(geminiService, async () => {
        calls += 1;
        throw new AppError(503, "AI_UNAVAILABLE", "lỗi");
    });
    try {
        await assert.rejects(
            aiService.simplify("x", "basic"),
            (err) => err.status === 503
        );
        assert.strictEqual(calls, 1);
    } finally {
        geminiService.simplify = original;
        restore();
    }
});


// ---------- HTTP: chế độ gemini thành công gắn meta.mode=gemini ----------

test("HTTP /api/simplify chế độ gemini thành công -> meta.mode=gemini", async () => {
    const { geminiService, restore } = reloadServices("gemini");
    const original = stubSimplify(geminiService, async () => ({
        simplifiedText: "Đã đơn giản hóa.",
    }));
    const clearApp = [
        "../src/config/env",
        "../src/services/mock.service",
        "../src/services/ai.service",
        "../src/controllers/ai.controller",
        "../src/routes/ai.routes",
        "../src/app",
    ];
    clearApp.forEach((m) => delete require.cache[require.resolve(m)]);
    try {
        const { createApp: createGeminiApp } = require("../src/app");
        const app = createGeminiApp();
        const res = await request(app)
            .post("/api/simplify")
            .send({ text: "Nội dung kiểm tra.", level: "basic" });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.meta.mode, "gemini");
        assert.strictEqual(res.body.data.simplifiedText, "Đã đơn giản hóa.");
    } finally {
        geminiService.simplify = original;
        restore();
        clearApp.forEach((m) => delete require.cache[require.resolve(m)]);
    }
});

// ---------- HTTP: chế độ gemini lỗi không trả mock ----------

test("HTTP /api/simplify chế độ gemini provider lỗi -> 503, không trả mock", async () => {
    const { geminiService, restore } = reloadServices("gemini");
    const original = stubSimplify(geminiService, async () => {
        throw new AppError(503, "AI_UNAVAILABLE", "Lỗi provider.");
    });
    const clearApp = [
        "../src/config/env",
        "../src/services/mock.service",
        "../src/services/ai.service",
        "../src/controllers/ai.controller",
        "../src/routes/ai.routes",
        "../src/app",
    ];
    clearApp.forEach((m) => delete require.cache[require.resolve(m)]);
    try {
        const { createApp: createGeminiApp } = require("../src/app");
        const app = createGeminiApp();
        const res = await request(app)
            .post("/api/simplify")
            .send({ text: "Nội dung kiểm tra." });
        assert.strictEqual(res.status, 503);
        assert.strictEqual(res.body.error.code, "AI_UNAVAILABLE");
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.meta, undefined);
    } finally {
        geminiService.simplify = original;
        restore();
        clearApp.forEach((m) => delete require.cache[require.resolve(m)]);
    }
});

// ---------- HTTP: input sai không gọi provider ----------

test("HTTP /api/simplify chế độ gemini input sai -> 400 và provider không được gọi", async () => {
    const { geminiService, restore } = reloadServices("gemini");
    let calls = 0;
    const original = stubSimplify(geminiService, async () => {
        calls += 1;
        return {};
    });
    const clearApp = [
        "../src/config/env",
        "../src/services/mock.service",
        "../src/services/ai.service",
        "../src/controllers/ai.controller",
        "../src/routes/ai.routes",
        "../src/app",
    ];
    clearApp.forEach((m) => delete require.cache[require.resolve(m)]);
    try {
        const { createApp: createGeminiApp } = require("../src/app");
        const app = createGeminiApp();
        const res = await request(app).post("/api/simplify").send({ level: "basic" });
        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
        assert.strictEqual(calls, 0);
    } finally {
        geminiService.simplify = original;
        restore();
        clearApp.forEach((m) => delete require.cache[require.resolve(m)]);
    }
});

