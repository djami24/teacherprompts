// ============================================================
// TELEGRAM BOT SOZLAMALARI
// ============================================================
// Bu bot orqali: o'qituvchi biror papkani "sotib olish"ni bosganda,
// SIZGA (adminga) Telegram'da avtomatik xabar keladi — qaysi papka,
// kim (ism/telegram/tel raqam) so'raganini ko'rasiz.
//
// QANDAY OLISH KERAK:
// 1. Telegram'da @BotFather'ga yozing -> /newbot -> nom bering.
//    Sizga BOT TOKEN beriladi (masalan: 123456:ABC-DEF1234...).
// 2. O'zingizning "chat_id"ingizni bilish uchun: yaratgan botingizga
//    Telegram'da /start deb yozing, keyin brauzerda shu manzilni oching:
//    https://api.telegram.org/bot<TOKEN>/getUpdates
//    Javobda "chat":{"id": 123456789, ...} qismidan chat_id'ni oling.
//    (Yoki botni guruhga qo'shib, guruh chat_id'sidan foydalanishingiz ham mumkin.)
// 3. Pastdagi ikkala qiymatni to'ldiring.
//
// ⚠️ MUHIM XAVFSIZLIK ESLATMASI:
// Bu token sahifa manba kodida (client-side) ko'rinadi — ya'ni har
// qanday kishi saytning kodini ochib, tokenni ko'rishi mumkin va
// nazariy jihatdan botdan boshqa maqsadda foydalanishi mumkin.
// Shuning uchun bu bot faqat shu bitta vazifa (bildirishnoma yuborish)
// uchun alohida yarating, boshqa muhim ishlarda ishlatmang.
// Xohlasangiz, keyinchalik buni xavfsizroq qilish uchun (masalan,
// Cloudflare Worker orqali) yordam bera olaman.
// ============================================================

const TELEGRAM_CONFIG = {
  botToken: "BU_YERGA_BOT_TOKEN_YOZING",      // @BotFather'dan olingan token
  adminChatId: "BU_YERGA_CHAT_ID_YOZING",     // sizning yoki guruhning chat_id'si
  adminUsername: "djamiteacher"                // skrinshot yuborish uchun @ belgisisiz Telegram username
};

// Adminga Telegram orqali xabar yuborish (browserdan to'g'ridan-to'g'ri Bot API'ga so'rov)
async function notifyAdminTelegram(text) {
  if (!TELEGRAM_CONFIG.botToken || TELEGRAM_CONFIG.botToken === "BU_YERGA_BOT_TOKEN_YOZING") {
    console.warn("Telegram bot sozlanmagan — js/telegram-config.js faylini to'ldiring.");
    return false;
  }
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CONFIG.adminChatId,
        text,
        parse_mode: "HTML"
      })
    });
    return res.ok;
  } catch (err) {
    console.error("Telegramga xabar yuborishda xato:", err);
    return false;
  }
}
