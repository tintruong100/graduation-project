// src/cron/attendanceJob.js
import cron from 'node-cron';
import attendanceService from '../services/attendanceService.js';

const initCronJobs = () => {
    // Cú pháp '59 23 * * *' nghĩa là: Phút 59, Giờ 23, Mỗi ngày, Mỗi tháng, Mỗi năm.
    cron.schedule('59 23 * * *', async () => {
        console.log('\n⏳ [CRON JOB] Đang chạy tự động chốt sổ chấm công cuối ngày...');

        try {
            // Gọi hàm chốt sổ từ Service (không cần truyền ngày, nó sẽ tự lấy ngày hôm nay)
            const result = await attendanceService.finalizeDailyAttendance();

            console.log(`✅ [CRON JOB] Chốt sổ thành công cho ngày: ${result.targetDate}`);
            console.log(`   - Số người vắng mặt: ${result.absentCount}`);
            console.log(`   - Số người quên quét lúc về: ${result.missingOutCount}\n`);

        } catch (error) {
            console.error('❌ [CRON JOB] Lỗi nghiêm trọng khi chạy chốt sổ:', error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Ho_Chi_Minh" // CỰC KỲ QUAN TRỌNG: Đảm bảo chạy đúng 23:59 theo giờ Việt Nam
    });

    console.log('✅ [System] Đã thiết lập lịch trình Cronjob chốt sổ lúc 23:59 hàng ngày.');
};

export default initCronJobs;