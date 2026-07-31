// ============================================================
// Yordamchi
// ============================================================
const MAX_PROMPTS_PER_FOLDER = 100;

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

function normalizeContactAdmin(contact) {
  return (contact || "").trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "");
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
    loadAdminFolders();
    loadPurchaseRequests();
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
// TABLAR (Papkalar / So'rovlar)
// ============================================================
document.querySelectorAll(".admin-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".admin-tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".admin-tabpanel").forEach((p) => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

// ============================================================
// PAPKALAR (CRUD)
// ============================================================
let EDITING_FOLDER_ID = null;
let ADMIN_FOLDERS = [];
let OPEN_FOLDER_ID = null; // hozir promptlari boshqarilayotgan papka

function loadAdminFolders() {
  db.collection("folders")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        ADMIN_FOLDERS = [];
        snapshot.forEach((doc) => ADMIN_FOLDERS.push({ id: doc.id, ...doc.data() }));
        renderAdminFolderList();
        populateRequestFolderSelect();
      },
      (err) => {
        document.getElementById("adminFolderList").innerHTML =
          `<div class="empty-state">Ma'lumotlarni yuklab bo'lmadi: ${escapeHtmlAdmin(err.message)}</div>`;
      }
    );
}

function renderAdminFolderList() {
  const list = document.getElementById("adminFolderList");
  document.getElementById("adminFolderCount").textContent = ADMIN_FOLDERS.length + " ta";

  if (ADMIN_FOLDERS.length === 0) {
    list.innerHTML = `<div class="empty-state">Hozircha papkalar yo'q. Chapdagi formadan qo'shing.</div>`;
    return;
  }

  list.innerHTML = ADMIN_FOLDERS.map((f) => `
    <div class="admin-row">
      <div class="info">
        <h3>📁 ${escapeHtmlAdmin(f.name)}</h3>
        <span class="meta">${f.promptCount || 0}/${MAX_PROMPTS_PER_FOLDER} ta prompt · ${f.price ? Number(f.price).toLocaleString("ru-RU") + " so'm" : "Bepul"}</span>
      </div>
      <button class="icon-btn" data-manage="${f.id}">Promptlar</button>
      <button class="icon-btn" data-edit="${f.id}">Tahrirlash</button>
      <button class="icon-btn danger" data-delete="${f.id}">O'chirish</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-manage]").forEach((btn) => {
    btn.addEventListener("click", () => openFolderPrompts(btn.dataset.manage));
  });
  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => startEditFolder(btn.dataset.edit));
  });
  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => deleteFolder(btn.dataset.delete));
  });
}

function startEditFolder(id) {
  const f = ADMIN_FOLDERS.find((x) => x.id === id);
  if (!f) return;
  EDITING_FOLDER_ID = id;

  document.getElementById("folderFormTitle").textContent = "Papkani tahrirlash";
  document.getElementById("fName").value = f.name || "";
  document.getElementById("fDescription").value = f.description || "";
  document.getElementById("fPrice").value = f.price || 0;
  document.getElementById("folderSubmitBtn").textContent = "Saqlash";
  document.getElementById("folderCancelEditBtn").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetFolderForm() {
  EDITING_FOLDER_ID = null;
  document.getElementById("folderForm").reset();
  document.getElementById("fPrice").value = 0;
  document.getElementById("folderFormTitle").textContent = "Yangi papka qo'shish";
  document.getElementById("folderSubmitBtn").textContent = "Qo'shish";
  document.getElementById("folderCancelEditBtn").style.display = "none";
}

document.getElementById("folderCancelEditBtn").addEventListener("click", resetFolderForm);

document.getElementById("folderForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("fName").value.trim(),
    description: document.getElementById("fDescription").value.trim(),
    price: Number(document.getElementById("fPrice").value) || 0
  };

  const submitBtn = document.getElementById("folderSubmitBtn");
  submitBtn.disabled = true;

  if (EDITING_FOLDER_ID) {
    db.collection("folders").doc(EDITING_FOLDER_ID).update(data)
      .then(() => {
        showSuccess("folderFormSuccess", "Papka yangilandi.");
        resetFolderForm();
      })
      .catch((err) => showError("folderFormError", "Xatolik: " + err.message))
      .finally(() => (submitBtn.disabled = false));
  } else {
    data.promptCount = 0;
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    db.collection("folders").add(data)
      .then(() => {
        showSuccess("folderFormSuccess", "Papka qo'shildi.");
        resetFolderForm();
      })
      .catch((err) => showError("folderFormError", "Xatolik: " + err.message))
      .finally(() => (submitBtn.disabled = false));
  }
});

function deleteFolder(id) {
  if (!confirm("Bu papkani va ichidagi BARCHA promptlarni o'chirmoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.")) return;
  db.collection("folders").doc(id).collection("prompts").get()
    .then((snapshot) => {
      const batch = db.batch();
      snapshot.forEach((d) => batch.delete(d.ref));
      batch.delete(db.collection("folders").doc(id));
      return batch.commit();
    })
    .then(() => {
      if (OPEN_FOLDER_ID === id) closeFolderPrompts();
    })
    .catch((err) => alert("O'chirishda xatolik: " + err.message));
}

// ============================================================
// PAPKA ICHIDAGI PROMPTLAR (CRUD, MAX 100)
// ============================================================
let EDITING_PROMPT_ID = null;
let FOLDER_PROMPTS = [];
let FOLDER_PROMPTS_UNSUB = null;

function openFolderPrompts(folderId) {
  OPEN_FOLDER_ID = folderId;
  const f = ADMIN_FOLDERS.find((x) => x.id === folderId);
  document.getElementById("folderPromptsPanel").style.display = "block";
  document.getElementById("folderPromptsTitle").textContent = "📁 " + (f ? f.name : "");
  document.getElementById("folderListSection").style.display = "none";
  resetPromptForm();

  if (FOLDER_PROMPTS_UNSUB) FOLDER_PROMPTS_UNSUB();
  FOLDER_PROMPTS_UNSUB = db.collection("folders").doc(folderId).collection("prompts")
    .orderBy("createdAt", "asc")
    .onSnapshot(
      (snapshot) => {
        FOLDER_PROMPTS = [];
        snapshot.forEach((d) => FOLDER_PROMPTS.push({ id: d.id, ...d.data() }));
        renderFolderPromptsList();
      },
      (err) => {
        document.getElementById("folderPromptsList").innerHTML =
          `<div class="empty-state">Yuklab bo'lmadi: ${escapeHtmlAdmin(err.message)}</div>`;
      }
    );

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function closeFolderPrompts() {
  OPEN_FOLDER_ID = null;
  if (FOLDER_PROMPTS_UNSUB) FOLDER_PROMPTS_UNSUB();
  document.getElementById("folderPromptsPanel").style.display = "none";
  document.getElementById("folderListSection").style.display = "block";
}

