import { Server } from "socket.io";
import { handleAttendanceEvents } from "./handlers/attendanceHandler";
import { handleFingerprintEvents } from "./handlers/fingerprintHandler";
import { handleAlertEvents } from "./handlers/alertHandler";
import socketAuthMiddleware from "../middlewares/socketAuth";
import { instrument } from "@socket.io/admin-ui";
require('dotenv').config();

// Biến toàn cục lưu trữ io để các API khác có thể sử dụng
let ioInstance;

global.piStatus = {
    is_online: false,
    last_active: null
};

const initSocketIO = (server) => {
    const FRONTEND_URL = process.env.FRONTEND_URL;
    const io = new Server(server, {
        cors: {
            origin: [
                "https://admin.socket.io",
                FRONTEND_URL
            ].filter(Boolean),
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    instrument(io, {
        auth: {
            type: "basic",
            username: process.env.ADMIN_UI_USERNAME || "admin",
            password: process.env.ADMIN_UI_PASSWORD_HASH
        },
        mode: "development",
    });

    ioInstance = io; // Lưu lại io vừa khởi tạo
    io.use(socketAuthMiddleware);


    io.on('connection', (socket) => {
        global.piStatus = {
            is_online: true,
            last_active: new Date()
        };
        console.log(`[+] Pi đã kết nối: ${socket.id}`);

        // Gắn các module xử lý vào, truyền socket vào cho chúng làm việc
        handleAttendanceEvents(socket, io);
        handleFingerprintEvents(socket, io);
        handleAlertEvents(socket, io);

        socket.on('disconnect', () => {
            global.piStatus = {
                is_online: false,
                last_active: new Date()
            };
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