// ============================================================
// SAYT SOZLAMALARI — shu yerlarni o'zingizga moslang
// ============================================================
const SITE_CONFIG = {
  currency: "so'm"
};

// ============================================================
// Yordamchi funksiyalar
// ============================================================
function formatPrice(price) {
  if (!price || price === 0) return "Bepul";
  return Number(price).toLocaleString("ru-RU") + " " + SITE_CONFIG.currency;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

// Har bir brauzerga bitta doimiy ID beriladi — bu shu qurilmani "eslab qolish" uchun
function getDeviceId() {
  let id = localStorage.getItem("pd_deviceId");
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("pd_deviceId", id);
  }
  return id;
}

// Telegram username yoki telefon raqamini bir xil formatga keltirish (katta-kichik harf, bo'shliq, @ belgisi farqi bo'lmasin)
function normalizeContact(contact) {
  return (contact || "").trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "");
}

function getTeacherProfile() {
  try {
    return JSON.parse(localStorage.getItem("pd_teacherProfile") || "null") || {};
  } catch {
    return {};
  }
}

function saveTeacherProfile(profile) {
  localStorage.setItem("pd_teacherProfile", JSON.stringify(profile));
}

function purchaseDocId(folderId, contact) {
  return folderId + "__" + normalizeContact(contact);
}

// ============================================================
// PAPKALARNI Firestore'dan yuklash va grid ko'rinishida chiqarish
// (index.html va oqituvchi.html shu funksiyadan foydalanadi)
// ============================================================
let ALL_FOLDERS = [];
let ACTIVE_SEARCH = "";
let FOLDER_RENDER_OPTS = {};

function loadFolders(opts) {
  FOLDER_RENDER_OPTS = opts;
  const grid = document.getElementById(opts.gridId);

  db.collection("folders")
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      ALL_FOLDERS = [];
      snapshot.forEach((doc) => {
        ALL_FOLDERS.push({ id: doc.id, ...doc.data() });
      });

      const statCount = document.getElementById("statCount");
      if (statCount) {
        const totalPrompts = ALL_FOLDERS.reduce((sum, f) => sum + (f.promptCount || 0), 0);
        statCount.textContent = totalPrompts;
      }

      renderFolderGrid();

      if (opts.searchInputId) {
        document.getElementById(opts.searchInputId).addEventListener("input", (e) => {
          ACTIVE_SEARCH = e.target.value.trim().toLowerCase();
          renderFolderGrid();
        });
      }
    })
    .catch((err) => {
      console.error("Papkalarni yuklashda xato:", err);
      if (grid) {
        grid.innerHTML = `<div class="empty-state">Papkalarni yuklab bo'lmadi. Firebase sozlamalarini tekshiring.<br><span style="font-size:0.75rem;">(${escapeHtml(err.message)})</span></div>`;
      }
    });
}

function renderFolderGrid() {
  const grid = document.getElementById(FOLDER_RENDER_OPTS.gridId);
  if (!grid) return;

  let list = ALL_FOLDERS;
  if (ACTIVE_SEARCH) {
    list = list.filter((f) =>
      (f.name || "").toLowerCase().includes(ACTIVE_SEARCH) ||
      (f.description || "").toLowerCase().includes(ACTIVE_SEARCH)
    );
  }
  if (FOLDER_RENDER_OPTS.limitCount) {
    list = list.slice(0, FOLDER_RENDER_OPTS.limitCount);
  }

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state">Hozircha papkalar topilmadi.</div>`;
    return;
  }

  grid.innerHTML = list.map((f) => renderFolderCard(f)).join("");
  grid.querySelectorAll(".folder-card").forEach((card) => {
    card.addEventListener("click", () => {
      window.location.href = "papka.html?id=" + encodeURIComponent(card.dataset.id);
    });
  });
}

function renderFolderCard(f) {
  const count = f.promptCount || 0;
  return `
    <article class="folder-card" data-id="${f.id}">
      <div class="folder-card-top">
        <span class="folder-icon">📁</span>
        <span class="price-sticker">${formatPrice(f.price)}</span>
      </div>
      <h3>${escapeHtml(f.name)}</h3>
      <p class="desc">${escapeHtml(f.description || "")}</p>
      <div class="folder-card-footer">
        <span class="folder-count">${count} ta prompt</span>
        <span class="folder-free-badge">1 tasi bepul</span>
      </div>
    </article>
  `;
}

