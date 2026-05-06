import securityAlertService from '../../services/securityAlertService.js';
import telegramService from '../../services/telegramService.js';

// Hàm tự viết để format thời gian chuẩn VN (không cần thư viện)
const getCurrentFormattedTime = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const DD = String(d.getDate()).padStart(2, '0');
    const MM = String(d.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
    const YYYY = d.getFullYear();

    return `${hh}:${mm}:${ss} - ${DD}/${MM}/${YYYY}`;
};

export const handleAlertEvents = (socket, io) => {

    // 1. XỬ LÝ CẢNH BÁO ONLINE
    socket.on('intruder_alert', async (data) => {
        console.log(`=> [Cảnh báo Online] Nhận tín hiệu đột nhập lúc ${data.timestamp}`);

        try {
            const newAlert = await securityAlertService.createAlert(data);
            console.log(`✅ [DB] Đã lưu cảnh báo: ${newAlert.id}`);

            // Gọi hàm thuần JS vừa viết ở trên
            const timeString = getCurrentFormattedTime();

            const textMessage = `
🚨 <b>CẢNH BÁO ĐỘT NHẬP (REAL-TIME)!</b> 🚨
<b>Thiết bị:</b> ${data.device_id || 'Chưa rõ'}
<b>Loại:</b> ${data.alert_type || 'INTRUDER_DETECTED'}
<b>Nội dung:</b> ${data.message}
<b>Thời gian:</b> ${timeString}

<i>⚠️ Vui lòng kiểm tra camera an ninh ngay lập tức!</i>
            `;

            await telegramService.sendMessage(textMessage);

        } catch (error) {
            console.error("❌ Lỗi xử lý intruder_alert:", error);
        }
    });

    // 2. XỬ LÝ ĐỒNG BỘ OFFLINE
    socket.on('sync_offline_alerts', async (logsArray) => {
        console.log(`=> [Cảnh báo Offline] Đang đồng bộ ${logsArray.length} bản ghi...`);

        if (!logsArray || logsArray.length === 0) return;

        try {
            await securityAlertService.bulkCreateAlerts(logsArray);
            console.log("✅ [DB] Đồng bộ cảnh báo offline hoàn tất!");

            // Gọi hàm thuần JS
            const timeString = getCurrentFormattedTime();

            const textMessage = `
🔄 <b>ĐỒNG BỘ DỮ LIỆU OFFLINE</b> 🔄
Hệ thống vừa nhận lại kết nối từ Pi và đã đồng bộ thành công <b>${logsArray.length}</b> cảnh báo an ninh bị nghẽn mạng trước đó.
<b>Thời gian đồng bộ:</b> ${timeString}

<i>👉 Hãy truy cập Dashboard trên Web để xem lịch sử chi tiết.</i>
            `;

            await telegramService.sendMessage(textMessage);

        } catch (error) {
            console.error("❌ Lỗi xử lý sync_offline_alerts:", error);
        }
    });
};