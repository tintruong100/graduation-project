import dashboardService from '../services/dashboardService.js';

const getSummary = async (req, res) => {
    try {
        const dashboardData = await dashboardService.getDashboardSummaryData();

        // Trả về HTTP Status 200 (Thành công) cùng cục dữ liệu JSON
        res.status(200).json({
            success: true,
            message: "Lấy dữ liệu tổng hợp Dashboard thành công.",
            data: dashboardData
        });
    } catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            success: false,
            message: "Lỗi Server khi tổng hợp dữ liệu Dashboard",
            error: error.message
        });
    }
};

module.exports = {
    getSummary
};