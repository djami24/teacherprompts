# PromptDaftar — O'qituvchilar uchun AI promptlari sayti

Oddiy, statik (HTML/CSS/JS) sayt. Ma'lumotlar Firebase (Firestore + Authentication) orqali saqlanadi. GitHub Pages'da bepul joylashtiriladi.

## Yangi tuzilma: PAPKALAR

Endi promptlar **papkalarga** guruhlangan:

- Admin xohlagancha **papka** ocha oladi (masalan: "Tarix — 6-sinf", "Ona tili testlari" va h.k.).
- Har bir papkaga **eng ko'pi bilan 100 ta** prompt qo'shish mumkin.
- Har bir papkada **bitta prompt bepul** namuna sifatida ko'rsatiladi (admin belgilaydi), qolganlari — **papka narxida** birgalikda sotib olinadi.
- O'qituvchi papkani "Sotib olish"ni bosganda: ismi va Telegram/tel raqamini kiritadi → so'rov Firestore'ga yoziladi **va sizga (adminga) Telegram orqali avtomatik xabar keladi** (qaysi papka, kim so'raganini ko'rasiz).
- O'qituvchi to'lov qilib, skrinshotni Telegram'da sizga yuboradi.
- Siz screenshot'ni tekshirib, **admin panelda "Tasdiqlash"** tugmasini bosasiz → shu papka **avtomatik ravishda** o'sha o'qituvchiga ochiladi (sahifani qayta yuklamasdan ham — real vaqtda).

## Sayt tuzilishi

```
teacherprompts/
├── index.html            → Bosh sahifa (papkalar namunasi)
├── oqituvchi.html         → Barcha papkalar katalogi
├── papka.html             → Bitta papka sahifasi (promptlar + sotib olish)
├── admin.html             → Admin panel (login + papkalar + so'rovlar)
├── css/style.css          → Barcha uslublar
├── js/firebase-config.js  → Firebase sozlamalari
├── js/telegram-config.js  → Telegram bot sozlamalari (bildirishnoma uchun)
├── js/main.js             → Katalog/papka/sotib olish logikasi
└── js/admin.js            → Admin panel logikasi
```

---

## 1-QADAM: Firebase (agar hali sozlanmagan bo'lsa)

`js/firebase-config.js` faylida loyihangiz sozlamalari allaqachon kiritilgan. Agar boshqa Firebase loyihasidan foydalanmoqchi bo'lsangiz, avvalgi yo'riqnoma bo'yicha davom eting: https://console.firebase.google.com — Firestore Database va Authentication (Email/Password) yoqilgan bo'lishi kerak.

### Firestore xavfsizlik qoidalari

Firestore Database → **Rules** bo'limiga o'ting va **`FIRESTORE_RULES.txt`** faylidagi qoidalarni joylashtiring (bu yangi papka tuzilmasi uchun yangilangan qoidalar — eskisini albatta shu bilan almashtiring). **"Publish"** tugmasini bosing.

---

## 2-QADAM: Telegram bot sozlash (yangi — muhim!)

Papka tanlanganda sizga avtomatik xabar kelishi uchun kichik Telegram bot kerak:

1. Telegram'da **@BotFather** ga yozing → `/newbot` → botga nom bering.
   Sizga **BOT TOKEN** beriladi (masalan `123456789:ABCdefGhIJKlmNoPQRstuVwxYZ`).
