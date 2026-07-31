// ============================================================
// FIREBASE SOZLAMALARI
// ============================================================
// Bu yerga o'zingizning Firebase loyihangiz ma'lumotlarini kiriting.
// Ularni olish uchun: https://console.firebase.google.com
// Loyiha yarating -> Project settings -> "Your apps" -> Web app (</>) qo'shing
// ============================================================

const firebaseConfig = {
  apiKey: "AIzaSyD5Bn-fXdxJsefHxfo5P0NZNLJ-rpi-Fkc",
  authDomain: "teacherprompt-4e05b.firebaseapp.com",
  projectId: "teacherprompt-4e05b",
  storageBucket: "teacherprompt-4e05b.firebasestorage.app",
  messagingSenderId: "159944546539",
  appId: "1:159944546539:web:51764c5fcbcda45a2b46ae",
  measurementId: "G-NVWPJY366Q"
};

// Firebase'ni ishga tushirish (compat SDK — oddiy <script> orqali ishlaydi)
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
