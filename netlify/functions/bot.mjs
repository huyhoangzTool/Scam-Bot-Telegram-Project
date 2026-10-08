// netlify/functions/bot.mjs
import TelegramBot from 'node-telegram-bot-api';

const token = process.env.BOT_TOKEN;

// Khởi tạo bot ở chế độ webhook (không polling)
const bot = new TelegramBot(token);

// Hàm tiện ích: Tạo nút inline
const inlineKeyboard = (buttons) => ({
  reply_markup: {
    inline_keyboard: buttons,
  },
});

// Hàm tiện ích: Tạo nút quay lại
const backButton = (callbackData = 'main_menu') => [
  [{ text: '🔙 Quay lại', callback_data: callbackData }],
];

// ==================== HÀM XỬ LÝ TIN NHẮN ====================

// 1. Xử lý lệnh /start
const handleStart = async (chatId, userName) => {
  const text = `Xin chào <b>${userName}</b> Đến Với LuxBank Store!\n\n` +
    `> Admin: @littlehoang\n\n` +
    `> Bot: @ThueLuxBank_bot\n\n` +
    `> <b>${userName}</b>\n\n` +
    `> Số dư: <b>0₫</b>\n\n` +
    `> Tổng nạp: <b>0₫</b>\n\n` +
    `> Cấp bậc: <i>Thành viên</i>`;

  const keyboard = inlineKeyboard([
    [
      { text: '🛍️ Cửa hàng', callback_data: 'shop' },
      { text: '📦 Quản lí hàng', callback_data: 'manage' },
    ],
    [
      { text: '💰 Nạp tiền', callback_data: 'deposit' },
      { text: '🎁 Ưu đãi', callback_data: 'promo' },
    ],
    [{ text: '🆘 Hỗ trợ', callback_data: 'support' }],
  ]);

  await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
};

// 2. Xử lý nút Cửa hàng
const handleShop = async (chatId) => {
  const text = `🛒 <b>Cửa hàng LuxBank</b>\n` +
    `<b>Số dư: 0₫</b>\n\n\n` +
    `👇 Chọn dịch vụ`;

  const keyboard = inlineKeyboard([
    [{ text: '🏦 Thuê bank số đẹp', callback_data: 'bank_dep' }],
    [{ text: '💳 Tạo bank ảo', callback_data: 'bank_ao' }],
    [{ text: '✍️ Esign trâu', callback_data: 'esign' }],
    [{ text: '📸 Locket Gold', callback_data: 'locket' }],
    [{ text: '🔙 Quay lại', callback_data: 'main_menu' }],
  ]);

  await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
};

// 3. Xử lý nút Tạo bank ảo
const handleBankAo = async (chatId) => {
  const text = `Chọn gói thuê bank ảo:\n` +
    `> Số dư: <b>0₫</b>\n\n` +
    `Cấp bậc: <i>Thành viên</i> giảm 0%\n` +
    `👇 Chọn gói bên dưới`;

  const keyboard = inlineKeyboard([
    [
      { text: '12 giờ: 40.000₫', callback_data: 'buy_12h' },
      { text: '1 ngày: 80.000₫', callback_data: 'buy_1d' },
    ],
    [
      { text: '3 ngày: 150.000₫', callback_data: 'buy_3d' },
      { text: '7 ngày: 250.000₫', callback_data: 'buy_7d' },
    ],
    [
      { text: '1 tháng: 850.000₫', callback_data: 'buy_1m' },
      { text: '2 tháng: 1.700.000₫', callback_data: 'buy_2m' },
    ],
    [{ text: '1 năm: 7.700.000₫', callback_data: 'buy_1y' }],
    [{ text: '🔙 Quay lại', callback_data: 'shop' }],
  ]);

  await bot.sendMessage(chatId, text, { parse_mode: 'HTML', ...keyboard });
};

// ==================== XỬ LÝ CALLBACK ====================

const handleCallback = async (callbackQuery) => {
  const { data, message } = callbackQuery;
  const chatId = message.chat.id;
  const messageId = message.message_id;

  // Xóa tin nhắn cũ
  try {
    await bot.deleteMessage(chatId, messageId);
  } catch (err) {
    console.warn('Không thể xóa tin nhắn:', err.message);
  }

  // Lấy tên người dùng từ tin nhắn
  const userName = message.from?.first_name || 'Người dùng';

  // Điều hướng theo callback data
  switch (data) {
    case 'main_menu':
      await handleStart(chatId, userName);
      break;
    case 'shop':
      await handleShop(chatId);
      break;
    case 'bank_ao':
      await handleBankAo(chatId);
      break;
    case 'bank_dep':
    case 'esign':
    case 'locket':
      await bot.sendMessage(chatId, '🚧 Chức năng đang được phát triển!', {
        parse_mode: 'HTML',
        ...inlineKeyboard(backButton('shop')),
      });
      break;
    case 'manage':
    case 'deposit':
    case 'promo':
    case 'support':
      await bot.sendMessage(chatId, '🚧 Chức năng đang được phát triển!', {
        parse_mode: 'HTML',
        ...inlineKeyboard(backButton('main_menu')),
      });
      break;
    default:
      if (data.startsWith('buy_')) {
        await bot.sendMessage(chatId, '🚧 Chức năng mua hàng đang được phát triển!', {
          parse_mode: 'HTML',
          ...inlineKeyboard(backButton('bank_ao')),
        });
      }
      break;
  }
};

// ==================== HANDLER CHÍNH (NETLIFY) ====================

export const handler = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');

    // Xử lý tin nhắn văn bản
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text || '';
      const userName = body.message.from?.first_name || 'Người dùng';

      if (text === '/start') {
        await handleStart(chatId, userName);
      }
    }

    // Xử lý callback từ nút inline
    if (body.callback_query) {
      await handleCallback(body.callback_query);
    }

    return { statusCode: 200, body: 'OK' };
  } catch (error) {
    console.error('Lỗi xử lý:', error);
    return { statusCode: 200, body: 'OK' }; // Luôn trả 200 để Telegram không gửi lại
  }
};