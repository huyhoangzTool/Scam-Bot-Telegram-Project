const { Bot, InlineKeyboard, webhookCallback } = require("grammy");

// Khởi tạo Bot với Token của bạn
const BOT_TOKEN = "8762214307:AAElMGRe5B9U-wTQjTijFCibZdfgrk1HjY0";
const bot = new Bot(BOT_TOKEN);

// --- 1. Tạo các giao diện Bàn phím (Inline Keyboard) ---

// Menu chính
function getMainKeyboard() {
  return new InlineKeyboard()
    .text("🛒 Cửa hàng", "menu_shop")
    .text("📦 Quản lí hàng", "menu_manage").row()
    .text("💳 Nạp tiền", "menu_deposit")
    .text("🎁 Ưu đãi", "menu_promo").row()
    .text("💬 Hỗ trợ", "menu_support");
}

// Menu Cửa hàng
function getShopKeyboard() {
  return new InlineKeyboard()
    .text("🏛️ Thuê bank số đẹp", "shop_bank_dep").row()
    .text("💳 Tạo bank ảo", "shop_bank_ao").row()
    .text("📜 Esign trâu", "shop_esign").row()
    .text("💛 Locket Gold", "shop_locket").row()
    .text("🔙 Quay lại", "menu_main");
}

// Menu gói Thuê bank ảo
function getBankAoKeyboard() {
  return new InlineKeyboard()
    .text("⏱️ 12 giờ: 40.000₫", "buy_bank_12h").row()
    .text("📅 1 ngày: 80.000₫", "buy_bank_1d").row()
    .text("📅 3 ngày: 150.000₫", "buy_bank_3d").row()
    .text("📅 7 ngày: 250.000₫", "buy_bank_7d").row()
    .text("📆 1 tháng: 850.000₫", "buy_bank_1m").row()
    .text("📆 2 tháng: 1.700.000₫", "buy_bank_2m").row()
    .text("📆 1 năm: 7.700.000₫", "buy_bank_1y").row()
    .text("🔙 Quay lại", "menu_shop");
}

// --- 2. Xử lý Lệnh /start ---
bot.command("start", async (ctx) => {
  const userName = ctx.from.first_name || "Khách hàng";
  const userId = ctx.from.id;

  const text = 
`**Xin chào** ${userName} **Đến Với LuxBank Store!**
> Admin: @littlehoang
> Bot: @ThueLuxBank_bot

🆔 \`${userId}\`
💲Số dư: 0₫
💲Tổng nạp: 0₫
> Cấp bậc: _Thành viên_`;

  await ctx.reply(text, {
    parse_mode: "Markdown",
    reply_markup: getMainKeyboard()
  });
});

// --- 3. Xử lý sự kiện bấm Nút (Callback Queries) ---

// Nút Cửa hàng
bot.callbackQuery("menu_shop", async (ctx) => {
  const userId = ctx.from.id;
  const text = 
`**Cửa hàng LuxBank**
🆔 \`${userId}\`
💲Số dư: 0₫

👇Chọn dịch vụ`;

  await ctx.deleteMessage().catch(() => {});
  await ctx.reply(text, {
    parse_mode: "Markdown",
    reply_markup: getShopKeyboard()
  });
  await ctx.answerCallbackQuery();
});

// Nút Tạo bank ảo
bot.callbackQuery("shop_bank_ao", async (ctx) => {
  const text = 
`Chọn gói thuê bank ảo:
> Số dư: 0₫

Cấp bậc: _Thành viên_ giảm 0%
👇 Chọn gói bên dưới`;

  await ctx.deleteMessage().catch(() => {});
  await ctx.reply(text, {
    parse_mode: "Markdown",
    reply_markup: getBankAoKeyboard()
  });
  await ctx.answerCallbackQuery();
});

// Nút Quay lại Menu chính
bot.callbackQuery("menu_main", async (ctx) => {
  const userName = ctx.from.first_name || "Khách hàng";
  const userId = ctx.from.id;

  const text = 
`**Xin chào** ${userName} **Đến Với LuxBank Store!**
> Admin: @littlehoang
> Bot: @ThueLuxBank_bot

🆔 \`${userId}\`
💲Số dư: 0₫
💲Tổng nạp: 0₫
> Cấp bậc: _Thành viên_`;

  await ctx.deleteMessage().catch(() => {});
  await ctx.reply(text, {
    parse_mode: "Markdown",
    reply_markup: getMainKeyboard()
  });
  await ctx.answerCallbackQuery();
});

// Phản hồi mặc định cho các nút chưa gán chức năng chi tiết
bot.on("callback_query:data", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "Tính năng đang được nâng cấp!",
    show_alert: true
  });
});

// --- 4. Xuất Webhook Handler cho Netlify ---
const handleUpdate = webhookCallback(bot, "std/http");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "LuxBank Bot đang hoạt động!" };
  }

  try {
    const request = new Request(event.rawUrl, {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    });
    return await handleUpdate(request);
  } catch (err) {
    console.error("Lỗi Webhook:", err);
    return { statusCode: 500, body: "Internal Error" };
  }
};
