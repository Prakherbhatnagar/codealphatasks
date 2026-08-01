/* ==========================================================================
   APP.JS — Shared across every page
   - Product catalogue (mock data, acts as our "backend")
   - Cart + Wishlist engine backed by localStorage
   - Toast notification system
   - Header interactions: mobile drawer, search suggestions, scroll shadow
   - Page loader
   ========================================================================== */

/* -------------------------- Product Catalogue -------------------------------- */
// A single source of truth for products, shared by home/listing/detail pages.
const PRODUCTS = [
  { id: "p01", name: "AeroFit Wireless Earbuds", category: "Electronics", price: 79.99, oldPrice: 99.99, rating: 4.6, reviews: 312, stock: 24, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop", badge: "Best Seller", featured: true, latest: false, desc: "Immersive sound with active noise cancellation and 30-hour battery life. Sweat resistant, built for the gym and beyond." },
  { id: "p02", name: "UrbanTrek Backpack 24L", category: "Bags", price: 54.5, oldPrice: null, rating: 4.4, reviews: 198, stock: 40, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop", badge: "New", featured: true, latest: true, desc: "Weatherproof daypack with a padded laptop sleeve, hidden pocket, and breathable mesh straps for all-day comfort." },
  { id: "p03", name: "Chrono Steel Watch", category: "Accessories", price: 129.0, oldPrice: 159.0, rating: 4.8, reviews: 521, stock: 12, image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=600&auto=format&fit=crop", badge: "Best Seller", featured: true, latest: false, desc: "Stainless steel chronograph with sapphire coated crystal glass, 100m water resistance, and a genuine leather strap." },
  { id: "p04", name: "CloudStep Running Shoes", category: "Footwear", price: 89.0, oldPrice: null, rating: 4.5, reviews: 276, stock: 33, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop", badge: "New", featured: false, latest: true, desc: "Responsive foam cushioning with a breathable knit upper — built for daily runs and long miles alike." },
  { id: "p05", name: "Minimalist Leather Wallet", category: "Accessories", price: 34.99, oldPrice: 45.0, rating: 4.3, reviews: 143, stock: 60, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=600&auto=format&fit=crop", badge: null, featured: false, latest: false, desc: "Full-grain leather bifold wallet with RFID-blocking lining and a slim profile that fits any pocket." },
  { id: "p06", name: "PulseCam Action Camera", category: "Electronics", price: 199.0, oldPrice: 249.0, rating: 4.7, reviews: 402, stock: 18, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=600&auto=format&fit=crop", badge: "Best Seller", featured: true, latest: false, desc: "4K60 video, waterproof to 10m, and in-body stabilization for buttery smooth footage on any adventure." },
  { id: "p07", name: "Nordic Ceramic Mug Set", category: "Home", price: 28.0, oldPrice: null, rating: 4.6, reviews: 89, stock: 75, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop", badge: "New", featured: false, latest: true, desc: "Set of 4 hand-glazed stoneware mugs, microwave and dishwasher safe, in soft muted tones." },
  { id: "p08", name: "FlexFit Yoga Mat", category: "Sports", price: 39.0, oldPrice: 49.0, rating: 4.5, reviews: 231, stock: 50, image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?q=80&w=600&auto=format&fit=crop", badge: null, featured: false, latest: false, desc: "6mm non-slip TPE mat with alignment lines, lightweight and reversible for double the color options." },
  { id: "p09", name: "Skyline Denim Jacket", category: "Apparel", price: 68.0, oldPrice: null, rating: 4.4, reviews: 167, stock: 27, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600&auto=format&fit=crop", badge: "New", featured: true, latest: true, desc: "Classic mid-wash denim jacket with a tailored fit and reinforced stitching for everyday wear." },
  { id: "p10", name: "GlowPro Desk Lamp", category: "Home", price: 45.0, oldPrice: 59.0, rating: 4.7, reviews: 154, stock: 22, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=600&auto=format&fit=crop", badge: "Best Seller", featured: false, latest: false, desc: "Adjustable LED desk lamp with 5 brightness levels, USB charging port, and a memory function." },
  { id: "p11", name: "TrailBlaze Hiking Boots", category: "Footwear", price: 112.0, oldPrice: 140.0, rating: 4.6, reviews: 298, stock: 15, image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=600&auto=format&fit=crop", badge: null, featured: false, latest: false, desc: "Waterproof leather boots with an aggressive tread pattern, built for rugged trails and long treks." },
  { id: "p12", name: "SoundWave Bluetooth Speaker", category: "Electronics", price: 59.99, oldPrice: null, rating: 4.5, reviews: 385, stock: 44, image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?q=80&w=600&auto=format&fit=crop", badge: "New", featured: false, latest: true, desc: "Portable speaker with 360° sound, IPX7 waterproofing, and 20 hours of playtime on a single charge." },
];

function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

/* -------------------------- Storage Keys -------------------------------- */
const STORAGE_KEYS = {
  cart: "shophive_cart",
  wishlist: "shophive_wishlist",
  user: "shophive_user",
  orders: "shophive_orders",
};

/* -------------------------- Small storage helpers -------------------------------- */
function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn("Storage read failed for", key, e);
    return fallback;
  }
}
function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage write failed for", key, e);
  }
}
function removeStore(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("Storage remove failed for", key, e);
  }
}

/* ==========================================================================
   CART ENGINE
   Cart shape: [{ id, qty }]
   ========================================================================== */
const Cart = {
  get() {
    return readStore(STORAGE_KEYS.cart, []);
  },
  save(items) {
    writeStore(STORAGE_KEYS.cart, items);
    updateCartCount();
  },
  add(id, qty = 1) {
    const items = this.get();
    const existing = items.find((i) => i.id === id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ id, qty });
    }
    this.save(items);
  },
  updateQty(id, qty) {
    let items = this.get();
    if (qty <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const existing = items.find((i) => i.id === id);
      if (existing) existing.qty = qty;
    }
    this.save(items);
  },
  remove(id) {
    const items = this.get().filter((i) => i.id !== id);
    this.save(items);
  },
  clear() {
    this.save([]);
  },
  count() {
    return this.get().reduce((sum, i) => sum + i.qty, 0);
  },
  detailedItems() {
    return this.get()
      .map((i) => {
        const product = getProductById(i.id);
        return product ? { ...product, qty: i.qty } : null;
      })
      .filter(Boolean);
  },
  subtotal() {
    return this.detailedItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  },
};

/* ==========================================================================
   WISHLIST ENGINE — array of product ids
   ========================================================================== */
const Wishlist = {
  get() {
    return readStore(STORAGE_KEYS.wishlist, []);
  },
  save(items) {
    writeStore(STORAGE_KEYS.wishlist, items);
    updateWishlistCount();
  },
  toggle(id) {
    const items = this.get();
    const idx = items.indexOf(id);
    if (idx > -1) {
      items.splice(idx, 1);
      this.save(items);
      return false; // now removed
    }
    items.push(id);
    this.save(items);
    return true; // now added
  },
  has(id) {
    return this.get().includes(id);
  },
  count() {
    return this.get().length;
  },
};

/* ==========================================================================
   TOAST NOTIFICATIONS
   ========================================================================== */
function ensureToastContainer() {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }
  return container;
}

const TOAST_ICONS = { success: "✓", error: "✕", warning: "!", info: "i" };

function showToast(message, type = "info", duration = 3200) {
  const container = ensureToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.info}</span>
    <span class="toast-msg"></span>
    <button class="toast-close" aria-label="Dismiss notification">&times;</button>
  `;
  toast.querySelector(".toast-msg").textContent = message;
  container.appendChild(toast);

  const remove = () => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 220);
  };
  toast.querySelector(".toast-close").addEventListener("click", remove);
  const timer = setTimeout(remove, duration);
  toast.addEventListener("mouseenter", () => clearTimeout(timer));
}

/* ==========================================================================
   HEADER COUNTS
   ========================================================================== */
function updateCartCount() {
  const count = Cart.count();
  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
    el.classList.remove("bump");
    // force reflow so animation retriggers
    void el.offsetWidth;
    el.classList.add("bump");
  });
}

function updateWishlistCount() {
  const count = Wishlist.count();
  document.querySelectorAll("[data-wishlist-count]").forEach((el) => {
    el.textContent = count;
    el.style.display = count > 0 ? "flex" : "none";
  });
}

/* ==========================================================================
   ADD TO CART (shared handler used by product cards everywhere)
   ========================================================================== */
function handleAddToCart(id, opts = {}) {
  const product = getProductById(id);
  if (!product) return;
  Cart.add(id, opts.qty || 1);
  showToast(`${product.name} added to cart`, "success");
}

function handleToggleWishlist(id, btnEl) {
  const product = getProductById(id);
  if (!product) return;
  const added = Wishlist.toggle(id);
  if (btnEl) btnEl.classList.toggle("is-active", added);
  showToast(added ? `${product.name} added to wishlist` : `${product.name} removed from wishlist`, added ? "success" : "info");
}

/* ==========================================================================
   STAR RATING RENDER HELPER
   ========================================================================== */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let stars = "★".repeat(full);
  if (half) stars += "⯨";
  stars += "☆".repeat(5 - full - (half ? 1 : 0));
  return stars;
}

/* ==========================================================================
   PRODUCT CARD FACTORY — used by home page + listing page
   ========================================================================== */
function createProductCard(product) {
  const inWishlist = Wishlist.has(product.id);
  const el = document.createElement("article");
  el.className = "product-card";
  el.setAttribute("data-product-id", product.id);
  el.innerHTML = `
    <div class="product-thumb">
      <a href="product.html?id=${product.id}" aria-label="View ${product.name}">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </a>
      <div class="product-badges">
        ${product.badge ? `<span class="badge ${product.badge === "New" ? "badge-green" : "badge-amber"}">${product.badge}</span>` : ""}
        ${product.oldPrice ? `<span class="badge badge-red">-${Math.round((1 - product.price / product.oldPrice) * 100)}%</span>` : ""}
      </div>
      <button class="wishlist-btn ${inWishlist ? "is-active" : ""}" aria-label="Toggle wishlist" data-wishlist-toggle="${product.id}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-6.7-4.35-9.3-8.1C.6 9.8 1.8 6 5.4 5c2-.55 3.9.2 5.1 1.7 1.2-1.5 3.1-2.25 5.1-1.7 3.6 1 4.8 4.8 2.7 7.9C18.7 16.65 12 21 12 21z"/></svg>
      </button>
      <button class="quick-view-btn" data-quick-view="${product.id}">Quick View</button>
    </div>
    <div class="product-info">
      <span class="product-category">${product.category}</span>
      <h3 class="product-name"><a href="product.html?id=${product.id}">${product.name}</a></h3>
      <div class="product-rating">
        <span class="stars">${renderStars(product.rating)}</span>
        <span>${product.rating} (${product.reviews})</span>
      </div>
      <div class="product-price">
        <span class="current">$${product.price.toFixed(2)}</span>
        ${product.oldPrice ? `<span class="original">$${product.oldPrice.toFixed(2)}</span>` : ""}
      </div>
    </div>
    <div class="product-actions">
      <button class="add-to-cart-btn" data-add-to-cart="${product.id}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
        Add to Cart
      </button>
    </div>
  `;
  return el;
}

/* Delegate clicks for add-to-cart / wishlist / quick-view within a container */
function bindProductGridEvents(container) {
  container.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add-to-cart]");
    const wishBtn = e.target.closest("[data-wishlist-toggle]");
    const quickBtn = e.target.closest("[data-quick-view]");

    if (addBtn) {
      e.preventDefault();
      handleAddToCart(addBtn.getAttribute("data-add-to-cart"));
      addBtn.classList.add("in-cart");
      const originalHTML = addBtn.innerHTML;
      addBtn.innerHTML = "✓ Added";
      setTimeout(() => {
        addBtn.innerHTML = originalHTML;
        addBtn.classList.remove("in-cart");
      }, 1400);
    }
    if (wishBtn) {
      e.preventDefault();
      handleToggleWishlist(wishBtn.getAttribute("data-wishlist-toggle"), wishBtn);
    }
    if (quickBtn) {
      e.preventDefault();
      openQuickView(quickBtn.getAttribute("data-quick-view"));
    }
  });
}

/* ==========================================================================
   QUICK VIEW MODAL
   ========================================================================== */
function ensureQuickViewModal() {
  let modal = document.getElementById("quickViewModal");
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "quickViewModal";
  modal.className = "modal-overlay";
  modal.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="qvTitle">
      <button class="modal-close" aria-label="Close quick view">&times;</button>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".modal-close")) closeQuickView();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeQuickView();
  });

  // inject minimal styles for the modal once
  if (!document.getElementById("quickViewStyles")) {
    const style = document.createElement("style");
    style.id = "quickViewStyles";
    style.textContent = `
      .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.55); z-index: 500;
        display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden;
        transition: opacity 220ms ease, visibility 220ms ease; padding: 20px; }
      .modal-overlay.is-open { opacity: 1; visibility: visible; }
      .modal-box { background: #fff; border-radius: 20px; max-width: 780px; width: 100%; max-height: 88vh;
        overflow-y: auto; position: relative; padding: 32px; transform: translateY(16px); transition: transform 260ms ease; }
      .modal-overlay.is-open .modal-box { transform: translateY(0); }
      .modal-close { position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%;
        background: #F8FAFC; font-size: 1.3rem; line-height: 1; }
      .qv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
      .qv-grid img { border-radius: 14px; width: 100%; aspect-ratio: 1/1; object-fit: cover; }
      @media (max-width: 640px) { .qv-grid { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }
  return modal;
}

function openQuickView(id) {
  const product = getProductById(id);
  if (!product) return;
  const modal = ensureQuickViewModal();
  modal.querySelector(".modal-body").innerHTML = `
    <div class="qv-grid">
      <img src="${product.image}" alt="${product.name}">
      <div>
        <span class="product-category">${product.category}</span>
        <h2 id="qvTitle" style="margin:8px 0;">${product.name}</h2>
        <div class="product-rating"><span class="stars">${renderStars(product.rating)}</span><span>${product.rating} (${product.reviews} reviews)</span></div>
        <div class="product-price" style="margin:14px 0;">
          <span class="current">$${product.price.toFixed(2)}</span>
          ${product.oldPrice ? `<span class="original">$${product.oldPrice.toFixed(2)}</span>` : ""}
        </div>
        <p style="color:var(--color-text-muted);font-size:0.92rem;">${product.desc}</p>
        <div style="display:flex;gap:10px;margin-top:22px;">
          <button class="btn btn-primary" data-add-to-cart="${product.id}">Add to Cart</button>
          <a class="btn btn-secondary" href="product.html?id=${product.id}">View Full Details</a>
        </div>
      </div>
    </div>
  `;
  modal.classList.add("is-open");
  document.body.style.overflow = "hidden";
}
function closeQuickView() {
  const modal = document.getElementById("quickViewModal");
  if (modal) modal.classList.remove("is-open");
  document.body.style.overflow = "";
}

function updateAuthUI() {
  const token = localStorage.getItem("shophive_jwt_token") || "";
  const user = readStore(STORAGE_KEYS.user, null);
  const isLoggedIn = !!(token || user);

  // Update Account icon links in navbar header
  const accountBtns = document.querySelectorAll('a[aria-label="Account"], .account-btn-link');
  accountBtns.forEach((btn) => {
    if (isLoggedIn && user) {
      btn.href = "profile.html";
      btn.setAttribute("title", `My Account (${user.name || "User"})`);
      btn.classList.add("is-logged-in");
      const initial = (user.name || "U").charAt(0).toUpperCase();
      btn.innerHTML = `<span style="display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;background:var(--color-primary);color:#fff;font-weight:700;font-size:0.75rem;">${initial}</span>`;
    } else {
      btn.href = "login.html";
      btn.setAttribute("title", "Account / Login");
      btn.classList.remove("is-logged-in");
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6"/></svg>`;
    }
  });

  // Update Mobile Drawer Actions
  const drawerActions = document.querySelector(".mobile-drawer .drawer-actions");
  if (drawerActions) {
    if (isLoggedIn && user) {
      const initial = (user.name || "U").charAt(0).toUpperCase();
      drawerActions.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--color-bg-alt,#F8FAFC);border-radius:12px;margin-bottom:12px;">
          <div style="width:38px;height:38px;border-radius:50%;background:var(--color-primary);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;">${initial}</div>
          <div style="overflow:hidden;">
            <div style="font-weight:700;font-size:0.9rem;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;">${user.name || "User Account"}</div>
            <div style="font-size:0.75rem;color:var(--color-text-muted);white-space:nowrap;text-overflow:ellipsis;overflow:hidden;">${user.email || ""}</div>
          </div>
        </div>
        <a href="profile.html" class="btn btn-primary btn-block" style="margin-bottom:8px;">My Profile & Orders</a>
        <button id="drawerLogoutBtn" class="btn btn-secondary btn-block" type="button">Logout</button>
      `;
      const logoutBtn = document.getElementById("drawerLogoutBtn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
          if (typeof API !== "undefined") {
            try { await API.logout(); } catch (e) {}
          }
          localStorage.removeItem("shophive_jwt_token");
          removeStore(STORAGE_KEYS.user);
          showToast("Logged out successfully", "info");
          setTimeout(() => (window.location.href = "login.html"), 600);
        });
      }
    } else {
      drawerActions.innerHTML = `
        <a href="login.html" class="btn btn-secondary btn-block">Login</a>
        <a href="login.html?mode=register" class="btn btn-primary btn-block">Register</a>
      `;
    }
  }
}

/* ==========================================================================
   HEADER: mobile drawer, search suggestions
   ========================================================================== */
function initHeader() {
  updateCartCount();
  updateWishlistCount();
  updateAuthUI();

  // Mobile drawer toggle
  const toggle = document.querySelector(".nav-toggle");
  const drawer = document.querySelector(".mobile-drawer");
  if (toggle && drawer) {
    toggle.addEventListener("click", () => {
      const isOpen = drawer.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    drawer.querySelectorAll("a, .drawer-close, .drawer-backdrop").forEach((el) => {
      el.addEventListener("click", () => {
        drawer.classList.remove("is-open");
        toggle.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  // Search suggestions (desktop + mobile)
  document.querySelectorAll("[data-search-input]").forEach((input) => {
    const wrapper = input.closest(".navbar-search");
    if (!wrapper) return;
    let suggBox = wrapper.querySelector(".search-suggestions");
    if (!suggBox) {
      suggBox = document.createElement("div");
      suggBox.className = "search-suggestions";
      wrapper.appendChild(suggBox);
    }

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (q.length < 2) {
        suggBox.classList.remove("is-open");
        suggBox.innerHTML = "";
        return;
      }
      const matches = PRODUCTS.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)).slice(0, 6);
      if (!matches.length) {
        suggBox.innerHTML = `<div style="padding:14px 16px;color:var(--color-text-faint);font-size:0.85rem;">No products found for "${input.value}"</div>`;
        suggBox.classList.add("is-open");
        return;
      }
      suggBox.innerHTML = matches
        .map((p) => `<button type="button" data-goto="${p.id}">${p.name}<span class="sugg-cat">${p.category}</span></button>`)
        .join("");
      suggBox.classList.add("is-open");
    });

    suggBox.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-goto]");
      if (btn) window.location.href = `product.html?id=${btn.getAttribute("data-goto")}`;
    });

    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) suggBox.classList.remove("is-open");
    });

    const form = wrapper.closest("form") || wrapper.querySelector("form");
  });

  // Search form submit -> go to products.html?search=
  document.querySelectorAll("[data-search-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("[data-search-input]");
      const q = input.value.trim();
      if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    });
  });

  // Header shadow on scroll
  const header = document.querySelector(".site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      header.style.boxShadow = window.scrollY > 8 ? "var(--shadow-sm)" : "none";
    });
  }
}

/* ==========================================================================
   PAGE LOADER
   ========================================================================== */
function initPageLoader() {
  const loader = document.querySelector(".page-loader");
  if (!loader) return;
  window.addEventListener("load", () => {
    setTimeout(() => loader.classList.add("is-hidden"), 280);
  });
  // Fallback in case load event already fired
  setTimeout(() => loader.classList.add("is-hidden"), 1600);
}

/* ==========================================================================
   NEWSLETTER FORM (shared, appears on home + footer areas)
   ========================================================================== */
function initNewsletterForm() {
  document.querySelectorAll("[data-newsletter-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = form.querySelector("input[type='email']");
      if (!input.value || !input.checkValidity()) {
        showToast("Please enter a valid email address", "error");
        return;
      }
      const btn = form.querySelector("button");
      btn.classList.add("btn-loading");
      setTimeout(() => {
        btn.classList.remove("btn-loading");
        input.value = "";
        showToast("You're subscribed! Check your inbox for a welcome offer.", "success");
      }, 800);
    });
  });
}

/* ==========================================================================
   FOOTER YEAR
   ========================================================================== */
function initFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}

/* ==========================================================================
   INIT — runs on every page
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  initPageLoader();
  initHeader();
  initNewsletterForm();
  initFooterYear();
});