document.getElementById("backToFoldersBtn").addEventListener("click", closeFolderPrompts);

function renderFolderPromptsList() {
  const list = document.getElementById("folderPromptsList");
  document.getElementById("folderPromptsCount").textContent = FOLDER_PROMPTS.length + "/" + MAX_PROMPTS_PER_FOLDER;

  const addBtn = document.getElementById("promptSubmitBtn");
  const limitMsg = document.getElementById("promptLimitMsg");
  if (!EDITING_PROMPT_ID && FOLDER_PROMPTS.length >= MAX_PROMPTS_PER_FOLDER) {
    addBtn.disabled = true;
    limitMsg.style.display = "block";
  } else {
    addBtn.disabled = false;
    limitMsg.style.display = "none";
  }

  if (FOLDER_PROMPTS.length === 0) {
    list.innerHTML = `<div class="empty-state">Bu papkada hali prompt yo'q. Chapdagi formadan qo'shing.</div>`;
    return;
  }

  list.innerHTML = FOLDER_PROMPTS.map((p) => `
    <div class="admin-row">
      <div class="info">
        <h3>${p.isFree ? "🟢" : "🔒"} ${escapeHtmlAdmin(p.title)}</h3>
        <span class="meta">${escapeHtmlAdmin(p.category || "—")}${p.grade ? " · " + escapeHtmlAdmin(p.grade) : ""} · ${p.isFree ? "Bepul namuna" : "Pullik (papka narxida)"}</span>
      </div>
      <button class="icon-btn" data-edit="${p.id}">Tahrirlash</button>
      <button class="icon-btn danger" data-delete="${p.id}">O'chirish</button>
    </div>
  `).join("");

  list.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => startEditPrompt(btn.dataset.edit));
  });
  list.querySelectorAll("[data-delete]").forEach((btn) => {
    btn.addEventListener("click", () => deletePrompt(btn.dataset.delete));
  });
}

