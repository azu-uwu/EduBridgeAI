# EduBridge AI — Hợp đồng API v1

Ngày: 11/11/2026. URL local mặc định: http://localhost:5000.
Không có xác thực. Các endpoint AI dùng POST và Content-Type: application/json. Chỉ trả JSON, không streaming. Đây là hợp đồng đề xuất đủ để FE/BE làm song song; các mặc định mới được liệt kê tại spec.md.

## 1. Quy tắc chung

- Request phải là JSON object, chỉ có các trường được liệt kê cho từng endpoint. Không tự ép số/mảng/boolean thành chuỗi.
- Trim trường chuỗi hai đầu trước validation; giữ nội dung bên trong. Đếm bằng Array.from(value).length sau trim.
- Response thành công của API AI có success, data và meta.mode. mode là mock hoặc gemini.
- Các ví dụ kết quả bên dưới chỉ minh họa cấu trúc, không dùng so khớp nguyên văn khi kiểm thử Gemini.
- Các chuỗi hiển thị là plain text, không chứa HTML theo chủ ý. FE hiển thị dạng text, không chèn trực tiếp vào innerHTML.
- Backend kiểm tra schema đầu ra. level và term phản hồi lấy từ request đã chuẩn hóa, không tin AI để xác định hai giá trị này.

## 2. GET /api/health

Không cần body hoặc Content-Type. 200:

```json
{"success":true,"message":"Backend EduBridge AI đang hoạt động.","data":{"status":"ok"}}
```

Không có meta.mode vì không gọi AI. Không trả key, model, cấu hình CORS hay thông tin máy chủ. Đường dẫn / không thuộc hợp đồng và có thể trả 404.

## 3. POST /api/simplify

| Trường | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| text | string | Có | 1–5.000 ký tự sau trim |
| level | string | Không | basic / intermediate / advanced; mặc định basic nếu thiếu |

```json
{"text":"Thực vật hấp thụ năng lượng ánh sáng để thực hiện quá trình quang hợp.","level":"basic"}
```

200:

```json
{"success":true,"data":{"simplifiedText":"Cây dùng năng lượng từ ánh sáng để quang hợp, tức là tạo ra chất dinh dưỡng.","level":"basic"},"meta":{"mode":"gemini"}}
```

simplifiedText là chuỗi không rỗng sau trim.

## 4. POST /api/explain

| Trường | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| term | string | Có | 1–100 ký tự sau trim |
| context | string | Không | Tối đa 1.000 ký tự; bỏ qua hoặc chuỗi trắng là không có ngữ cảnh |

```json
{"term":"quang hợp","context":"Cây xanh tạo chất dinh dưỡng nhờ quá trình quang hợp."}
```

200:

```json
{"success":true,"data":{"term":"quang hợp","meaning":"Quang hợp là quá trình cây dùng năng lượng ánh sáng để tạo chất dinh dưỡng từ nước và khí carbon dioxide, đồng thời giải phóng oxygen.","examples":["Cây lúa dùng ánh sáng để quang hợp và tạo chất dinh dưỡng."]},"meta":{"mode":"gemini"}}
```

meaning không rỗng; examples là mảng 1–3 chuỗi không rỗng. Nếu không thể giải thích đáng tin cậy, dùng 422 AI_CANNOT_PROCESS.

## 5. POST /api/summarize

| Trường | Kiểu | Bắt buộc | Quy tắc |
| --- | --- | --- | --- |
| text | string | Có | 1–5.000 ký tự sau trim |

```json
{"text":"Cây xanh cần ánh sáng để quang hợp. Qua quá trình này, cây tạo ra chất dinh dưỡng và giải phóng oxygen."}
```

200:

```json
{"success":true,"data":{"summary":"Cây dùng ánh sáng để quang hợp, tạo chất dinh dưỡng và giải phóng oxygen.","keyPoints":["Quang hợp cần ánh sáng.","Quang hợp tạo chất dinh dưỡng và giải phóng oxygen."]},"meta":{"mode":"gemini"}}
```

summary không rỗng; keyPoints là mảng 1–7 chuỗi không rỗng.

## 6. Lỗi thống nhất

```json
{"success":false,"error":{"code":"VALIDATION_ERROR","message":"Dữ liệu đầu vào không hợp lệ.","details":[{"field":"text","message":"Vui lòng nhập nội dung văn bản."}]}}
```

details chỉ bắt buộc với VALIDATION_ERROR; mỗi mục gồm field và message. Lỗi ở body/trường lạ dùng field="body" hoặc tên trường lạ. Lỗi khác có thể bỏ details. Frontend xử lý theo code, không phụ thuộc câu chữ message.

| HTTP | error.code | Khi nào |
| --- | --- | --- |
| 400 | INVALID_JSON | JSON sai cú pháp |
| 400 | VALIDATION_ERROR | Body/trường sai kiểu, thiếu/rỗng, vượt ký tự, level sai hoặc trường lạ |
| 403 | CORS_NOT_ALLOWED | Có Origin ngoài danh sách cho phép |
| 404 | NOT_FOUND | Đường dẫn hoặc phương thức không được đăng ký |
| 413 | PAYLOAD_TOO_LARGE | Body vượt 100 KiB |
| 415 | UNSUPPORTED_MEDIA_TYPE | POST AI không có Content-Type application/json |
| 422 | AI_CANNOT_PROCESS | AI từ chối nội dung hoặc không đủ cơ sở xử lý |
| 429 | RATE_LIMITED | Quá 10 yêu cầu/IP/60 giây vào ba API AI |
| 502 | AI_INVALID_RESPONSE | JSON/schema đầu ra AI sai, thiếu hoặc rỗng bất thường |
| 503 | AI_UNAVAILABLE | Gemini lỗi kết nối, hết quota, key/model không dùng được hoặc dịch vụ lỗi |
| 504 | AI_TIMEOUT | Vượt thời gian chờ 30.000 ms |
| 500 | INTERNAL_SERVER_ERROR | Lỗi nội bộ ngoài dự kiến |

429 do limiter nội bộ trả Retry-After theo số giây cần chờ. Gemini trả 429 thì ánh xạ 503 AI_UNAVAILABLE để phân biệt quota nhà cung cấp và hạn mức truy cập của ứng dụng. Với lỗi 500/502/503/504, không chuyển lỗi thô của SDK cho người dùng.

## 7. Thứ tự xử lý

CORS/preflight → limiter trên đúng ba POST AI → kiểm tra Content-Type → parse JSON với giới hạn 100 KiB → validation → controller/service → kiểm tra đầu ra → response. Vì limiter chạy trước validation, request AI sai vẫn được tính và có thể nhận 429 khi hết lượt. OPTIONS kết thúc qua CORS, không gọi AI và không tính lượt. Chỉ parse body ở route phù hợp; route lạ trả 404.

Origin sai bị từ chối trước xử lý; trình duyệt có thể chỉ hiện lỗi CORS và không đọc được JSON 403. Không dùng thông báo JSON này làm điều kiện duy nhất để FE nhận biết lỗi CORS. Công cụ không có Origin vẫn gọi được API; CORS không phải cơ chế xác thực hay bảo vệ quota.

## 8. Chế độ mock

Giữ nguyên HTTP status và data schema; meta.mode="mock". Kết quả mẫu có thể cố định nhưng level và term phải phản ánh đầu vào đã chuẩn hóa. Các lỗi AI cần kiểm thử bằng dependency injection/stub, không tạo endpoint gây lỗi công khai và không gửi trường test ngoài hợp đồng.
