const { Bot, InlineKeyboard, webhookCallback } = require("grammy");

// Lấy Token từ biến môi trường Netlify
const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error("Chưa cấu hình BOT_TOKEN trong Environment Variables!");
}

const bot = new Bot(BOT_TOKEN);

// --- Keyboard Menus ---
function getMainKeyboard() {
  return new InlineKeyboard()
    .text("🛒 Cửa hàng", "menu_shop")
    .text("📦 Quản lí hàng", "menu_manage").row()
    .text("💳 Nạp tiền", "menu_deposit")
    .text("🎁 Ưu đãi", "menu_promo").row()
    .text("💬 Hỗ trợ", "menu_support");
}

function getShopKeyboard() {
  return new InlineKeyboard()
    .text("🏛️ Thuê bank số đẹp", "shop_bank_dep").row()
    .text("💳 Tạo bank ảo", "shop_bank_ao").row()
    .text("📜 Esign trâu", "shop_esign").row()
    .text("💛 Locket Gold", "shop_locket").row()
    .text("🔙 Quay lại", "menu_main");
}

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

// --- Handlers ---
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

bot.on("callback_query:data", async (ctx) => {
  await ctx.answerCallbackQuery({
    text: "Tính năng đang được nâng cấp!",
    show_alert: true
  });
});

// --- Export Handler chuẩn cho Netlify ---
const handleUpdate = webhookCallback(bot, "http");

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 200, body: "LuxBank Bot đang hoạt động!" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    await bot.handleUpdate(body);
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("Webhook Error:", err);
    return { statusCode: 200, body: "Error Handled" };
  }
};