function startEditPrompt(id) {
  const p = FOLDER_PROMPTS.find((x) => x.id === id);
  if (!p) return;
  EDITING_PROMPT_ID = id;

  document.getElementById("promptFormTitle").textContent = "Promptni tahrirlash";
  document.getElementById("pTitle").value = p.title || "";
  document.getElementById("pCategory").value = p.category || "";
  document.getElementById("pGrade").value = p.grade || "";
  document.getElementById("pDescription").value = p.description || "";
  document.getElementById("pIsFree").checked = !!p.isFree;
  document.getElementById("pPromptText").value = p.promptText || "";
  document.getElementById("pPromptTextUz").value = p.promptTextUz || "";
  document.getElementById("promptSubmitBtn").textContent = "Saqlash";
  document.getElementById("promptCancelEditBtn").style.display = "block";
  renderFolderPromptsList();
}

function resetPromptForm() {
  EDITING_PROMPT_ID = null;
  document.getElementById("promptForm").reset();
  document.getElementById("promptFormTitle").textContent = "Yangi prompt qo'shish";
  document.getElementById("promptSubmitBtn").textContent = "Qo'shish";
  document.getElementById("promptCancelEditBtn").style.display = "none";
}

document.getElementById("promptCancelEditBtn").addEventListener("click", resetPromptForm);

document.getElementById("promptForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!OPEN_FOLDER_ID) return;

  const data = {
    title: document.getElementById("pTitle").value.trim(),
    category: document.getElementById("pCategory").value.trim(),
    grade: document.getElementById("pGrade").value.trim(),
    description: document.getElementById("pDescription").value.trim(),
    isFree: document.getElementById("pIsFree").checked,
    promptText: document.getElementById("pPromptText").value,
    promptTextUz: document.getElementById("pPromptTextUz").value.trim()
  };

  const submitBtn = document.getElementById("promptSubmitBtn");
  submitBtn.disabled = true;

  const folderRef = db.collection("folders").doc(OPEN_FOLDER_ID);
  const promptsRef = folderRef.collection("prompts");

  if (EDITING_PROMPT_ID) {
    promptsRef.doc(EDITING_PROMPT_ID).update(data)
      .then(() => {
        showSuccess("promptFormSuccess", "Prompt yangilandi.");
        resetPromptForm();
      })
      .catch((err) => showError("promptFormError", "Xatolik: " + err.message))
      .finally(() => (submitBtn.disabled = false));
  } else {
    if (FOLDER_PROMPTS.length >= MAX_PROMPTS_PER_FOLDER) {
      showError("promptFormError", "Bu papkada eng ko'p " + MAX_PROMPTS_PER_FOLDER + " ta prompt bo'lishi mumkin.");
      submitBtn.disabled = false;
      return;
    }
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    promptsRef.add(data)
      .then(() => {
        return folderRef.update({ promptCount: firebase.firestore.FieldValue.increment(1) });
      })
      .then(() => {
        showSuccess("promptFormSuccess", "Prompt qo'shildi.");
        resetPromptForm();
      })
      .catch((err) => showError("promptFormError", "Xatolik: " + err.message))
      .finally(() => (submitBtn.disabled = false));
  }
});

function deletePrompt(id) {
  if (!confirm("Bu promptni o'chirmoqchimisiz?")) return;
  const folderRef = db.collection("folders").doc(OPEN_FOLDER_ID);
  folderRef.collection("prompts").doc(id).delete()
    .then(() => folderRef.update({ promptCount: firebase.firestore.FieldValue.increment(-1) }))
    .catch((err) => alert("O'chirishda xatolik: " + err.message));
}

// ============================================================
// SO'ROVLAR (purchaseRequests) — tasdiqlash / rad etish
// ============================================================
let ALL_REQUESTS = [];

function loadPurchaseRequests() {
  db.collection("purchaseRequests")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snapshot) => {
        ALL_REQUESTS = [];
        snapshot.forEach((doc) => ALL_REQUESTS.push({ id: doc.id, ...doc.data() }));
        renderRequests();
      },
      (err) => {
        document.getElementById("requestsList").innerHTML =
          `<div class="empty-state">Yuklab bo'lmadi: ${escapeHtmlAdmin(err.message)}</div>`;
      }
    );
}

