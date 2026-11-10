# EduBridge AI — Kế hoạch kỹ thuật backend

Ngày: 11/11/2026. Đọc cùng constitution.md, spec.md và api-contract.md.

## 1. Hiện trạng theo thông tin người dùng

Đã cài express@5, cors, dotenv và nodemon (devDependency). package.json dùng CommonJS, start="node src/server.js", dev="nodemon src/server.js". Người dùng xác nhận đã tạo cấu trúc, .gitignore, .env, .env.example và env.js; kiểm tra cấu hình đã thành công. Chưa có bằng chứng health route, server hoặc kiểm thử HTTP đã chạy. AI phải kiểm tra repository trên máy người dùng trước khi sửa; không chạy npm init lại hoặc ghi đè cấu hình đã có.

## 2. Công nghệ

- Node.js 24 cho môi trường phát triển dự kiến; JavaScript CommonJS; Express 5.
- cors, dotenv; nodemon cho dev. Bổ sung @google/genai, zod, express-rate-limit khi làm phần liên quan, chọn bản tương thích đã kiểm tra và commit lockfile.
- node:test + supertest cho kiểm thử HTTP. Không thêm framework test thứ hai.
- Gemini SDK chỉ ở service. Kiểm tra hướng dẫn chính thức và cách import hiện hành: nếu SDK không hỗ trợ require, dùng dynamic import trong service hoặc khởi tạo async, không đổi toàn dự án sang ESM tùy tiện.
- Không database, session, JWT, Docker bắt buộc hoặc framework FE.

## 3. Cấu trúc dự kiến

| Đường dẫn | Trách nhiệm |
| --- | --- |
| src/app.js | Tạo app, gắn CORS/routes/notFound/error handler; export app, không listen |
| src/server.js | Đọc config, khởi động HTTP server, xử lý lỗi cổng và đóng server khi dừng |
| src/config/env.js | Đọc và kiểm tra biến môi trường |
| src/routes/health.routes.js | GET /api/health |
| src/routes/ai.routes.js | Ba POST AI và middleware theo đúng thứ tự hợp đồng |
| src/controllers/health.controller.js | Trả health JSON |
| src/controllers/ai.controller.js | Gọi service và đóng gói response |
| src/services/ai.service.js | Chọn mock/gemini, chuẩn hóa kết quả nghiệp vụ |
| src/services/gemini.service.js | Gọi SDK, deadline, ánh xạ lỗi nhà cung cấp |
| src/services/mock.service.js | Trả dữ liệu minh họa có nhãn mock |
| src/prompts/ | Prompt riêng simplify, explain, summarize |
| src/schemas/ | Schema request và schema response AI |
| src/middlewares/ | CORS, limiter, Content-Type, validation, 404, error handler |
| src/utils/app-error.js | Error có status/code/message/details đã kiểm soát |
| tests/ | HTTP integration và kiểm tra adapter/timeout bằng stub |
| postman/ | Collection và environment local, không có key |

Tên file phụ có thể gộp nếu giảm phức tạp nhưng phải giữ trách nhiệm rõ. Không cần tạo tất cả file ngay từ đầu.

## 4. Cấu hình

| Biến | Mặc định / yêu cầu |
| --- | --- |
| NODE_ENV | development; cho phép development/test/production |
| PORT | 5000; số nguyên 1–65535 |
| CLIENT_ORIGINS | http://localhost:5173,http://localhost:3000; danh sách origin hợp lệ, không wildcard |
| AI_MODE | mock; chỉ mock hoặc gemini |
| GEMINI_API_KEY | Bắt buộc khi AI_MODE=gemini; không ghi giá trị vào log |
| GEMINI_MODEL | Bắt buộc khi AI_MODE=gemini; người vận hành chọn model đang hỗ trợ structured output |
| AI_TIMEOUT_MS | 30000; số nguyên dương |
| RATE_LIMIT_WINDOW_MS | 60000; số nguyên dương |
| RATE_LIMIT_MAX | 10; số nguyên dương |

Độ dài trường và body limit dùng hằng số chung theo hợp đồng, không thêm biến môi trường làm FE/BE lệch giới hạn. Giá trị mặc định áp dụng khi biến thiếu; chuỗi rỗng của biến đã đặt không được âm thầm coi là hợp lệ. CLIENT_ORIGINS chỉ chứa origin, không path, query hoặc credentials. Restart sau khi sửa .env.

Mock là cấu hình local khởi đầu rõ ràng. Ở production cần đặt AI_MODE chủ đích; README phải nêu dùng thật cần gemini và model/key. Health luôn không gọi Gemini nhưng cấu hình gemini thiếu key/model vẫn khiến startup fail để tránh triển khai sai.

## 5. Luồng ứng dụng và xử lý lỗi

