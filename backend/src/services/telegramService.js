const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const telegramService = {
    /**
     * Gửi tin nhắn qua Telegram Bot
     * @param {string} message - Nội dung tin nhắn
     */
    sendMessage: async (message) => {
        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.warn("⚠️ Chưa cấu hình Telegram Bot Token hoặc Chat ID.");
            return;
        }

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'HTML' // Cho phép dùng thẻ HTML như <b>, <i>
                })
            });

            const data = await response.json();
            if (!data.ok) {
                console.error("❌ Lỗi từ Telegram API:", data.description);
            } else {
                console.log("✅ Đã gửi thông báo Telegram thành công!");
            }
        } catch (error) {
            console.error("❌ Lỗi khi gọi API Telegram:", error.message);
        }
    }
};

export default telegramService;