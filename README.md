# PromptDaftar — O'qituvchilar uchun AI promptlari sayti

Oddiy, statik (HTML/CSS/JS) sayt. Ma'lumotlar Firebase (Firestore + Authentication) orqali saqlanadi va boshqariladi. GitHub Pages'da bepul joylashtirish mumkin.

## Sayt tuzilishi

```
oquv-promptlar/
├── index.html          → Bosh sahifa
├── oqituvchi.html       → O'qituvchilar uchun to'liq katalog
├── admin.html            → Admin panel (login + boshqaruv)
├── css/style.css         → Barcha uslublar
├── js/firebase-config.js → Firebase sozlamalari (o'zingiz to'ldirasiz)
├── js/main.js             → Katalog/qidiruv/modal logikasi
└── js/admin.js            → Admin panel logikasi
```

---

## 1-QADAM: Firebase loyihasini yaratish

1. https://console.firebase.google.com ga kiring, Google hisobingiz bilan.
2. **"Add project" / "Loyiha qo'shish"** tugmasini bosing, nom bering (masalan `promptdaftar`).
3. Google Analytics'ni o'chirib qo'yishingiz mumkin (kerak emas).
4. Loyiha yaratilgach, chap menyudan **Build → Firestore Database** ga kiring:
   - **"Create database"** ni bosing.
   - Rejim: **"Start in production mode"** ni tanlang (keyin qoidalarni o'zimiz yozamiz).
   - Joylashuv (location): eng yaqinini tanlang (masalan `eur3` yoki `asia-south1`).
5. Chap menyudan **Build → Authentication** ga kiring:
   - **"Get started"**.
   - **Sign-in method** bo'limidan **Email/Password** ni yoqing (Enable).

## 2-QADAM: Admin foydalanuvchi yaratish

1. Authentication bo'limida **Users** tabiga o'ting.
2. **"Add user"** tugmasini bosing.
3. O'zingizning email va parolingizni kiriting — shu orqali `admin.html` sahifasiga kirasiz.
4. Xohlasangiz bir nechta admin (masalan, boshqa hamkasbingiz uchun) qo'shishingiz mumkin.

> ⚠️ Bu sayt registratsiya (sign-up) formasiga ega emas — admin foydalanuvchilar faqat Firebase Console orqali qo'lda yaratiladi. Bu — begona odamlar admin panelga o'zi ro'yxatdan o'tib kirib olmasligi uchun ataylab shunday qilingan.

## 3-QADAM: Web-ilova qo'shish va konfiguratsiyani olish

1. Firebase Console'da loyiha sozlamalariga o'ting: chap tepadagi ⚙️ belgisi → **Project settings**.
2. Pastga tushing, **"Your apps"** bo'limida `</>` (Web) belgisini bosing.
3. Ilova nomini kiriting (masalan `promptdaftar-web`), **"Register app"**.
4. Sizga `firebaseConfig` obyekti ko'rsatiladi — shunga o'xshash:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "promptdaftar.firebaseapp.com",
  projectId: "promptdaftar",
  storageBucket: "promptdaftar.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

5. Shu qiymatlarni nusxalab, loyihadagi **`js/firebase-config.js`** faylidagi mos joylariga joylashtiring (`BU_YERGA_...` yozuvlarini almashtiring).

> Bu kalitlar "maxfiy" emas — Firebase'da bu oddiy client-side identifikatorlar. Haqiqiy xavfsizlik quyidagi Firestore qoidalari orqali ta'minlanadi.

## 4-QADAM: Firestore xavfsizlik qoidalarini sozlash

Firestore Database → **Rules** tabiga o'ting va quyidagini joylashtiring:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /prompts/{promptId} {
      // Har kim promptlarni o'qiy oladi (sayt tashrif buyuruvchilari uchun)
      allow read: if true;
      // Faqat tizimga kirgan (admin) foydalanuvchi qo'sha/tahrirlay/o'chira oladi
      allow write: if request.auth != null;
    }
  }
}
```

**"Publish"** tugmasini bosing.

Bu qoida: har kim saytdagi promptlarni ko'ra oladi, lekin faqat Authentication orqali tizimga kirgan admin ularni qo'shishi, tahrirlashi yoki o'chirishi mumkin.

## 5-QADAM: Telegram va narx sozlamalarini kiritish

`js/main.js` faylining eng boshida:

```js
const SITE_CONFIG = {
  telegramUsername: "sizning_telegram_username", // @ belgisisiz
  currency: "so'm"
};
```

`telegramUsername`'ni o'zingizning Telegram foydalanuvchi nomingizga almashtiring — pullik promptlar uchun "Sotib olish" tugmasi shu Telegram'ga olib boradi.

> **Eslatma — to'lov haqida:** Hozirgi versiyada haqiqiy onlayn to'lov tizimi (Payme/Click) ulanmagan — bu MVP (birinchi versiya) uchun eng sodda va tez ishga tushuriladigan yechim: xaridor Telegram orqali murojaat qiladi, siz to'lovni tekshirib, to'liq prompt matnini qo'lda yuborasiz. Keyinchalik xohlasangiz, Payme/Click integratsiyasini qo'shib berishim mumkin.

## 6-QADAM: Lokal tekshirish

Fayllarni brauzerda to'g'ridan-to'g'ri ochish (`file://`) ba'zi brauzerlarda Firebase bilan ishlamasligi mumkin. Shuning uchun lokal server orqali oching:

```bash
cd oquv-promptlar
python3 -m http.server 8000
```

Keyin brauzerda: `http://localhost:8000`

## 7-QADAM: GitHub'ga yuklash

```bash
cd oquv-promptlar
git init
git add .
git commit -m "Birinchi versiya: PromptDaftar sayti"
git branch -M main
git remote add origin https://github.com/FOYDALANUVCHI_NOMI/REPO_NOMI.git
git push -u origin main
```

(`FOYDALANUVCHI_NOMI` va `REPO_NOMI`ni GitHub'da avval yaratgan repo manzilingizga almashtiring.)

## 8-QADAM: GitHub Pages orqali bepul joylashtirish

1. GitHub'dagi repo sahifasiga kiring.
2. **Settings → Pages** bo'limiga o'ting.
3. **Source**: "Deploy from a branch" → Branch: `main`, papka: `/ (root)` → **Save**.
4. Bir necha daqiqadan so'ng sayt manzili tayyor bo'ladi:
   `https://FOYDALANUVCHI_NOMI.github.io/REPO_NOMI/`

Admin panelga kirish uchun: `https://.../admin.html`

---

## Ma'lumotlar tuzilishi (Firestore)

`prompts` kolleksiyasidagi har bir hujjat:

| Maydon        | Tur      | Izoh                                  |
|---------------|----------|----------------------------------------|
| `title`       | string   | Prompt sarlavhasi                     |
| `category`    | string   | Fan/kategoriya (masalan "Tarix")      |
| `grade`       | string   | Sinf (ixtiyoriy, masalan "6-sinf")    |
| `description` | string   | Qisqa tavsif                          |
| `price`       | number   | Narx, so'mda (0 = bepul)              |
| `promptText`  | string   | To'liq prompt matni                   |
| `createdAt`   | timestamp| Avtomatik qo'shiladi                  |

Bu maydonlarni admin panel orqali qo'shish/o'zgartirish mumkin — Firestore Console'ga qo'lda kirish shart emas.

## Keyingi qadamlar (xohlasangiz qo'shib beraman)

- 💳 Payme/Click orqali avtomatik to'lov
- 📧 Xarid qilingandan so'ng email/Telegram bot orqali avtomatik yuborish
- 🖼️ Har bir prompt uchun rasm/banner
- 🔍 Ko'proq filtr (narx bo'yicha saralash, mashhurlik)
- 📊 Admin panelda statistik ma'lumotlar (ko'rishlar, sotuvlar)