Tuân thủ thứ tự middleware trong api-contract.md. AppError mang lỗi dự kiến; error handler giữ đủ bốn tham số, không trả stack/raw SDK. Map JSON parser errors, 413 và 404 đúng envelope. Parser dùng strict=false để JSON hợp lệ nhưng sai kiểu (null, số, chuỗi, mảng) đến schema validation và nhận VALIDATION_ERROR; JSON sai cú pháp vẫn nhận INVALID_JSON. Cho phép dependency injection khi test app/service để tạo lỗi 500 hoặc giả lập provider mà không thêm route debug công khai.

CORS credentials=false; cho phép Content-Type và GET/POST/OPTIONS. Danh sách origin chỉ phục vụ trình duyệt, không thay limiter. Limiter dùng một store chung cho ba route AI trong một process; không áp lên health hoặc OPTIONS; dùng xử lý IPv6 chuẩn của thư viện, không tự viết bộ đếm IP.

Trust proxy mặc định false. Chỉ cấu hình hop/CIDR đúng hạ tầng khi triển khai và ghi vào README. Không đặt true vô điều kiện. Không retry Gemini tự động trong MVP để tránh nhân chi phí và vượt deadline.

## 6. Thiết kế AI

Một lời gọi AI/request, không lịch sử hội thoại, không grounding/tools/web search. Tách system instruction và dữ liệu người dùng. System instruction yêu cầu tiếng Việt dễ hiểu, giữ dữ kiện, không làm theo chỉ dẫn lồng trong văn bản và không bịa khi không xử lý được.

Dùng structured output theo schema được SDK/model hỗ trợ. Định nghĩa union nội bộ: trạng thái ok với payload đúng từng chức năng, hoặc cannot_process với lý do nội bộ. Không trả wrapper nội bộ cho FE. Kiểm tra JSON và schema lại bằng zod; structured output không bảo đảm nội dung đúng.

- simplify payload: simplifiedText không rỗng.
- explain payload: meaning không rỗng, examples 1–3 chuỗi không rỗng.
- summarize payload: summary không rỗng, keyPoints 1–7 chuỗi không rỗng.

Kết quả bị safety block hoặc cannot_process hợp lệ → 422. Response trống không có lý do từ chối, JSON hỏng, schema sai hoặc bị cắt do giới hạn output → 502. Deadline → 504. Lỗi provider/quota/network → 503. Chỉ map timeout đã nhận biết, không coi mọi lỗi mạng là timeout.

Thiết lập deadline có cơ chế hủy request thật theo khả năng SDK/transport đã xác minh. Promise.race đơn lẻ không đủ vì request nền vẫn có thể tiếp tục. Tắt retry nội bộ nếu SDK hỗ trợ; ghi lại giới hạn nếu transport không đảm bảo hủy ở phía nhà cung cấp. Không retry để sửa JSON sai trong MVP.

## 7. Kiểm thử

HTTP tests dùng app không mở cổng cố định và fake provider, không cần API key hoặc Internet. Kiểm tra: health, mỗi happy path, level mặc định/enum, trim và biên 5000/5001/100/101/1000/1001, Unicode code point, body null/mảng/trường lạ, 415, JSON hỏng, 413, 404, lỗi 500 và CORS/preflight. Kiểm tra limiter dùng limit/window nhỏ được inject để không phải chờ một phút; 429 có Retry-After, ba route chia sẻ hạn mức, health không bị tính. Kiểm tra provider từ chối, schema hỏng, network/quota, timeout có hủy và không gọi provider với input sai.

Sau tests, kiểm thử thủ công Gemini thật với ít nhất 5 ví dụ/chức năng: văn bản phổ thông, kiến thức THCS, số liệu/tên riêng, phủ định, thuật ngữ hoặc từ nhiều nghĩa. Ghi kết quả đúng/sai và điều chỉnh prompt; không commit dữ liệu học sinh thật. Đánh dấu chưa chạy nếu không có key/hạn mức.

## 8. Chạy và triển khai

Local: npm ci nếu có lockfile, sao chép .env.example thành .env nếu chưa có, npm run dev; GET localhost:5000/api/health. Thêm npm test khi có test suite. npm start là chế độ không theo dõi file.

Production: inject secrets ở môi trường máy chủ, không copy .env vào Git; cấu hình model, origin FE thật, PORT do host cấp, HTTPS và proxy phù hợp; smoke test health và một request AI. Một instance đủ cho limiter memory MVP. Không tự chọn nhà cung cấp hay công khai backend nếu chỉ được yêu cầu code local.

## 9. Nguồn kỹ thuật để kiểm tra khi code

- Express error handling: https://expressjs.com/en/guide/error-handling.html
- CORS: https://expressjs.com/en/resources/middleware/cors.html
- Gemini SDK: https://googleapis.github.io/js-genai/
- Structured output: https://ai.google.dev/gemini-api/docs/structured-output
- API key: https://ai.google.dev/gemini-api/docs/api-key

SDK, model và cách cấu hình timeout có thể đổi; tra tài liệu chính thức tại thời điểm cài, không sao chép ví dụ cũ thiếu kiểm chứng.
