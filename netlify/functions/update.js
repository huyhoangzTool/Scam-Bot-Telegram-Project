const BOT_TOKEN = process.env.BOT_TOKEN;

// Hàm gửi tin nhắn Telegram qua Fetch API
async function sendMessage(chatId, text, replyMarkup = null) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const body = {
    chat_id: chatId,
    text: text,
    parse_mode: "HTML",
    reply_markup: replyMarkup
  };

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

// Hàm xóa tin nhắn
async function deleteMessage(chatId, messageId) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId })
  }).catch(() => {});
}

// Hàm phản hồi callback button
async function answerCallbackQuery(callbackQueryId) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  }).catch(() => {});
}

// Các bộ Bàn Phím (Keyboards)
const mainKeyboard = {
  inline_keyboard: [
    [{ text: "🛒 Cửa hàng", callback_data: "menu_shop" }, { text: "📦 Quản lí hàng", callback_data: "menu_manage" }],
    [{ text: "💳 Nạp tiền", callback_data: "menu_deposit" }, { text: "🎁 Ưu đãi", callback_data: "menu_promo" }],
    [{ text: "💬 Hỗ trợ", callback_data: "menu_support" }]
  ]
};

const shopKeyboard = {
  inline_keyboard: [
    [{ text: "🏛️ Thuê bank số đẹp", callback_data: "shop_bank_dep" }],
    [{ text: "💳 Tạo bank ảo", callback_data: "shop_bank_ao" }],
    [{ text: "📜 Esign trâu", callback_data: "shop_esign" }],
    [{ text: "💛 Locket Gold", callback_data: "shop_locket" }],
    [{ text: "🔙 Quay lại", callback_data: "menu_main" }]
  ]
};

const bankAoKeyboard = {
  inline_keyboard: [
    [{ text: "⏱️ 12 giờ: 40.000₫", callback_data: "buy_bank_12h" }],
    [{ text: "📅 1 ngày: 80.000₫", callback_data: "buy_bank_1d" }],
    [{ text: "📅 3 ngày: 150.000₫", callback_data: "buy_bank_3d" }],
    [{ text: "📅 7 ngày: 250.000₫", callback_data: "buy_bank_7d" }],
    [{ text: "📆 1 tháng: 850.000₫", callback_data: "buy_bank_1m" }],
    [{ text: "📆 2 tháng: 1.700.000₫", callback_data: "buy_bank_2m" }],
    [{ text: "📆 1 năm: 7.700.000₫", callback_data: "buy_bank_1y" }],
    [{ text: "🔙 Quay lại", callback_data: "menu_shop" }]
  ]
};

// Netlify Handler chính
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "LuxBank Bot đang hoạt động!" };
  }

  try {
    const update = JSON.parse(event.body || "{}");

    // 1. Xử lý Lệnh /start
    if (update.message && update.message.text && update.message.text.startsWith("/start")) {
      const chatId = update.message.chat.id;
      const userName = update.message.from.first_name || "Khách hàng";
      const userId = update.message.from.id;

      const text = 
`<b>Xin chào ${userName} Đến Với LuxBank Store!</b>
> Admin: @littlehoang
> Bot: @ThueLuxBank_bot

🆔 <code>${userId}</code>
💲Số dư: 0₫
💲Tổng nạp: 0₫
> Cấp bậc: <i>Thành viên</i>`;

      await sendMessage(chatId, text, mainKeyboard);
    }

    // 2. Xử lý Sự kiện bấm nút (Callback Query)
    if (update.callback_query) {
      const callback = update.callback_query;
      const chatId = callback.message.chat.id;
      const messageId = callback.message.message_id;
      const data = callback.data;
      const userId = callback.from.id;
      const userName = callback.from.first_name || "Khách hàng";

      await answerCallbackQuery(callback.id);

      if (data === "menu_shop") {
        await deleteMessage(chatId, messageId);
        const text = 
`<b>Cửa hàng LuxBank</b>
🆔 <code>${userId}</code>
💲Số dư: 0₫

👇Chọn dịch vụ`;
        await sendMessage(chatId, text, shopKeyboard);
      } 
      else if (data === "shop_bank_ao") {
        await deleteMessage(chatId, messageId);
        const text = 
`Chọn gói thuê bank ảo:
> Số dư: 0₫

Cấp bậc: <i>Thành viên</i> giảm 0%
👇 Chọn gói bên dưới`;
        await sendMessage(chatId, text, bankAoKeyboard);
      } 
      else if (data === "menu_main") {
        await deleteMessage(chatId, messageId);
        const text = 
`<b>Xin chào ${userName} Đến Với LuxBank Store!</b>
> Admin: @littlehoang
> Bot: @ThueLuxBank_bot

🆔 <code>${userId}</code>
💲Số dư: 0₫
💲Tổng nạp: 0₫
> Cấp bậc: <i>Thành viên</i>`;
        await sendMessage(chatId, text, mainKeyboard);
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Lỗi:", err);
    return { statusCode: 200, body: "Error handled" };
  }
};
