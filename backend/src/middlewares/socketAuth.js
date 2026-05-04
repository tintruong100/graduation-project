require('dotenv').config();

const PI_SECRET_KEY = process.env.PI_SECRET_KEY;

const socketAuthMiddleware = (socket, next) => {
    // Lấy token duy nhất từ Pi gửi lên
    const token = socket.handshake.auth?.token;

    // 1. Kiểm tra sự tồn tại của token
    if (!token) {
        console.error("[-] Cảnh báo: Kết nối bị từ chối do thiếu Token.");
        return next(new Error("Access Denied: Missing Token"));
    }

    // 2. Xác thực Token với Secret Key của Pi
    if (token === PI_SECRET_KEY) {
        socket.isRaspberryPi = true; // Đóng dấu xác nhận đây là thiết bị thật
        return next(); // Cho phép vào
    }

    // 3. Nếu không phải Pi (ví dụ ai đó cố tình kết nối bằng Postman)
    console.error("[-] Cảnh báo: Token không hợp lệ!");
    return next(new Error("Access Denied: Invalid Token"));
};

export default socketAuthMiddleware;