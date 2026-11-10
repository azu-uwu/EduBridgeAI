# Hướng dẫn AI làm việc với EduBridge AI

## Phạm vi

Chỉ triển khai backend trong backend/. Frontend do thành viên khác phụ trách. Người dùng truy cập dùng ngay; không tạo auth, JWT, role, database, trắc nghiệm hoặc lịch sử lâu dài.

## Đọc trước khi code

1. docs/constitution.md
2. docs/spec.md
3. docs/api-contract.md
4. docs/plan.md
5. docs/tasks.md

Hướng dẫn trực tiếp mới nhất của người dùng ưu tiên cao nhất trong phạm vi dự án. Constitution nêu nguyên tắc; spec nêu hành vi; API contract quyết định giao diện HTTP; plan nêu thiết kế; tasks ghi tiến độ. Nếu tài liệu mâu thuẫn, không đoán thay đổi breaking: chỉ ra điểm cụ thể và đồng bộ theo yêu cầu đã xác nhận. Với giá trị đề xuất đã ghi rõ trong spec, dùng mặc định để triển khai, không cần dừng hỏi lại từng giá trị.

## Kiểm tra hiện trạng

- Xem git status và các file hiện hữu trước khi sửa. Không ghi đè công việc đang dở hoặc chạy npm init lại.
- Tiến độ trong tasks giai đoạn 0 là người dùng báo cáo, phải kiểm tra ở repository thực tế.
- Giữ CommonJS và cấu trúc hiện tại. Không đổi module type chỉ để dùng một SDK.
- Không đọc/in khóa .env. Dùng .env.example và kiểm tra sự hiện diện của cấu hình mà không log giá trị bí mật.

## Quy tắc triển khai

- Xử lý từng giai đoạn theo phụ thuộc; ưu tiên một chức năng chạy từ HTTP đến provider trước khi mở rộng.
- Routes gắn middleware; controllers điều phối; services gọi AI; prompts riêng; schemas kiểm tra input/output; middleware lỗi đặt cuối.
- Không trộn mock với gemini. Mock gắn meta.mode=mock; gemini lỗi thì trả lỗi thật theo hợp đồng.
- API key và model ở backend env. Dùng SDK chính thức @google/genai; kiểm tra docs chính thức cho phiên bản đang cài.
- Không ghi input, prompt, output, secrets vào log. Không thêm route debug gây lỗi hoặc endpoint kiểm tra key.
- Không tự tạo model ID, endpoint, kết quả chạy hoặc dữ liệu nghiên cứu. Không tự deploy, push, gửi tin hoặc sửa frontend ngoài phạm vi yêu cầu.
- Không commit .env/node_modules. Giữ .env.example và package-lock.json. Chỉ thêm dependency cần thiết, giải thích lý do.
- Khi một lỗi kiểm thử do thay đổi hiện tại gây ra, sửa trước khi chuyển giai đoạn; nếu blocker bên ngoài, tiếp tục phần độc lập và ghi rõ.

## Kiểm tra và báo cáo

Từ backend/: npm ci khi cài theo lockfile; npm test sau khi suite được tạo; npm run dev hoặc npm start để smoke test GET /api/health. Nếu scripts chưa có, tạo theo plan thay vì tuyên bố đã chạy. Kiểm thử tự động không gọi Gemini thật. Muốn kết luận chất lượng AI thật phải thực hiện T038 riêng.

Cập nhật tasks.md dựa trên bằng chứng. Báo ngắn gọn: đã đổi gì, task nào hoàn thành, đã kiểm tra gì và phần nào chưa làm. Không dùng output mẫu làm bằng chứng gọi Gemini thật.

## Thư mục chạy lệnh backend

- Dự án Node.js nằm trong backend/.
- Mọi lệnh npm phải chạy với working directory là backend/.
- Kiểm tra thư mục hiện tại và backend/package.json trước khi cài dependency.
- Không chạy npm init hoặc tạo package.json, package-lock.json,
  node_modules ở thư mục gốc repository.