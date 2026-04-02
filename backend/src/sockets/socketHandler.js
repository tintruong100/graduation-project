import { Server } from "socket.io";
import { handleAttendanceEvents } from "./handlers/attendanceHandler";
import { handleFingerprintEvents } from "./handlers/fingerprintHandler";

// Biến toàn cục lưu trữ io để các API khác có thể sử dụng
let ioInstance;

const initSocketIO = (server) => {
    const io = new Server(server, {
        cors: { origin: '*', methods: ["GET", "POST"] }
    });

    ioInstance = io; // Lưu lại io vừa khởi tạo

    io.on('connection', (socket) => {
        console.log(`[+] Pi đã kết nối: ${socket.id}`);

        // Gắn các module xử lý vào, truyền socket vào cho chúng làm việc
        handleAttendanceEvents(socket, io);
        handleFingerprintEvents(socket, io);

        socket.on('disconnect', () => {
            console.log(`[-] Pi đã ngắt kết nối: ${socket.id}`);
        });
    });
};

// Hàm này giúp các file khác gọi getIO() để bắn sự kiện cho Pi
export const getIO = () => {
    if (!ioInstance) {
        throw new Error("Socket.IO chưa được khởi tạo!");
    }
    return ioInstance;
};

export default initSocketIO;