// ============================================================
// Yordamchi
// ============================================================
function showError(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 5000);
}

function showSuccess(elId, msg) {
  const el = document.getElementById(elId);
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

function escapeHtmlAdmin(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ============================================================
// AUTENTIFIKATSIYA
// ============================================================
const authWrap = document.getElementById("authWrap");
const adminShell = document.getElementById("adminShell");

auth.onAuthStateChanged((user) => {
  if (user) {
    authWrap.style.display = "none";
    adminShell.classList.add("open");
    document.getElementById("whoEmail").textContent = user.email;
    loadAdminPrompts();
  } else {
    authWrap.style.display = "flex";
    adminShell.classList.remove("open");
  }
});

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  auth.signInWithEmailAndPassword(email, password).catch((err) => {
    let msg = "Kirishda xatolik yuz berdi.";
    if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
      msg = "Email yoki parol noto'g'ri.";
    }
    showError("loginError", msg);
  });
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  auth.signOut();
});

// ============================================================
// PROMPTLARNI BOSHQARISH (CRUD)
// ============================================================
let EDITING_ID = null;
let ADMIN_PROMPTS = [];

function loadAdminPrompts() {
  db.collection("prompts")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        ADMIN_PROMPTS = [];
        snapshot.forEach((doc) => ADMIN_PROMPTS.push({ id: doc.id, ...doc.data() }));
        renderAdminList();
      },
      (err) => {
        document.getElementById("adminList").innerHTML =
          `<div class="empty-state">Ma'lumotlarni yuklab bo'lmadi: ${escapeHtmlAdmin(err.message)}</div>`;
      }
    );
}

function renderAdminList() {
  const list = document.getElementById("adminList");
  document.getElementById("adminCount").textContent = ADMIN_PROMPTS.length + " ta";

  if (ADMIN_PROMPTS.length === 0) {
    list.innerHTML = `<div class="empty-state">Hozircha promptlar yo'q. Chapdagi formadan qo'shing.</div>`;
    return;
  }

  list.innerHTML = ADMIN_PROMPTS.map((p) => `
    <div class="admin-row">
      <div class="info">
        <h3>${escapeHtmlAdmin(p.title)}</h3>
        <span class="meta">${escapeHtmlAdmin(p.category || "—")}${p.grade ? " · " + escapeHtmlAdmin(p.grade) : ""} · ${p.price ? Number(p.price).toLocaleString("ru-RU") + " so'm" : "Bepul"}</span>
      </div>
      <button class="icon-btn" data-edit="${p.id}">Tahrirlash</button>
      <button class="icon-btn danger" data-delete="${p.id}">O'chirish</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => startEdit(btn.dataset.edit));
  });
  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => deletePrompt(btn.dataset.delete));
  });
}

function startEdit(id) {
  const p = ADMIN_PROMPTS.find((x) => x.id === id);
  if (!p) return;
  EDITING_ID = id;

  document.getElementById("formTitle").textContent = "Promptni tahrirlash";
  document.getElementById("pTitle").value = p.title || "";
  document.getElementById("pCategory").value = p.category || "";
  document.getElementById("pGrade").value = p.grade || "";
  document.getElementById("pDescription").value = p.description || "";
  document.getElementById("pPrice").value = p.price || 0;
  document.getElementById("pPromptText").value = p.promptText || "";
  document.getElementById("submitBtn").textContent = "Saqlash";
  document.getElementById("cancelEditBtn").style.display = "block";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  EDITING_ID = null;
  document.getElementById("promptForm").reset();
  document.getElementById("pPrice").value = 0;
  document.getElementById("formTitle").textContent = "Yangi prompt qo'shish";
  document.getElementById("submitBtn").textContent = "Qo'shish";
  document.getElementById("cancelEditBtn").style.display = "none";
}

document.getElementById("cancelEditBtn").addEventListener("click", resetForm);

document.getElementById("promptForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    title: document.getElementById("pTitle").value.trim(),
    category: document.getElementById("pCategory").value.trim(),
    grade: document.getElementById("pGrade").value.trim(),
    description: document.getElementById("pDescription").value.trim(),
    price: Number(document.getElementById("pPrice").value) || 0,
    promptText: document.getElementById("pPromptText").value,
  };

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;

  if (EDITING_ID) {
    db.collection("prompts").doc(EDITING_ID).update(data)
      .then(() => {
        showSuccess("formSuccess", "Prompt yangilandi.");
        resetForm();
      })
      .catch((err) => showError("formError", "Xatolik: " + err.message))
      .finally(() => (submitBtn.disabled = false));
  } else {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("prompts").add(data)
      .then(() => {
        showSuccess("formSuccess", "Prompt qo'shildi.");
        resetForm();
      })
      .catch((err) => showError("formError", "Xatolik: " + err.message))
      .finally(() => (submitBtn.disabled = false));
  }
});

function deletePrompt(id) {
  if (!confirm("Bu promptni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.")) return;
  db.collection("prompts").doc(id).delete()
    .catch((err) => alert("O'chirishda xatolik: " + err.message));
}
