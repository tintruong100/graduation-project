import db from '../../models/index.js'; // Đường dẫn tới file models của bạn

export const handleAlertEvents = (socket, io) => {

    // =====================================================================
    // 1. NHẬN CẢNH BÁO ONLINE (REALTIME)
    // =====================================================================
    socket.on('intruder_alert', async (data) => {
        console.log(`=> [Cảnh báo Online] Loại: ${data.alert_type} lúc ${data.timestamp}`);
        console.log(data);

        // try {
        //     // Lưu vào Database thông qua Sequelize Model
        //     const newAlert = await db.SecurityAlert.create({
        //         alert_type: data.alert_type,
        //         message: data.message,
        //         device_id: data.device_id || 'PI_MAIN_OFFICE',
        //         createdAt: data.timestamp // Lấy thời gian thực từ Pi gửi lên
        //     });

        //     console.log(`✅ Đã lưu cảnh báo thành công (ID: ${newAlert.id})`);

        // } catch (error) {
        //     console.error("❌ Lỗi lưu cảnh báo:", error);
        // }
    });

    // =====================================================================
    // 2. NHẬN CẢNH BÁO OFFLINE (KHI PI CÓ MẠNG TRỞ LẠI)
    // =====================================================================
    socket.on('sync_offline_alerts', async (logsArray) => {
        if (!logsArray || logsArray.length === 0) return;

        console.log(`=> [Cảnh báo Offline] Nhận ${logsArray.length} cảnh báo cũ từ Pi để đồng bộ.`);
        console.log(logsArray);

        // try {
        //     // Chuyển đổi format của mảng để insert 1 lần (Bulk Insert)
        //     const alertsToInsert = logsArray.map(log => ({
        //         alert_type: log.alert_type,
        //         message: log.message,
        //         device_id: log.device_id || 'PI_MAIN_OFFICE',
        //         createdAt: log.timestamp // Lưu lại đúng thời điểm xảy ra sự cố trong quá khứ
        //     }));

        //     // Dùng bulkCreate của Sequelize để thêm nhiều record cùng lúc cực nhanh
        //     await db.SecurityAlert.bulkCreate(alertsToInsert);

        //     console.log(`✅ Đã đồng bộ xong ${logsArray.length} cảnh báo Offline vào DB!`);

        //     // Yêu cầu Web Admin refresh lại bảng dữ liệu
        //     io.emit("admin_refresh_alerts");

        // } catch (error) {
        //     console.error("❌ Lỗi đồng bộ cảnh báo offline:", error);
        // }
    });

};