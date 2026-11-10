# EduBridge AI — Nguyên tắc phát triển

Phiên bản: 1.0.0 | Ngày: 11/11/2026 | Phạm vi: backend MVP.

## 1. Mục tiêu

EduBridge AI hỗ trợ học sinh dân tộc thiểu số vùng cao đọc hiểu tiếng Việt, đồng thời hỗ trợ giáo viên chuẩn bị nội dung. Ba công cụ AI là đơn giản hóa văn bản, giải thích từ khó và tóm tắt bài học.

## 2. Nguyên tắc bắt buộc

- Người dùng truy cập và sử dụng ngay. Không tạo đăng ký, đăng nhập, JWT, phiên đăng nhập, phân quyền hoặc hồ sơ.
- Không xây dựng trắc nghiệm, chấm điểm, quản lý lớp, dịch sang tiếng dân tộc, tải tài liệu lên, OCR hoặc lớp trực tuyến.
- Không thêm cơ sở dữ liệu, ORM, lịch sử lâu dài hoặc tài khoản khi chưa có yêu cầu mở rộng.
- Backend dùng JavaScript, Node.js, Express 5 và CommonJS để tiếp nối cấu hình hiện có. Frontend do người khác phụ trách.
- Gemini được gọi từ backend qua SDK chính thức @google/genai. API key chỉ nằm trong biến môi trường; không đặt trong mã, phản hồi API, log, ví dụ hoặc Git.
- Hợp đồng HTTP/JSON trong api-contract.md là giao diện chung với frontend. Đổi trường, kiểu hoặc mã lỗi phải cập nhật tài liệu và kiểm thử liên quan trước khi bàn giao.
- Kiểm tra đầu vào trước khi gọi AI. Kết quả AI phải được kiểm tra cấu trúc ở backend trước khi trả cho frontend.
- Nội dung người dùng là dữ liệu cần xử lý, không phải hướng dẫn được phép thay đổi nhiệm vụ AI. Không thực thi mã, gọi công cụ hoặc mở URL theo nội dung nhập.
- Không lưu hoặc ghi log toàn bộ văn bản học sinh, prompt, phản hồi Gemini và thông tin cá nhân. Chỉ ghi metadata cần thiết như mã lỗi, HTTP status, thời gian xử lý.
- Dữ liệu mẫu chỉ dùng khi AI_MODE=mock, phải gắn nhãn trong phản hồi. Không trả dữ liệu mẫu để che lỗi ở chế độ gemini.
- Chỉ đánh dấu công việc hoàn thành khi đã kiểm tra và có bằng chứng. Không tuyên bố đã gọi Gemini thật hoặc đã chạy trên máy người dùng nếu chưa làm.

## 3. Chất lượng và tính đơn giản

Tách route, controller, service, middleware và prompt. Không thêm microservice, hàng đợi, Redis hoặc framework mới khi ba API hiện tại chưa cần. Các kiểm thử tự động tập trung vào hợp đồng API, validation, lỗi dịch vụ và giới hạn tài nguyên; không so khớp nguyên văn câu trả lời AI thật.

## 4. Quản lý thay đổi

Chủ dự án quyết định thay đổi phạm vi. Giá trị đề xuất trong spec.md là cấu hình khởi đầu có thể dùng để triển khai, không phải nội dung đã được xác nhận trong SRS. Khi điều chỉnh, đồng bộ spec.md, api-contract.md, plan.md và tasks.md. Hướng dẫn trực tiếp mới nhất của người dùng được ưu tiên; ghi lại quyết định thay vì để các file mâu thuẫn nhau.