// ============================================================
// BITTA PAPKA SAHIFASI (papka.html)
// ============================================================
let CURRENT_FOLDER = null;
let CURRENT_FOLDER_PROMPTS = [];
let HAS_ACCESS = false;
let ACCESS_UNSUB = null;

function loadFolderPage(rootId) {
  const params = new URLSearchParams(window.location.search);
  const folderId = params.get("id");
  const root = document.getElementById(rootId);

  if (!folderId) {
    root.innerHTML = `<div class="empty-state">Papka topilmadi.</div>`;
    return;
  }

  root.innerHTML = `<div class="loader">Papka yuklanmoqda...</div>`;

  db.collection("folders").doc(folderId).get()
    .then((doc) => {
      if (!doc.exists) {
        root.innerHTML = `<div class="empty-state">Bunday papka topilmadi. U o'chirilgan bo'lishi mumkin.</div>`;
        return;
      }
      CURRENT_FOLDER = { id: doc.id, ...doc.data() };
      return db.collection("folders").doc(folderId).collection("prompts")
        .orderBy("createdAt", "asc").get();
    })
    .then((snapshot) => {
      if (!snapshot) return;
      CURRENT_FOLDER_PROMPTS = [];
      snapshot.forEach((d) => CURRENT_FOLDER_PROMPTS.push({ id: d.id, ...d.data() }));
      watchAccessAndRender(rootId);
    })
    .catch((err) => {
      console.error(err);
      root.innerHTML = `<div class="empty-state">Yuklashda xato: ${escapeHtml(err.message)}</div>`;
    });
}

// Ruxsatni real-vaqtda kuzatish — admin tasdiqlagan zahoti sahifa avtomatik yangilanadi
function watchAccessAndRender(rootId) {
  if (ACCESS_UNSUB) ACCESS_UNSUB();
  const profile = getTeacherProfile();
  HAS_ACCESS = false;

  const renderNow = () => renderFolderPage(rootId);

  if (!profile.contact) {
    renderNow();
    return;
  }

  const docId = purchaseDocId(CURRENT_FOLDER.id, profile.contact);
  ACCESS_UNSUB = db.collection("purchases").doc(docId).onSnapshot(
    (doc) => {
      const wasAccess = HAS_ACCESS;
      HAS_ACCESS = doc.exists;
      renderNow();
      if (!wasAccess && HAS_ACCESS) {
        const banner = document.getElementById("unlockBanner");
        if (banner) banner.classList.add("show");
      }
    },
    () => renderNow()
  );
}

