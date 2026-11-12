const assert = require("node:assert/strict");
const test = require("node:test");
const request = require("supertest");
const { createApp } = require("../src/app");

function makeApp(options = {}) {
  return createApp(options);
}

function resHasRetryAfter(res) {
  return res.headers["retry-after"] !== undefined;
}

// ---------- Health và 404 ----------

test("GET /api/health trả 200 đúng JSON hợp đồng", async (t) => {
  const app = makeApp();
  const res = await request(app).get("/api/health");
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.message, "Backend EduBridge AI đang hoạt động.");
  assert.strictEqual(res.body.data.status, "ok");
  assert.strictEqual(res.body.meta, undefined);
});

test("Đường dẫn không tồn tại trả 404 NOT_FOUND", async (t) => {
  const app = makeApp();
  const res = await request(app).get("/api/khong-ton-tai");
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.success, false);
  assert.strictEqual(res.body.error.code, "NOT_FOUND");
});

test("Phương thức không được đăng ký trả 404 NOT_FOUND", async (t) => {
  const app = makeApp();
  const res = await request(app).put("/api/simplify").send({ text: "x" });
  assert.strictEqual(res.status, 404);
  assert.strictEqual(res.body.error.code, "NOT_FOUND");
});

// ---------- Happy path ba API ----------

test("POST /api/simplify happy path", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send({ text: "Quang hợp là quá trình cây tạo chất dinh dưỡng." });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.meta.mode, "mock");
  assert.ok(typeof res.body.data.simplifiedText === "string");
  assert.ok(res.body.data.simplifiedText.trim().length > 0);
  assert.strictEqual(res.body.data.level, "basic");
});

test("POST /api/simplify level mặc định là basic", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send({ text: "Nội dung cần đơn giản hóa." });
  assert.strictEqual(res.body.data.level, "basic");
});

test("POST /api/simplify ba giá trị level hợp lệ", async (t) => {
  const app = makeApp();
  for (const level of ["basic", "intermediate", "advanced"]) {
    const res = await request(app)
      .post("/api/simplify")
      .send({ text: "Nội dung kiểm tra level.", level });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.level, level);
    assert.strictEqual(res.body.meta.mode, "mock");
  }
});

test("POST /api/explain happy path", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/explain")
    .send({ term: "quang hợp", context: "Cây xanh tạo chất dinh dưỡng." });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.meta.mode, "mock");
  assert.strictEqual(res.body.data.term, "quang hợp");
  assert.ok(typeof res.body.data.meaning === "string");
  assert.ok(res.body.data.meaning.trim().length > 0);
  assert.ok(Array.isArray(res.body.data.examples));
  assert.ok(res.body.data.examples.length >= 1);
  assert.ok(res.body.data.examples.length <= 3);
  for (const ex of res.body.data.examples) {
    assert.ok(typeof ex === "string");
    assert.ok(ex.trim().length > 0);
  }
});

test("POST /api/explain không context tương đương không có ngữ cảnh", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/explain")
    .send({ term: "quang hợp" });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.term, "quang hợp");
  assert.ok(typeof res.body.data.meaning === "string");
});

test("POST /api/summarize happy path", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/summarize")
    .send({ text: "Cây xanh cần ánh sáng để quang hợp. Qua quá trình này, cây tạo ra chất dinh dưỡng và giải phóng oxygen." });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.success, true);
  assert.strictEqual(res.body.meta.mode, "mock");
  assert.ok(typeof res.body.data.summary === "string");
  assert.ok(res.body.data.summary.trim().length > 0);
  assert.ok(Array.isArray(res.body.data.keyPoints));
  assert.ok(res.body.data.keyPoints.length >= 1);
  assert.ok(res.body.data.keyPoints.length <= 7);
  for (const p of res.body.data.keyPoints) {
    assert.ok(typeof p === "string");
    assert.ok(p.trim().length > 0);
  }
});

// ---------- Validation: thiếu trường, chuỗi trắng ----------

test("POST /api/simplify thiếu text trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app).post("/api/simplify").send({ level: "basic" });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
  assert.ok(Array.isArray(res.body.error.details));
  assert.ok(res.body.error.details.some((d) => d.field === "text"));
});