function renderRequests() {
  const list = document.getElementById("requestsList");
  const pending = ALL_REQUESTS.filter((r) => r.status === "pending");
  const resolved = ALL_REQUESTS.filter((r) => r.status !== "pending").slice(0, 30);

  document.getElementById("pendingCount").textContent = pending.length + " ta kutilmoqda";

  const renderRow = (r) => `
    <div class="admin-row request-row">
      <div class="info">
        <h3>📁 ${escapeHtmlAdmin(r.folderName)} <span class="req-status req-${r.status}">${
          r.status === "pending" ? "Kutilmoqda" : r.status === "approved" ? "Tasdiqlangan ✓" : "Rad etilgan ✕"
        }</span></h3>
        <span class="meta">${escapeHtmlAdmin(r.teacherName)} · ${escapeHtmlAdmin(r.teacherContact)} · ${r.folderPrice ? Number(r.folderPrice).toLocaleString("ru-RU") + " so'm" : "Bepul"}</span>
      </div>
      ${
        r.status === "pending"
          ? `<button class="icon-btn" data-approve="${r.id}">✓ Tasdiqlash</button>
             <button class="icon-btn danger" data-reject="${r.id}">✕ Rad etish</button>`
          : ``
      }
    </div>
  `;

  let html = "";
  if (pending.length === 0 && resolved.length === 0) {
    html = `<div class="empty-state">Hozircha so'rovlar yo'q.</div>`;
  } else {
    if (pending.length > 0) html += pending.map(renderRow).join("");
    if (resolved.length > 0) {
      html += `<div class="admin-table-head" style="margin-top:24px;"><h2 style="font-size:0.95rem;">Oldingi so'rovlar</h2></div>`;
      html += resolved.map(renderRow).join("");
    }
  }
  list.innerHTML = html;

  list.querySelectorAll("[data-approve]").forEach((btn) => {
    btn.addEventListener("click", () => approveRequest(btn.dataset.approve));
  });
  list.querySelectorAll("[data-reject]").forEach((btn) => {
    btn.addEventListener("click", () => rejectRequest(btn.dataset.reject));
  });
}

function approveRequest(id) {
  const r = ALL_REQUESTS.find((x) => x.id === id);
  if (!r) return;
  if (!confirm(`"${r.folderName}" papkasini ${r.teacherName} (${r.teacherContact}) uchun ochmoqchimisiz?`)) return;

  const purchaseId = r.folderId + "__" + normalizeContactAdmin(r.teacherContact);
  const batch = db.batch();
  batch.set(db.collection("purchases").doc(purchaseId), {
    folderId: r.folderId,
    folderName: r.folderName,
    contact: r.teacherContact,
    teacherName: r.teacherName,
    requestId: r.id,
    approvedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  batch.update(db.collection("purchaseRequests").doc(id), {
    status: "approved",
    resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  batch.commit().catch((err) => alert("Xatolik: " + err.message));
}

function rejectRequest(id) {
  if (!confirm("Bu so'rovni rad etmoqchimisiz?")) return;
  db.collection("purchaseRequests").doc(id).update({
    status: "rejected",
    resolvedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).catch((err) => alert("Xatolik: " + err.message));
}

// ============================================================
// QO'LDA RUXSAT BERISH (so'rovsiz ham papka ochib berish)
// ============================================================
function populateRequestFolderSelect() {
  const sel = document.getElementById("manualFolderSelect");
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = ADMIN_FOLDERS.map((f) => `<option value="${f.id}">${escapeHtmlAdmin(f.name)}</option>`).join("");
  if (current) sel.value = current;
}

document.getElementById("manualGrantForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const folderId = document.getElementById("manualFolderSelect").value;
  const name = document.getElementById("manualName").value.trim();
  const contact = document.getElementById("manualContact").value.trim();
  if (!folderId || !name || !contact) return;

  const f = ADMIN_FOLDERS.find((x) => x.id === folderId);
  const purchaseId = folderId + "__" + normalizeContactAdmin(contact);

  db.collection("purchases").doc(purchaseId).set({
    folderId,
    folderName: f ? f.name : "",
    contact,
    teacherName: name,
    approvedAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    showSuccess("manualGrantSuccess", "Ruxsat berildi.");
    document.getElementById("manualGrantForm").reset();
  }).catch((err) => alert("Xatolik: " + err.message));
});
