const { port } = require("./config/env");
const app = require("./app");

const server = app.listen(port, () => {
    console.log(`Backend đang chạy tại http://localhost:${port}`);
    console.log(`Health API: http://localhost:${port}/api/health`);
});

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(
            `Cổng ${port} đang được sử dụng. Hãy đổi PORT trong .env.`
        );
    } else {
        console.error("Không thể khởi động server:", error.code);
    }

    process.exit(1);
});