function renderFolderPage(rootId) {
  const root = document.getElementById(rootId);
  const f = CURRENT_FOLDER;
  const prompts = CURRENT_FOLDER_PROMPTS;

  const cardsHtml = prompts.map((p, idx) => {
    const unlocked = p.isFree || HAS_ACCESS;
    return `
      <article class="prompt-card folder-prompt-card">
        <div class="prompt-card-top">
          <span class="prompt-tag">${escapeHtml(p.category || "Umumiy")}${p.grade ? " · " + escapeHtml(p.grade) : ""}</span>
          ${p.isFree ? `<span class="price-sticker free">Bepul</span>` : (HAS_ACCESS ? `<span class="price-sticker free">Ochilgan ✓</span>` : `<span class="price-sticker">🔒</span>`)}
        </div>
        <div class="prompt-card-header">
          <button type="button" class="prompt-toggle" aria-expanded="false" aria-label="Kengaytirish">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <h3>${escapeHtml(p.title)}</h3>
        </div>
        <div class="prompt-card-body">
        <p class="desc">${escapeHtml(p.description || "")}</p>
        <div class="prompt-preview ${unlocked ? "" : "locked"}">${
          unlocked ? `<strong>Eng:</strong><br>` + escapeHtml(p.promptText || "") : escapeHtml(truncate(p.promptText || "", 140))
        }</div>
        ${
          unlocked
            ? `<div class="prompt-actions">
                 <button class="btn btn-cta btn-sm copy-prompt-btn" data-id="${p.id}" data-lang="en">Nusxa olish (inglizcha)</button>
                 <button class="btn btn-chatgpt btn-sm chatgpt-open-btn" data-id="${p.id}" data-lang="en" title="ChatGPT'da ochish">ChatGPT'da ochish</button>
               </div>`
            : ""
        }
        ${
          unlocked && p.promptTextUz
            ? `<div class="prompt-preview prompt-translation"><strong>Uzb:</strong><br>${escapeHtml(p.promptTextUz)}</div>
               <div class="prompt-actions">
                 <button class="btn btn-outline btn-sm copy-prompt-btn" data-id="${p.id}" data-lang="uz">Nusxa olish (o'zbekcha)</button>
                 <button class="btn btn-chatgpt btn-sm chatgpt-open-btn" data-id="${p.id}" data-lang="uz" title="ChatGPT'da ochish">ChatGPT'da ochish</button>
               </div>`
            : ""
        }
        ${
          !unlocked
            ? `<button class="btn btn-ghost btn-sm btn-block">Qulflangan — papkani sotib oling</button>`
            : ""
        }
        </div>
      </article>
    `;
  }).join("");

  root.innerHTML = `
    <div class="folder-header">
      <a href="oqituvchi.html" class="folder-back">← Barcha papkalar</a>
      <h1>${escapeHtml(f.name)}</h1>
      <p class="lead">${escapeHtml(f.description || "")}</p>
      <div class="folder-header-meta">
        <span>${prompts.length} ta prompt</span>
        <span>·</span>
        <span>1 tasi bepul, qolganlari — <strong>${formatPrice(f.price)}</strong></span>
      </div>
      <div class="unlock-banner" id="unlockBanner">🎉 Ushbu papka siz uchun ochildi! Barcha promptlardan foydalanishingiz mumkin.</div>
      ${
        HAS_ACCESS
          ? ``
          : `<button class="btn btn-cta" id="buyFolderBtn">Papkani sotib olish — ${formatPrice(f.price)}</button>`
      }
    </div>
    <div class="prompt-grid folder-prompt-grid">
      ${cardsHtml || `<div class="empty-state">Bu papkada hozircha prompt yo'q.</div>`}
    </div>
  `;

  const buyBtn = document.getElementById("buyFolderBtn");
  if (buyBtn) buyBtn.addEventListener("click", () => openPurchaseModal(f));

  root.querySelectorAll(".prompt-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".prompt-card");
      const body = card.querySelector(".prompt-card-body");
      const isOpen = card.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      if (body) body.style.display = isOpen ? "flex" : "none";
    });
  });

  root.querySelectorAll(".copy-prompt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = prompts.find((x) => x.id === btn.dataset.id);
      if (!p) return;
      const text = btn.dataset.lang === "uz" ? (p.promptTextUz || "") : (p.promptText || "");
      navigator.clipboard.writeText(text);
      const original = btn.dataset.lang === "uz" ? "Nusxa olish (o'zbekcha)" : "Nusxa olish (inglizcha)";
      btn.textContent = "Nusxalandi ✓";
      setTimeout(() => (btn.textContent = original), 1800);
    });
  });

  root.querySelectorAll(".chatgpt-open-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = prompts.find((x) => x.id === btn.dataset.id);
      if (!p) return;
      const text = btn.dataset.lang === "uz" ? (p.promptTextUz || "") : (p.promptText || "");
      if (!text) return;
      const url = "https://chatgpt.com/?q=" + encodeURIComponent(text);
      window.open(url, "_blank", "noopener");
    });
  });
}

// ============================================================
// SOTIB OLISH MODALI — ism/kontakt so'raladi, so'rov yaratiladi,
// adminga Telegram orqali avtomatik xabar boradi
// ============================================================
function openPurchaseModal(folder) {
  const profile = getTeacherProfile();
  const body = `
    <button class="modal-close" id="modalCloseBtn" aria-label="Yopish">×</button>
    <h2>«${escapeHtml(folder.name)}» papkasini sotib olish</h2>
    <p style="color:var(--text-muted); margin-top:-6px;">Narxi: <strong>${formatPrice(folder.price)}</strong></p>
    <div class="form-error" id="purchaseError"></div>
    <div id="purchaseFormWrap">
      <div class="field">
        <label for="buyerName">Ismingiz</label>
        <input type="text" id="buyerName" value="${escapeHtml(profile.name || "")}" placeholder="Masalan: Malika Yusupova">
      </div>
      <div class="field">
        <label for="buyerContact">Telegram username (yoki telefon raqam)</label>
        <input type="text" id="buyerContact" value="${escapeHtml(profile.contact || "")}" placeholder="@username yoki +998...">
        <div class="field-hint">Shu ma'lumot orqali admin siz ekaningizni tanib, papkani sizga ochadi.</div>
      </div>
      <button class="btn btn-cta btn-block" id="sendRequestBtn">So'rov yuborish</button>
    </div>
    <div id="purchaseDoneWrap" style="display:none;">
      <div class="unlock-banner show" style="position:static;">So'rovingiz yuborildi ✓</div>
      <p style="margin-top:14px;">Endi to'lovni amalga oshirib, <strong>to'lov skrinshotini</strong> Telegram orqali yuboring. Admin tekshirib, tasdiqlagach — bu papka avtomatik sizga ochiladi (sahifani qayta yuklash shart emas).</p>
      <a class="btn btn-cta btn-block" target="_blank" rel="noopener" id="tgLink">Telegram orqali skrinshot yuborish</a>
    </div>
  `;

  const content = document.getElementById("modalContent");
  content.innerHTML = body;
  document.getElementById("modalBackdrop").classList.add("open");
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);

  document.getElementById("sendRequestBtn").addEventListener("click", () => {
    const name = document.getElementById("buyerName").value.trim();
    const contact = document.getElementById("buyerContact").value.trim();
    const errEl = document.getElementById("purchaseError");

    if (!name || !contact) {
      errEl.textContent = "Iltimos, ism va kontaktni to'ldiring.";
      errEl.classList.add("show");
      return;
    }
    errEl.classList.remove("show");

    const btn = document.getElementById("sendRequestBtn");
    btn.disabled = true;
    btn.textContent = "Yuborilmoqda...";

    saveTeacherProfile({ name, contact });

    const reqData = {
      folderId: folder.id,
      folderName: folder.name,
      folderPrice: folder.price || 0,
      teacherName: name,
      teacherContact: contact,
      deviceId: getDeviceId(),
      status: "pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("purchaseRequests").add(reqData)
      .then((docRef) => {
        const msg =
          `🆕 <b>Yangi so'rov</b>\n` +
          `Papka: <b>${escapeHtml(folder.name)}</b>\n` +
          `Narxi: ${formatPrice(folder.price)}\n` +
          `Ism: ${escapeHtml(name)}\n` +
          `Kontakt: ${escapeHtml(contact)}\n` +
          `So'rov ID: ${docRef.id}\n\n` +
          `Skrinshot kutilmoqda. Tasdiqlash uchun admin panelga o'ting.`;
        notifyAdminTelegram(msg);

        document.getElementById("purchaseFormWrap").style.display = "none";
        document.getElementById("purchaseDoneWrap").style.display = "block";
        const tgLink = document.getElementById("tgLink");
        tgLink.href = `https://t.me/${TELEGRAM_CONFIG.adminUsername}?text=${encodeURIComponent(
          "Assalomu alaykum! \"" + folder.name + "\" papkasi uchun to'lov skrinshotini yuboraman. (So'rov ID: " + docRef.id + ")"
        )}`;

        watchAccessAndRender("folderRoot");
      })
      .catch((err) => {
        errEl.textContent = "Xatolik: " + err.message;
        errEl.classList.add("show");
        btn.disabled = false;
        btn.textContent = "So'rov yuborish";
      });
  });
}

function closeModal() {
  const backdrop = document.getElementById("modalBackdrop");
  if (backdrop) backdrop.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  const backdrop = document.getElementById("modalBackdrop");
  if (backdrop) {
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});
