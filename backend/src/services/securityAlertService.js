import db from '../models/index.js';

const securityAlertService = {
    /**
     * Tạo một bản ghi cảnh báo mới (Real-time)
     * @param {Object} alertData - Dữ liệu cảnh báo từ Pi
     */
    createAlert: async (alertData) => {
        try {
            const newAlert = await db.SecurityAlert.create({
                alert_type: alertData.alert_type,
                message: alertData.message,
                device_id: alertData.device_id || 'PI_MAIN_OFFICE',
                // Sử dụng timestamp từ Pi làm thời gian tạo bản ghi
                created_at: alertData.timestamp || new Date()
            });
            return newAlert;
        } catch (error) {
            console.error("❌ [Service] Lỗi khi tạo cảnh báo:", error);
            throw error;
        }
    },

    /**
     * Lưu hàng loạt cảnh báo (Đồng bộ Offline)
     * @param {Array} logsArray - Mảng các cảnh báo offline
     */
    bulkCreateAlerts: async (logsArray) => {
        try {
            // Chuyển đổi format dữ liệu phù hợp với Model
            const formattedAlerts = logsArray.map(log => ({
                alert_type: log.alert_type,
                message: log.message,
                device_id: log.device_id || 'PI_MAIN_OFFICE',
                created_at: log.timestamp // Giữ đúng thời gian lúc xảy ra sự cố offline
            }));

            // Sử dụng bulkCreate để tối ưu hiệu suất insert
            const result = await db.SecurityAlert.bulkCreate(formattedAlerts);
            return result;
        } catch (error) {
            console.error("❌ [Service] Lỗi khi đồng bộ hàng loạt cảnh báo:", error);
            throw error;
        }
    },

    getAllAlerts: async () => {
        const alerts = await db.SecurityAlert.findAll({
            order: [['created_at', 'DESC']]
        });
        return alerts;
    }
};

export default securityAlertService;