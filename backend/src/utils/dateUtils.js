// Lấy chuỗi YYYY-MM-DD theo đúng múi giờ Việt Nam
const getVietnamDateString = (dateObj) => {
    return dateObj.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
};

// Ghép ngày (YYYY-MM-DD) và giờ (HH:mm:ss) thành 1 Date Object hoàn chỉnh
const createDateFromTimeStr = (dateStr, timeStr) => {
    return new Date(`${dateStr}T${timeStr}+07:00`); // Ép cứng múi giờ VN để tính toán chuẩn
};

// Lấy ngày đầu tiên của tháng (VD: 2026-04-01)
const getStartOfMonth = (year, month) => {
    // month - 1 vì trong JavaScript tháng chạy từ 0 - 11
    return new Date(year, month - 1, 1).toLocaleDateString('en-CA');
};

// Lấy ngày cuối cùng của tháng (VD: 2026-04-30)
const getEndOfMonth = (year, month) => {
    // Truyền 0 vào ngày sẽ tự động lùi về ngày cuối cùng của tháng trước đó
    return new Date(year, month, 0).toLocaleDateString('en-CA');
};

export default {
    getVietnamDateString,
    createDateFromTimeStr,
    getStartOfMonth,
    getEndOfMonth
};