test("POST /api/simplify text chuỗi trắng sau trim trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app).post("/api/simplify").send({ text: "   " });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

test("POST /api/explain thiếu term trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app).post("/api/explain").send({});
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
  assert.ok(res.body.error.details.some((d) => d.field === "term"));
});

test("POST /api/summarize thiếu text trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app).post("/api/summarize").send({});
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

// ---------- Validation: sai kiểu, null, mảng, nguyên thủy ----------

test("POST /api/simplify text null trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app).post("/api/simplify").send({ text: null });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

test("POST /api/simplify body mảng trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app).post("/api/simplify").send([1, 2, 3]);
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

test("POST /api/simplify level sai enum trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send({ text: "Nội dung kiểm tra.", level: "chuyen_gia" });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
  assert.ok(res.body.error.details.some((d) => d.field === "level"));
});

test("POST /api/explain context null trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/explain")
    .send({ term: "quang hợp", context: null });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

// ---------- Validation: trường lạ ----------

test("POST /api/simplify có trường lạ trả VALIDATION_ERROR", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send({ text: "Nội dung.", level: "basic", truong_la: "abc" });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

// ---------- Biên text 5000/5001 ----------

test("POST /api/simplify text đúng 5000 ký tự sau trim được chấp nhận", async (t) => {
  const app = makeApp();
  const text = "a".repeat(5000);
  const res = await request(app).post("/api/simplify").send({ text });
  assert.strictEqual(res.status, 200);
});

test("POST /api/simplify text 5001 ký tự sau trim bị từ chối", async (t) => {
  const app = makeApp();
  const text = "a".repeat(5001);
  const res = await request(app).post("/api/simplify").send({ text });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

// ---------- Biên term 100/101 ----------

test("POST /api/explain term đúng 100 ký tự được chấp nhận", async (t) => {
  const app = makeApp();
  const term = "a".repeat(100);
  const res = await request(app).post("/api/explain").send({ term });
  assert.strictEqual(res.status, 200);
});

test("POST /api/explain term 101 ký tự bị từ chối", async (t) => {
  const app = makeApp();
  const term = "a".repeat(101);
  const res = await request(app).post("/api/explain").send({ term });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

// ---------- Biên context 1000/1001 ----------

test("POST /api/explain context đúng 1000 ký tự được chấp nhận", async (t) => {
  const app = makeApp();
  const context = "a".repeat(1000);
  const res = await request(app)
    .post("/api/explain")
    .send({ term: "quang hợp", context });
  assert.strictEqual(res.status, 200);
});

test("POST /api/explain context 1001 ký tự bị từ chối", async (t) => {
  const app = makeApp();
  const context = "a".repeat(1001);
  const res = await request(app)
    .post("/api/explain")
    .send({ term: "quang hợp", context });
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

// ---------- Đếm Unicode code point ----------

test("Đếm ký tự bằng Unicode code point (emoji đếm 1)", async (t) => {
  const app = makeApp();
  const text = "😀".repeat(5000);
  const res = await request(app).post("/api/simplify").send({ text });
  assert.strictEqual(res.status, 200);

  const textOver = "😀".repeat(5001);
  const resOver = await request(app).post("/api/simplify").send({ text: textOver });
  assert.strictEqual(resOver.status, 400);
  assert.strictEqual(resOver.body.error.code, "VALIDATION_ERROR");
});

test("Trim hai đầu và giữ khoảng trắng bên trong", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send({ text: "   Có khoảng trắng bên trong   ", level: "basic" });
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body.data.level, "basic");
  assert.ok(res.body.data.simplifiedText.includes("basic"));
});

// ---------- Content-Type thiếu/sai ----------

test("POST /api/simplify thiếu Content-Type trả 415", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send('{"text":"abc"}')
    .set("Content-Type", "text/plain");
  assert.strictEqual(res.status, 415);
  assert.strictEqual(res.body.error.code, "UNSUPPORTED_MEDIA_TYPE");
});

test("POST /api/simplify Content-Type sai trả 415", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send('{"text":"abc"}')
    .set("Content-Type", "application/x-www-form-urlencoded");
  assert.strictEqual(res.status, 415);
  assert.strictEqual(res.body.error.code, "UNSUPPORTED_MEDIA_TYPE");
});

test("POST /api/simplify Content-Type application/json; charset=utf-8 được chấp nhận", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send({ text: "Nội dung kiểm tra charset." })
    .set("Content-Type", "application/json; charset=utf-8");
  assert.strictEqual(res.status, 200);
});

// ---------- JSON sai cú pháp ----------

test("POST /api/simplify JSON sai cú pháp trả 400 INVALID_JSON", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .post("/api/simplify")
    .send("{not valid json}")
    .set("Content-Type", "application/json");
  assert.strictEqual(res.status, 400);
  assert.strictEqual(res.body.error.code, "INVALID_JSON");
});

// ---------- Body quá lớn 100 KiB ----------

test("POST /api/simplify body vượt 100 KiB trả 413 PAYLOAD_TOO_LARGE", async (t) => {
  const app = makeApp();
  const bigText = "x".repeat(102401);
  const res = await request(app)
    .post("/api/simplify")
    .send({ text: bigText })
    .set("Content-Type", "application/json");
  assert.strictEqual(res.status, 413);
  assert.strictEqual(res.body.error.code, "PAYLOAD_TOO_LARGE");
});

// ---------- CORS ----------

test("CORS Origin được phép", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .get("/api/health")
    .set("Origin", "http://localhost:5173");
  assert.strictEqual(res.status, 200);
});

test("CORS Origin bị từ chối trả 403", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .get("/api/health")
    .set("Origin", "http://evil.example.com");
  assert.strictEqual(res.status, 403);
  assert.strictEqual(res.body.error.code, "CORS_NOT_ALLOWED");
});

test("CORS preflight OPTIONS POST với Content-Type", async (t) => {
  const app = makeApp();
  const res = await request(app)
    .options("/api/simplify")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "POST")
    .set("Access-Control-Request-Headers", "Content-Type");
  assert.ok(res.status === 200 || res.status === 204);
});

