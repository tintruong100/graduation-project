import securityAlertService from '../../services/securityAlertService.js';

export const handleAlertEvents = (socket, io) => {
    socket.on('intruder_alert', async (data) => {
        console.log(`=> [Cảnh báo Online] Nhận tín hiệu đột nhập lúc ${data.timestamp}`);

        try {
            const newAlert = await securityAlertService.createAlert(data);
            console.log(`✅ [DB] Đã lưu cảnh báo: ${newAlert.id}`);
        } catch (error) {
            console.error("❌ Lỗi xử lý intruder_alert:", error);
        }
    });

    socket.on('sync_offline_alerts', async (logsArray) => {
        console.log(`=> [Cảnh báo Offline] Đang đồng bộ ${logsArray.length} bản ghi...`);

        try {
            await securityAlertService.bulkCreateAlerts(logsArray);
            console.log("✅ [DB] Đồng bộ cảnh báo offline hoàn tất!");
        } catch (error) {
            console.error("❌ Lỗi xử lý sync_offline_alerts:", error);
        }
    });
};