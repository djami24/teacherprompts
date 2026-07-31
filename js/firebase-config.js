// ============================================================
// FIREBASE SOZLAMALARI
// ============================================================
// Bu yerga o'zingizning Firebase loyihangiz ma'lumotlarini kiriting.
// Ularni olish uchun: https://console.firebase.google.com
// Loyiha yarating -> Project settings -> "Your apps" -> Web app (</>) qo'shing
// ============================================================

const firebaseConfig = {
  apiKey: "BU_YERGA_API_KEY",
  authDomain: "BU_YERGA_LOYIHA.firebaseapp.com",
  projectId: "BU_YERGA_LOYIHA_ID",
  storageBucket: "BU_YERGA_LOYIHA.appspot.com",
  messagingSenderId: "BU_YERGA_SENDER_ID",
  appId: "BU_YERGA_APP_ID"
};

// Firebase'ni ishga tushirish (compat SDK — oddiy <script> orqali ishlaydi)
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
