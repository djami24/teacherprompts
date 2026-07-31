// ============================================================
// SAYT SOZLAMALARI — shu yerlarni o'zingizga moslang
// ============================================================
const SITE_CONFIG = {
  telegramUsername: "sizning_telegram_username", // @ belgisisiz kiriting
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

// ============================================================
// Promptlarni Firestore'dan yuklash va render qilish
// ============================================================
let ALL_PROMPTS = [];
let ACTIVE_CATEGORY = "all";
let ACTIVE_SEARCH = "";
let RENDER_OPTS = {};

function loadPrompts(opts) {
  RENDER_OPTS = opts;
  const grid = document.getElementById(opts.gridId);

  db.collection("prompts")
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      ALL_PROMPTS = [];
      snapshot.forEach((doc) => {
        ALL_PROMPTS.push({ id: doc.id, ...doc.data() });
      });

      const statCount = document.getElementById("statCount");
      if (statCount) statCount.textContent = ALL_PROMPTS.length;

      if (opts.showFilters) buildFilterChips();
      renderGrid();

      if (opts.searchInputId) {
        document.getElementById(opts.searchInputId).addEventListener("input", (e) => {
          ACTIVE_SEARCH = e.target.value.trim().toLowerCase();
          renderGrid();
        });
      }
    })
    .catch((err) => {
      console.error("Promptlarni yuklashda xato:", err);
      grid.innerHTML = `<div class="empty-state">Promptlarni yuklab bo'lmadi. Firebase sozlamalarini tekshiring.<br><span style="font-size:0.75rem;">(${escapeHtml(err.message)})</span></div>`;
    });
}

function buildFilterChips() {
  const bar = document.getElementById(RENDER_OPTS.filterBarId);
  const categories = Array.from(new Set(ALL_PROMPTS.map((p) => p.category).filter(Boolean)));

  // mavjud "Barchasi" chipidan keyingi eski chiplarni tozalash
  bar.querySelectorAll(".filter-chip:not([data-cat='all'])").forEach((el) => el.remove());

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-chip";
    btn.dataset.cat = cat;
    btn.textContent = cat;
    btn.addEventListener("click", () => {
      ACTIVE_CATEGORY = cat;
      updateActiveChip(bar);
      renderGrid();
    });
    bar.insertBefore(btn, bar.querySelector(".search-input"));
  });

  bar.querySelector('[data-cat="all"]').addEventListener("click", () => {
    ACTIVE_CATEGORY = "all";
    updateActiveChip(bar);
    renderGrid();
  });
}

function updateActiveChip(bar) {
  bar.querySelectorAll(".filter-chip").forEach((el) => {
    el.classList.toggle("active", el.dataset.cat === ACTIVE_CATEGORY);
  });
}

function renderGrid() {
  const grid = document.getElementById(RENDER_OPTS.gridId);
  let list = ALL_PROMPTS;

  if (ACTIVE_CATEGORY !== "all") {
    list = list.filter((p) => p.category === ACTIVE_CATEGORY);
  }
  if (ACTIVE_SEARCH) {
    list = list.filter((p) =>
      (p.title || "").toLowerCase().includes(ACTIVE_SEARCH) ||
      (p.description || "").toLowerCase().includes(ACTIVE_SEARCH) ||
      (p.category || "").toLowerCase().includes(ACTIVE_SEARCH)
    );
  }
  if (RENDER_OPTS.limitCount) {
    list = list.slice(0, RENDER_OPTS.limitCount);
  }

  if (list.length === 0) {
    grid.innerHTML = `<div class="empty-state">Hozircha promptlar topilmadi.</div>`;
    return;
  }

  grid.innerHTML = list.map((p) => renderCard(p)).join("");

  grid.querySelectorAll(".prompt-card").forEach((card) => {
    card.addEventListener("click", () => openModal(card.dataset.id));
  });
}

function renderCard(p) {
  const isFree = !p.price || p.price === 0;
  const preview = truncate(p.promptText || "", 140);
  return `
    <article class="prompt-card" data-id="${p.id}">
      <div class="prompt-card-top">
        <span class="prompt-tag">${escapeHtml(p.category || "Umumiy")}${p.grade ? " · " + escapeHtml(p.grade) : ""}</span>
        <span class="price-sticker ${isFree ? "free" : ""}">${formatPrice(p.price)}</span>
      </div>
      <h3>${escapeHtml(p.title)}</h3>
      <p class="desc">${escapeHtml(p.description || "")}</p>
      <div class="prompt-preview ${isFree ? "" : "locked"}">${escapeHtml(preview)}</div>
      <div class="prompt-card-footer">
        <button class="btn btn-ghost">Batafsil →</button>
      </div>
    </article>
  `;
}

function openModal(id) {
  const p = ALL_PROMPTS.find((x) => x.id === id);
  if (!p) return;
  const isFree = !p.price || p.price === 0;

  const body = `
    <button class="modal-close" id="modalCloseBtn" aria-label="Yopish">×</button>
    <span class="prompt-tag">${escapeHtml(p.category || "Umumiy")}${p.grade ? " · " + escapeHtml(p.grade) : ""}</span>
    <h2>${escapeHtml(p.title)}</h2>
    <span class="price-sticker ${isFree ? "free" : ""}">${formatPrice(p.price)}</span>
    <p style="margin-top:14px; color:var(--text-muted);">${escapeHtml(p.description || "")}</p>
    <div class="modal-full-text">${
      isFree
        ? escapeHtml(p.promptText || "")
        : escapeHtml(truncate(p.promptText || "", 220)) + "\n\n… (to'liq matn sotib olingandan so'ng ochiladi)"
    }</div>
    ${
      isFree
        ? `<button class="btn btn-cta btn-block" id="copyBtn">Nusxa olish</button>`
        : `<div class="purchase-box">
             <p>To'liq promptni olish uchun Telegram orqali murojaat qiling. To'lovdan so'ng to'liq matn yuboriladi.</p>
             <a class="btn btn-cta btn-block" target="_blank" rel="noopener"
                href="https://t.me/${SITE_CONFIG.telegramUsername}?text=${encodeURIComponent("Assalomu alaykum! \"" + p.title + "\" promptini sotib olmoqchiman.")}">
               Telegram orqali sotib olish
             </a>
           </div>`
    }
  `;

  const content = document.getElementById("modalContent");
  content.innerHTML = body;
  document.getElementById("modalBackdrop").classList.add("open");
  document.getElementById("modalCloseBtn").addEventListener("click", closeModal);

  const copyBtn = document.getElementById("copyBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(p.promptText || "");
      copyBtn.textContent = "Nusxalandi ✓";
      setTimeout(() => (copyBtn.textContent = "Nusxa olish"), 1800);
    });
  }
}

function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("open");
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