// ---------- Limiter dùng chung ----------

test("Limiter dùng chung giữa ba route AI và 429 có Retry-After", async (t) => {
  const app = makeApp({ windowMs: 60000, max: 2 });

  const r1 = await request(app).post("/api/simplify").send({ text: "test 1" });
  assert.strictEqual(r1.status, 200);
  const r2 = await request(app).post("/api/explain").send({ term: "test 2" });
  assert.strictEqual(r2.status, 200);

  const r3 = await request(app).post("/api/summarize").send({ text: "test 3" });
  assert.strictEqual(r3.status, 429);
  assert.strictEqual(r3.body.error.code, "RATE_LIMITED");
  assert.ok(resHasRetryAfter(r3), "Phải có header Retry-After");
});

test("Health và OPTIONS không bị tính lượt limiter", async (t) => {
  const app = makeApp({ windowMs: 60000, max: 1 });

  await request(app).post("/api/simplify").send({ text: "test" });

  const health = await request(app).get("/api/health");
  assert.strictEqual(health.status, 200);

  const preflight = await request(app)
    .options("/api/simplify")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "POST");
  assert.ok(preflight.status === 200 || preflight.status === 204);
});

// ---------- Lỗi 500 kiểm soát ----------

test("Lỗi 404 không lộ stack trace", async (t) => {
  const app = makeApp();
  const res = await request(app).get("/api/khong-ton-tai");
  assert.strictEqual(res.status, 404);
  assert.ok(!res.body.error.stack);
});

// ---------- Chế độ gemini: lỗi provider phải trả lỗi thật, không trả mock ----------

const AppError = require("../src/utils/app-error");

