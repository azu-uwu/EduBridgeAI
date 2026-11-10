# EduBridge AI — Đặc tả chức năng backend

Phiên bản: 1.0 | Ngày: 11/11/2026.

## 1. Nguồn yêu cầu và phạm vi

Dựa trên SRS và quyết định trực tiếp của chủ dự án: bỏ toàn bộ trắc nghiệm; người dùng sử dụng ngay, không đăng nhập; backend Node.js + Express; frontend làm riêng; Gemini API; chưa cần cơ sở dữ liệu.

SRS được cung cấp còn nhắc trắc nghiệm, UC07 và hồ sơ ứng viên. Các nội dung này là phần tồn dư, không triển khai. Tài liệu này mô tả phạm vi backend đã được thu hẹp theo quyết định trên. Trang chủ là trách nhiệm frontend.

## 2. Người dùng

Học sinh dùng ba công cụ để hiểu bài. Giáo viên dùng cùng công cụ để chuẩn bị nội dung. Hai nhóm không phải vai trò phân quyền. Gemini là dịch vụ bên ngoài, không phải người dùng đăng nhập.

## 3. Giá trị khởi đầu do người soạn đề xuất

Các giá trị sau chưa được chủ dự án chốt riêng. Dùng làm mặc định triển khai; nếu thay đổi phải cập nhật hợp đồng và bộ kiểm thử.

| Nội dung | Giá trị |
| --- | --- |
| Độ dài text cho simplify và summarize | 1–5.000 ký tự sau trim |
| Độ dài term | 1–100 ký tự sau trim |
| Độ dài context | 0–1.000 ký tự sau trim |
| Cấp độ mặc định simplify | basic |
| Cấp độ hợp lệ | basic, intermediate, advanced |
| Thời gian chờ mỗi lần gọi Gemini | 30.000 ms |
| Giới hạn gọi ba API AI | Tổng cộng 10 yêu cầu/IP/60 giây |
| Kích thước JSON request | 100 KiB |
| Ví dụ giải thích từ | 1–3 ví dụ |
| Ý chính trong bản tóm tắt | 1–7 ý |

Đếm ký tự bằng Array.from(value.trim()).length (Unicode code point). FE cần dùng cùng cách đếm, không mặc định JavaScript string.length. Chỉ trim hai đầu, giữ nguyên xuống dòng và khoảng trắng bên trong. Không đặt độ dài tối thiểu tùy ý khác. Không xây bộ phát hiện ngôn ngữ tự động trong MVP; prompt yêu cầu kết quả tiếng Việt và không bịa khi thiếu dữ liệu.

## 4. User stories và tiêu chí nghiệm thu

### US01 / P1 — Đơn giản hóa văn bản

Là học sinh, tôi muốn nhập văn bản và chọn cấp độ để nhận cách diễn đạt dễ hiểu hơn.

- FR01: POST /api/simplify nhận text và level tùy chọn. level bị bỏ qua thì dùng basic; null hoặc chuỗi lạ là lỗi.
- FR02: Giữ đúng nghĩa, phủ định, số liệu, tên riêng, quan hệ nguyên nhân và kiến thức trọng tâm. Không thêm dữ kiện không có trong nguồn.
- FR03: basic dùng câu ngắn và từ phổ thông; intermediate giữ thuật ngữ cần thiết kèm giải thích ngắn; advanced diễn đạt rõ nhưng giữ nhiều thuật ngữ hơn. Đây là cấp độ ngôn ngữ, không phải lựa chọn khối lớp.
- AC01: Đầu vào hợp lệ trả 200 với simplifiedText không rỗng và level đã dùng.
- AC02: Thiếu/rỗng/quá dài/sai kiểu/sai level trả 400 và không gọi Gemini.
- AC03: Giáo viên đọc đối chiếu một tập mẫu, xác nhận không mất ý chính hoặc đổi số liệu. Không yêu cầu mọi đầu vào đều được rút ngắn số ký tự.

### US02 / P1 — Giải thích từ khó

Là học sinh, tôi muốn biết nghĩa một từ hoặc cụm từ qua lời giải thích và ví dụ gần gũi.

