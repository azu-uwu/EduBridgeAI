# EduBridge AI — Danh sách công việc backend

Ngày: 11/11/2026. [x] = người dùng đã báo hoàn thành; không thay cho kiểm tra repository. [ ] = chưa có bằng chứng hoàn thành. AI cập nhật sau khi kiểm tra, kèm lệnh/kết quả ngắn trong báo cáo.

## Giai đoạn 0 — Nền tảng đã được báo cáo

- [x] T001 Khởi tạo backend/package.json; cài Express 5, cors, dotenv và nodemon devDependency.
- [x] T002 Cấu hình CommonJS, npm start và npm run dev.
- [x] T003 Tạo thư mục config/routes/controllers/services/middlewares/prompts.
- [x] T004 Tạo .gitignore, .env.example, cấu hình local và env.js; người dùng báo đọc cấu hình thành công.
- [x] T005 Kiểm tra thực tế T001–T004 trên repository; giữ thay đổi đang có, kiểm tra .env/node_modules bị ignore và chưa bị tracked. Không khẳng định đã push nếu chưa xem bằng chứng.

Điều kiện qua giai đoạn: mô tả đúng hiện trạng, npm scripts và cấu hình hoạt động; chưa cần gọi Gemini.

## Giai đoạn 1 — Health và xử lý HTTP cơ bản

Phụ thuộc: T005.

- [x] T010 Viết health.controller.js và health.routes.js theo hợp đồng; không gọi provider.
- [x] T011 Viết app.js export app và server.js listen PORT; lỗi EADDRINUSE rõ ràng.
- [x] T012 Viết notFound và error middleware; JSON lỗi không có stack/key; dùng AppError cho lỗi dự kiến.
- [x] T013 CORS allowlist từ CLIENT_ORIGINS, không credentials; Postman không Origin gọi được; preflight hợp lệ.
- [x] T014 Kiểm tra health 200, đường dẫn lạ 404, CORS allowed/disallowed và OPTIONS. Ghi kết quả; không coi CORS là đăng nhập.

Điều kiện qua giai đoạn: npm run dev hoạt động và HTTP phản hồi đúng; không đánh dấu nếu mới tạo file trống.

## Giai đoạn 2 — Ba API mock và hợp đồng

Phụ thuộc: T010–T014.

- [x] T020 Bổ sung cấu hình AI_MODE/timeout/limiter, validate env; mock không cần key/model, gemini cần cả hai.
- [x] T021 Tạo schema request: strict object; trim; đếm Unicode code point; text 1–5000, term 1–100, context 0–1000; optional chỉ áp dụng khi thiếu, không áp dụng null.
- [x] T022 Tạo ai.routes.js cho ba POST; limiter → Content-Type → JSON parser 100 KiB → validation, sau CORS. Không parse body của route lạ.
- [x] T023 Viết mock service và controllers: đúng data schema, meta.mode=mock; level mặc định basic; term/level phản ánh input chuẩn hóa.
- [x] T024 Cấu hình limiter dùng chung 10/IP/60 giây, không áp health/OPTIONS; 429 JSON và Retry-After. Trust proxy false ở local.
- [x] T025 Hoàn thiện errors 400/403/404/413/415/429/500 theo hợp đồng.
- [x] T026 Thêm node:test + supertest và npm test; tests happy path, validation/Unicode/biên, parser, CORS và limiter. Dùng fake/injection, không key thật.

Điều kiện qua giai đoạn: FE gọi được ba API bằng mock; tests pass; không âm thầm trả mock ở chế độ gemini.

Bằng chứng: npm test → 38/38 pass; smoke test GET /api/health → 200.

## Giai đoạn 3 — Gemini và chất lượng nội dung

Phụ thuộc: T020–T026.

