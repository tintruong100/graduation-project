import { v2 as cloudinary } from 'cloudinary';
require('dotenv').config(); // Bắt buộc phải có để chạy ở Local

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

export const uploadBase64ToCloudinary = async (base64String, folder = 'attendance_logs') => {
    if (!base64String) return null;

    try {
        // BƯỚC QUAN TRỌNG NHẤT: Gắn tiền tố chuẩn cho Base64
        const fileStr = base64String.startsWith('data:image')
            ? base64String
            : `data:image/jpeg;base64,${base64String}`;

        // Upload chuỗi fileStr (đã có tiền tố) lên Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
            folder: folder,
            resource_type: 'image'
        });
        return uploadResponse.secure_url; // Trả về link https

    } catch (error) {
        console.error("Lỗi Upload Cloudinary:", error);
        return null;
    }
};