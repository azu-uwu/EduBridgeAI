// Đọc các biến trong file .env vào process.env.
require("dotenv").config();

// Biến môi trường được đọc dưới dạng chuỗi, nên cần chuyển sang số.
const port = Number(process.env.PORT || 5000);

// Kiểm tra cổng có hợp lệ không.
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT phải là số nguyên từ 1 đến 65535.");
}

// Chuyển danh sách địa chỉ frontend thành mảng.
const clientOrigins = (
  process.env.CLIENT_ORIGINS ||
  "http://localhost:5173,http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Xuất cấu hình để các file khác sử dụng.
module.exports = {
  port,
  clientOrigins,
  nodeEnv: process.env.NODE_ENV || "development",
};