- [x] T030 Cài @google/genai tương thích CommonJS; kiểm tra tài liệu hiện hành về model/structured output/timeout/retry; commit lockfile.
  - Bằng evidence: `@google/genai` đã cài (xem package.json/package-lock.json), `require("@google/genai")` hoạt động CommonJS, SDK hỗ trợ `responseMimeType: "application/json"`, `responseJsonSchema`, `abortSignal` và `ApiError.status`.
- [x] T031 Viết gemini.service.js dùng model/key từ env; một request/provider call; deadline 30000 ms có cơ chế hủy, không retry tự động.
  - File mới: `backend/src/services/gemini.service.js` (lazy `GoogleGenAI`, `AbortController` + `abortSignal`, `setTimeout` deadline, không retry).
- [x] T032 Viết simplify prompt theo ba cấp độ; giữ số liệu, tên riêng, phủ định; thêm response schema.
  - File mới: `backend/src/prompts/simplify.prompt.js`.
- [x] T033 Viết explain prompt: nghĩa theo ngữ cảnh, 1–3 ví dụ; cannot_process nếu không đủ cơ sở; thêm response schema.
  - File mới: `backend/src/prompts/explain.prompt.js`.
- [x] T034 Viết summarize prompt: summary và 1–7 keyPoints, không thêm dữ kiện; thêm response schema.
  - File mới: `backend/src/prompts/summarize.prompt.js`.
- [x] T035 Kiểm tra output runtime bằng zod; term/level lấy từ input, không để provider quyết định.
  - File mới: `backend/src/schemas/ai.response.schemas.js`; `ai.controller.js` dùng `level`/`term` từ `req.body` đã chuẩn hóa.
- [x] T036 Ánh xạ từ chối 422, schema/JSON sai 502, provider/quota/network 503, deadline 504. Không trả lỗi SDK thô.
  - `gemini.service.js` hàm `mapProviderError` và `parseAndCheck`; `ai.service.js` `validateOutput` -> 502.
- [x] T037 Test provider thành công/từ chối/hỏng schema/quota/network/timeout bằng stub. Chứng minh input sai không gọi provider, deadline kích hoạt hủy, không có retry ngoài dự kiến.
  - File mới: `backend/tests/gemini.test.js`; `tests/ai.test.js` cập nhật kiểm tra chế độ gemini. `npm test` → 63/63 pass, không cần Internet/key thật.

- [x] T038 Chạy đánh giá thủ công tối thiểu 5 ví dụ/chức năng với Gemini thật; ghi kết quả và hạn chế. Nếu chưa có key, để chưa hoàn thành và nêu rõ blocker; các task độc lập vẫn tiếp tục.

## Giai đoạn 4 — Tích hợp và bàn giao

Phụ thuộc: các API ổn định; T038 cần để kết luận đã kiểm tra AI thật.

- [ ] T040 Tạo Postman collection cho health/ba API, một số lỗi tiêu biểu và test assertions status/schema; environment chỉ chứa baseUrl, không key.
- [ ] T041 Viết backend/README.md hướng dẫn PowerShell, npm ci, .env.example, mock/gemini, model, CORS, scripts và lỗi thường gặp.
- [ ] T042 Cung cấp JSON mẫu cho FE và kiểm tra FE đang dùng đúng tên trường; không sửa FE khi chưa được yêu cầu.
- [ ] T043 Rà secrets, package-lock, lỗi công khai, log nội dung và config; npm test pass, npm start smoke test. Audit dependency và xử lý theo mức ảnh hưởng; không chạy npm audit fix --force mù quáng.
- [ ] T044 Khi có môi trường và yêu cầu triển khai: cấu hình HTTPS/origin/proxy đúng, secrets và quota; smoke test. Nếu mới local, để task này chưa hoàn thành.

## Bằng chứng hoàn thành

Báo cáo theo task ID: file đã đổi, lệnh kiểm tra, kết quả, phần chưa kiểm tra. Có thể ghi thêm cột trạng thái thực tế sau khi repository đã được kiểm tra. Không đánh dấu cả giai đoạn chỉ vì code compile.