2. O'zingizning **chat_id**ingizni bilish uchun:
   - Yaratgan botingizga Telegram'da `/start` deb yozing (botni ishga tushirish uchun).
   - Brauzerda quyidagi manzilni oching (TOKEN o'rniga o'zingiznikini qo'ying):
     `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Javobda `"chat":{"id": 123456789, ...}` qismidan raqamni oling — bu sizning `chat_id`ingiz.
3. **`js/telegram-config.js`** faylini oching va to'ldiring:

```js
const TELEGRAM_CONFIG = {
  botToken: "123456789:ABCdefGhIJKlmNoPQRstuVwxYZ",
  adminChatId: "123456789",
  adminUsername: "sizning_telegram_username"  // @ belgisisiz — skrinshot yuborish uchun
};
```

> ⚠️ **Xavfsizlik eslatmasi:** Bu bot tokeni sayt kodida (client-side) ko'rinadi, ya'ni har qanday kishi saytning manba kodini ochib uni ko'rishi mumkin. Shuning uchun bu bot faqat shu bitta vazifa (bildirishnoma yuborish) uchun bo'lsin — boshqa muhim ma'lumotlar/guruhlar uchun ishlatmang. Xohlasangiz, buni xavfsizroq qilish (masalan Cloudflare Worker orqali tokenni yashirish) bo'yicha keyinroq yordam bera olaman.

---

## 3-QADAM: Admin foydalanuvchi yaratish

Authentication → Users → "Add user" — email va parol kiriting. Shu orqali `admin.html`ga kirasiz.

---

## 4-QADAM: Ishlatish

### Admin sifatida:
1. `admin.html` sahifasiga kirib, tizimga kiring.
2. **"📁 Papkalar"** bo'limidan yangi papka yarating (nomi, tavsifi, narxi).
3. Papka yonidagi **"Promptlar"** tugmasini bosib, ichiga (eng ko'pi 100 ta) prompt qo'shing. Bittasini **"Bepul namuna"** deb belgilang.
4. O'qituvchi sotib olishni so'raganda, sizga Telegramda xabar keladi va **"🔔 So'rovlar"** bo'limida ham ko'rinadi.
5. Skrinshot va to'lovni tekshirgach, so'rov yonidagi **"✓ Tasdiqlash"**ni bosing — papka o'sha o'qituvchiga ochiladi.
6. Agar so'rovsiz to'g'ridan-to'g'ri ruxsat bermoqchi bo'lsangiz — **"So'rovlar"** bo'limidagi **"Qo'lda ruxsat berish"** formasidan foydalaning.

### O'qituvchi sifatida:
1. `oqituvchi.html` — barcha papkalarni ko'radi.
2. Papkani ochib, bepul namunani sinab ko'radi.
3. "Papkani sotib olish" tugmasini bosib, ism va Telegram/tel raqamini kiritadi.
4. Ko'rsatilgan Telegram havolasi orqali to'lov skrinshotini yuboradi.
5. Admin tasdiqlagach — sahifa **avtomatik** yangilanadi va barcha promptlar ochiladi (qayta kirish shart emas, lekin xohlasa keyinroq ham kirib ko'rishi mumkin — kompyuter/telefon xotirasida uning kontaktiga bog'liq holda saqlanadi).

---

## 5-QADAM: Lokal tekshirish

```bash
cd teacherprompts
python3 -m http.server 8000
```

Brauzerda: `http://localhost:8000`

## 6-QADAM: GitHub'ga yuklash va Pages orqali joylashtirish

```bash
cd teacherprompts
git init
git add .
git commit -m "Papkalar tizimi qo'shildi"
git branch -M main
git remote add origin https://github.com/FOYDALANUVCHI_NOMI/REPO_NOMI.git
git push -u origin main
```

Keyin: **Settings → Pages → Source: Deploy from a branch → main / (root)**.

---

## Ma'lumotlar tuzilishi (Firestore)

**`folders`** kolleksiyasi:

| Maydon        | Tur      | Izoh                                       |
|---------------|----------|---------------------------------------------|
| `name`        | string   | Papka nomi                                  |
| `description` | string   | Qisqa tavsif                                |
| `price`       | number   | Butun papkani ochish narxi                  |
| `promptCount` | number   | Ichidagi promptlar soni (avtomatik)         |
| `createdAt`   | timestamp| Avtomatik                                   |

**`folders/{folderId}/prompts`** subkolleksiyasi (har bir papkada max 100 ta):

| Maydon        | Tur      | Izoh                                         |
|---------------|----------|-----------------------------------------------|
| `title`       | string   | Prompt sarlavhasi                            |
| `category`    | string   | Fan (ixtiyoriy)                              |
| `grade`       | string   | Sinf (ixtiyoriy)                             |
| `description` | string   | Qisqa tavsif                                 |
| `isFree`      | boolean  | true bo'lsa — bepul namuna                   |
| `promptText`  | string   | To'liq prompt matni                          |
| `createdAt`   | timestamp| Avtomatik                                    |

**`purchaseRequests`** kolleksiyasi — o'qituvchi yuborgan so'rovlar (`status`: pending/approved/rejected).

**`purchases`** kolleksiyasi — tasdiqlangan xaridlar. Hujjat ID: `{folderId}__{normallashtirilgan_kontakt}`. Bu orqali frontend "papka ochilganmi" tekshiradi.

## Muhim chegara (limitation)

Bu — sof frontend (backend serversiz) yechim. Amalda `promptText` maydoni Firestore'dan tarmoq orqali kelganda texnik jihatdan to'liq keladi (frontend uni faqat vizual qisqartiradi). Ya'ni juda "texnik" foydalanuvchi brauzer Dev Tools orqali pullik matnni ko'rish imkoniga ega bo'lishi mumkin. Aksariyat oddiy foydalanuvchilar uchun bu muammo emas, lekin 100% himoya kerak bo'lsa, promptlarni faqat tasdiqlangandan keyin qaytaradigan Cloud Function/backend qo'shish kerak bo'ladi — buni ham xohlasangiz keyinroq qo'shib beraman.

## Keyingi qadamlar (xohlasangiz qo'shib beraman)

- 💳 Payme/Click orqali avtomatik to'lov
- 🔒 Backend (Cloud Function) orqali pullik matnni to'liq yashirish
- 📊 Admin panelda statistika (ko'rishlar, sotuvlar, daromad)
- 🖼️ Papka uchun banner/rasm
