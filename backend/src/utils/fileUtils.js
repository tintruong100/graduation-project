import fs from 'fs';
import path from 'path';

const saveImageFromBase64 = (employeeIdentifier, base64Data) => {
    if (!base64Data) return null;

    try {
        // Đổi ID/Code thành string an toàn cho tên file
        const safeId = String(employeeIdentifier).replace(/[^a-zA-Z0-9_-]/g, '');
        const filename = `attendance_${safeId}_${Date.now()}.jpg`;
        const saveDirectory = path.join(process.cwd(), 'public', 'images');

        if (!fs.existsSync(saveDirectory)) {
            fs.mkdirSync(saveDirectory, { recursive: true });
        }

        const filePath = path.join(saveDirectory, filename);
        const imageBuffer = Buffer.from(base64Data, 'base64');
        fs.writeFileSync(filePath, imageBuffer);

        return `/images/${filename}`;
    } catch (error) {
        console.error("Lỗi khi giải mã và lưu file ảnh:", error);
        return null;
    }
};

export default { saveImageFromBase64 };