function reloadGeminiApp() {
    const origAiMode = process.env.AI_MODE;
    const origKey = process.env.GEMINI_API_KEY;
    const origModel = process.env.GEMINI_MODEL;

    process.env.AI_MODE = "gemini";
    process.env.GEMINI_API_KEY = "test-key";
    process.env.GEMINI_MODEL = "test-model";

    const geminiService = require("../src/services/gemini.service");

    const clearModules = [
        "../src/config/env",
        "../src/services/mock.service",
        "../src/services/ai.service",
        "../src/controllers/ai.controller",
        "../src/routes/ai.routes",
        "../src/app",
    ];
    clearModules.forEach((m) => delete require.cache[require.resolve(m)]);

    return {
        geminiService,
        origAiMode,
        origKey,
        origModel,
        clearModules,
    };
}

function restoreGeminiEnv({ geminiService, origSimplify, origAiMode, origKey, origModel, clearModules }) {
    if (origSimplify !== undefined) {
        geminiService.simplify = origSimplify;
    }
    process.env.AI_MODE = origAiMode;
    if (origKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = origKey;
    if (origModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = origModel;
    clearModules.forEach((m) => delete require.cache[require.resolve(m)]);
    delete require.cache[require.resolve("../src/services/gemini.service")];
}

test("Chế độ gemini khi provider lỗi trả lỗi thật, không trả mock", async (t) => {
    const { geminiService, origAiMode, origKey, origModel, clearModules } = reloadGeminiApp();
    const originalSimplify = geminiService.simplify;
    geminiService.simplify = async () => {
        throw new AppError(503, "AI_UNAVAILABLE", "Lỗi provider.");
    };

    try {
        const { createApp: createGeminiApp } = require("../src/app");
        const geminiApp = createGeminiApp();

        const res = await request(geminiApp)
            .post("/api/simplify")
            .send({ text: "Nội dung kiểm tra gemini" });

        assert.strictEqual(res.status, 503);
        assert.strictEqual(res.body.error.code, "AI_UNAVAILABLE");
        assert.strictEqual(res.body.success, false);
        assert.strictEqual(res.body.meta, undefined);
        // Không phải dữ liệu mẫu mock.
        assert.ok(
            !res.body.data ||
                res.body.data.simplifiedText !== `[gemini] Nội dung kiểm tra gemini`
        );
    } finally {
        restoreGeminiEnv({
            geminiService,
            origSimplify: originalSimplify,
            origAiMode,
            origKey,
            origModel,
            clearModules,
        });
    }
});

test("Chế độ gemini thành công gắn meta.mode=gemini, không phải mock", async (t) => {
    const { geminiService, origAiMode, origKey, origModel, clearModules } = reloadGeminiApp();
    const originalSimplify = geminiService.simplify;
    geminiService.simplify = async () => ({
        simplifiedText: "Đây là bản đơn giản hóa.",
    });

    try {
        const { createApp: createGeminiApp } = require("../src/app");
        const geminiApp = createGeminiApp();

        const res = await request(geminiApp)
            .post("/api/simplify")
            .send({ text: "Nội dung cần đơn giản hóa.", level: "basic" });

        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.strictEqual(res.body.meta.mode, "gemini");
        assert.strictEqual(res.body.meta.mode !== "mock", true);
        assert.strictEqual(res.body.data.simplifiedText, "Đây là bản đơn giản hóa.");
        assert.strictEqual(res.body.data.level, "basic");
    } finally {
        restoreGeminiEnv({
            geminiService,
            origSimplify: originalSimplify,
            origAiMode,
            origKey,
            origModel,
            clearModules,
        });
    }
});

test("Chế độ gemini input sai không gọi provider", async (t) => {
    const { geminiService, origAiMode, origKey, origModel, clearModules } = reloadGeminiApp();
    let providerCalled = 0;
    const originalSimplify = geminiService.simplify;
    geminiService.simplify = async () => {
        providerCalled += 1;
        throw new Error("không được gọi");
    };

    try {
        const { createApp: createGeminiApp } = require("../src/app");
        const geminiApp = createGeminiApp();

        const res = await request(geminiApp)
            .post("/api/simplify")
            .send({ level: "basic" }); // thiếu text

        assert.strictEqual(res.status, 400);
        assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
        assert.strictEqual(providerCalled, 0);
    } finally {
        restoreGeminiEnv({
            geminiService,
            origSimplify: originalSimplify,
            origAiMode,
            origKey,
            origModel,
            clearModules,
        });
    }
});


// ---------- POST /api/explain-difficult-words ----------

function stubMockExplainDifficultWordsAndCreateApp(stubFn) {
    const mods = [
        "../src/config/env",
        "../src/services/mock.service",
        "../src/services/ai.service",
        "../src/controllers/ai.controller",
        "../src/routes/ai.routes",
        "../src/app",
    ];
    mods.forEach((m) => delete require.cache[require.resolve(m)]);

    const app = require("../src/app").createApp();

    const mockService = require("../src/services/mock.service");
    const original = mockService.explainDifficultWords;
    mockService.explainDifficultWords = stubFn;

    return {
        app,
        restore: () => {
            mockService.explainDifficultWords = original;
            mods.forEach((m) => delete require.cache[require.resolve(m)]);
        },
    };
}

test("POST /api/explain-difficult-words happy path", async (t) => {
    const app = makeApp();
    const res = await request(app)
        .post("/api/explain-difficult-words")
        .send({ text: "Quang hợp là quá trình cây tạo chất dinh dưỡng từ ánh sáng." });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.meta.mode, "mock");
    assert.ok(Array.isArray(res.body.data.words));
    assert.ok(res.body.data.words.length >= 1);
    assert.ok(res.body.data.words.length <= 8);
    for (const w of res.body.data.words) {
        assert.ok(typeof w.word === "string" && w.word.trim().length > 0);
        assert.ok(typeof w.meaning === "string" && w.meaning.trim().length > 0);
        assert.ok(typeof w.example === "string" && w.example.trim().length > 0);
    }
});

test("POST /api/explain-difficult-words thiếu text trả 400", async (t) => {
    const app = makeApp();
    const res = await request(app).post("/api/explain-difficult-words").send({});
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

test("POST /api/explain-difficult-words text sai kiểu trả 400", async (t) => {
    const app = makeApp();
    const res = await request(app).post("/api/explain-difficult-words").send({ text: 123 });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

test("POST /api/explain-difficult-words text chỉ khoảng trắng trả 400", async (t) => {
    const app = makeApp();
    const res = await request(app).post("/api/explain-difficult-words").send({ text: "   " });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

test("POST /api/explain-difficult-words trường lạ bị chặn", async (t) => {
    const app = makeApp();
    const res = await request(app)
        .post("/api/explain-difficult-words")
        .send({ text: "Nội dung kiểm tra.", extra: "x" });
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.error.code, "VALIDATION_ERROR");
});

test("POST /api/explain-difficult-words AI trả danh sách rỗng vẫn thành công", async (t) => {
    const { app, restore } = stubMockExplainDifficultWordsAndCreateApp(() => ({
        words: [],
    }));
    try {
        const res = await request(app)
            .post("/api/explain-difficult-words")
            .send({ text: "Nội dung không có từ khó." });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.success, true);
        assert.deepStrictEqual(res.body.data.words, []);
        assert.strictEqual(res.body.meta.mode, "mock");
    } finally {
        restore();
    }
});

test("POST /api/explain-difficult-words loại từ trùng và từ không có trong đoạn", async (t) => {
    const { app, restore } = stubMockExplainDifficultWordsAndCreateApp(() => ({
        words: [
            { word: "quang hợp", meaning: "Ngã 1", example: "Ví dụ 1" },
            { word: "QUANG HỢP", meaning: "Ngã 2", example: "Ví dụ 2" }, // trùng (khác hoa thường)
            { word: "không có trong đoạn", meaning: "Ngã 3", example: "Ví dụ 3" }, // không có trong văn bản
        ],
    }));
    try {
        const res = await request(app)
            .post("/api/explain-difficult-words")
            .send({ text: "Quang hợp là quá trình cây tạo chất dinh dưỡng." });
        assert.strictEqual(res.status, 200);
        assert.strictEqual(res.body.data.words.length, 1);
        assert.strictEqual(res.body.data.words[0].word, "quang hợp");
    } finally {
        restore();
    }
});