- FR04: POST /api/explain nhận term bắt buộc và context tùy chọn. context bỏ qua hoặc chuỗi trắng tương đương không có ngữ cảnh; null/sai kiểu là lỗi.
- FR05: Ưu tiên nghĩa phù hợp ngữ cảnh. Khi không có ngữ cảnh, giải thích nghĩa thông dụng; không khẳng định nghĩa không xác định được.
- AC04: Trả 200 gồm term, meaning không rỗng và examples có 1–3 chuỗi không rỗng.
- AC05: Khi không đủ cơ sở giải thích, trả 422 AI_CANNOT_PROCESS, không tự bịa định nghĩa. Từ không có thật không bắt buộc luôn bị nhận diện chính xác.

### US03 / P1 — Tóm tắt bài học

Là học sinh, tôi muốn nhận bản tóm tắt và danh sách ý chính từ nội dung bài học.

- FR06: POST /api/summarize nhận text.
- FR07: Bản tóm tắt bám sát nguồn, bằng tiếng Việt dễ hiểu; giữ thông tin trọng tâm, không suy diễn kiến thức mới.
- AC06: Trả 200 với summary không rỗng và keyPoints có 1–7 chuỗi không rỗng. Đoạn ngắn có thể chỉ có một ý.
- AC07: Đầu vào không hợp lệ trả 400, không gọi Gemini.

### US04 / P1 — Kiểm tra backend

- FR08: GET /api/health công khai, không yêu cầu key hay tài khoản; không gọi Gemini hoặc cơ sở dữ liệu.
- AC08: Trả 200 đúng JSON hợp đồng. Đây là kiểm tra tiến trình HTTP, không cam kết Gemini sẵn sàng.

## 5. Yêu cầu chung

- FR09: Ba API AI yêu cầu JSON object và Content-Type application/json. Mảng/null/body thiếu không hợp lệ; trường ngoài hợp đồng bị từ chối.
- FR10: Mọi lỗi trả JSON có success=false và error.code/message. Không đưa stack trace hoặc lỗi thô từ SDK ra ngoài.
- FR11: CORS dùng danh sách origin trong môi trường, cho phép công cụ không có Origin như Postman; không dùng cookie hoặc Authorization.
- FR12: Giới hạn ba endpoint AI theo IP, dùng chung bộ đếm; health không bị tính. Yêu cầu AI bị từ chối do validation vẫn tính; OPTIONS không tính. Bộ đếm trong bộ nhớ phù hợp một tiến trình MVP.
- FR13: AI_MODE=mock để phát triển độc lập; AI_MODE=gemini để dùng thật. Meta ghi rõ chế độ. Không tự chuyển từ gemini sang mock.
- FR14: Sai cấu hình phải báo lỗi khi khởi động. Ở gemini bắt buộc có key và model; mock không cần hai biến này. Model do người triển khai chọn từ danh sách hiện hành, không đoán tên model.
- FR15: Lỗi API, timeout hoặc kết quả sai schema phải được trả đúng mã theo hợp đồng.

## 6. Giới hạn phiên bản

Không lưu lịch sử bền vững, không streaming, không upload file, không xuất PDF/Word từ backend, không tổng hợp ba chức năng trong một request. Sao chép, tải văn bản kết quả và trạng thái loading thuộc FE nếu nhóm bổ sung. Nghe phát âm chỉ có trong ảnh tham khảo, chưa nằm trong backend MVP.

IP không đồng nghĩa một người dùng: học sinh cùng mạng có thể chung hạn mức. Mặc định trust proxy tắt ở local. Khi triển khai sau proxy phải cấu hình đúng topology; không tin mọi X-Forwarded-For. Mở rộng nhiều instance cần thiết kế limiter dùng chung trong giai đoạn sau.

## 7. Định nghĩa hoàn thành

Ba API hoạt động theo hợp đồng; mock và gemini tách rõ; health hoạt động; kiểm thử HTTP pass; có bộ Postman; đã rà nội dung mẫu tiếng Việt; có hướng dẫn chạy và cấu hình. Phải báo rõ phần nào chưa kiểm tra với Gemini thật. Không coi đầu ra AI có cấu trúc đúng là bằng chứng nội dung đúng.
