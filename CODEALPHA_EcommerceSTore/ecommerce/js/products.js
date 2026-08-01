/* ==========================================================================
   PRODUCTS.JS — Product listing page logic
   Handles: category/price/rating/stock filters, search, sorting, pagination
   ========================================================================== */

const PAGE_SIZE = 8;

const listingState = {
  search: "",
  categories: new Set(),
  maxPrice: 250,
  minRating: 0,
  inStockOnly: false,
  sort: "relevance",
  page: 1,
  wishlistView: false,
};

/* -------------------------- Init from URL params -------------------------------- */
function initFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("search")) listingState.search = params.get("search");
  if (params.get("category")) listingState.categories.add(params.get("category"));
  if (params.get("sort")) listingState.sort = params.get("sort");
  if (params.get("filter") === "bestsellers") listingState.bestsellersOnly = true;
  if (params.get("view") === "wishlist") listingState.wishlistView = true;
}

/* -------------------------- Build category filter checkboxes -------------------------------- */
function renderCategoryFilters() {
  const wrap = document.getElementById("categoryFilters");
  const categories = [...new Set(PRODUCTS.map((p) => p.category))].sort();
  wrap.innerHTML = categories
    .map((cat) => {
      const count = PRODUCTS.filter((p) => p.category === cat).length;
      const checked = listingState.categories.has(cat) ? "checked" : "";
      return `
      <label class="filter-option">
        <input type="checkbox" value="${cat}" data-category-filter ${checked}>
        <span>${cat}</span>
        <span class="fo-count">${count}</span>
      </label>`;
    })
    .join("");

  wrap.querySelectorAll("[data-category-filter]").forEach((box) => {
    box.addEventListener("change", () => {
      box.checked ? listingState.categories.add(box.value) : listingState.categories.delete(box.value);
      listingState.page = 1;
      renderListing();
    });
  });
}

/* -------------------------- Filtering + sorting pipeline -------------------------------- */
function getFilteredProducts() {
  let list = [...PRODUCTS];

  if (listingState.wishlistView) {
    const wl = Wishlist.get();
    list = list.filter((p) => wl.includes(p.id));
  }

  if (listingState.bestsellersOnly) {
    list = list.filter((p) => p.badge === "Best Seller");
  }

  if (listingState.search) {
    const q = listingState.search.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }

  if (listingState.categories.size > 0) {
    list = list.filter((p) => listingState.categories.has(p.category));
  }

  list = list.filter((p) => p.price <= listingState.maxPrice);
  list = list.filter((p) => p.rating >= listingState.minRating);

  if (listingState.inStockOnly) {
    list = list.filter((p) => p.stock > 0);
  }

  switch (listingState.sort) {
    case "price-asc": list.sort((a, b) => a.price - b.price); break;
    case "price-desc": list.sort((a, b) => b.price - a.price); break;
    case "rating": list.sort((a, b) => b.rating - a.rating); break;
    case "newest": list.sort((a, b) => (b.latest === a.latest ? 0 : b.latest ? 1 : -1)); break;
    default: break; // relevance = catalogue order
  }

  return list;
}

/* -------------------------- Active filter chips -------------------------------- */
function renderActiveChips() {
  const wrap = document.getElementById("activeFilters");
  const chips = [];

  if (listingState.search) chips.push({ label: `Search: "${listingState.search}"`, clear: () => (listingState.search = "") });
  listingState.categories.forEach((cat) => chips.push({ label: cat, clear: () => listingState.categories.delete(cat) }));
  if (listingState.maxPrice < 250) chips.push({ label: `Under $${listingState.maxPrice}`, clear: () => { listingState.maxPrice = 250; document.getElementById("priceRange").value = 250; document.getElementById("priceMaxLabel").textContent = "$250"; } });
  if (listingState.minRating > 0) chips.push({ label: `${listingState.minRating}+ stars`, clear: () => { listingState.minRating = 0; document.querySelector('input[name="rating"][value="0"]').checked = true; } });
  if (listingState.inStockOnly) chips.push({ label: "In stock", clear: () => { listingState.inStockOnly = false; document.getElementById("inStockOnly").checked = false; } });

  wrap.innerHTML = chips
    .map((c, i) => `<span class="active-filter-chip" data-chip-index="${i}">${c.label} <button aria-label="Remove filter">&times;</button></span>`)
    .join("");

  wrap.querySelectorAll(".active-filter-chip button").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      chips[i].clear();
      listingState.page = 1;
      renderListing();
    });
  });
}

/* -------------------------- Pagination -------------------------------- */
function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const nav = document.getElementById("pagination");
  if (totalPages <= 1) { nav.innerHTML = ""; return; }

  let html = `<button ${listingState.page === 1 ? "disabled" : ""} data-page="prev" aria-label="Previous page">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === listingState.page ? "active" : ""}" data-page="${i}">${i}</button>`;
  }
  html += `<button ${listingState.page === totalPages ? "disabled" : ""} data-page="next" aria-label="Next page">›</button>`;
  nav.innerHTML = html;

  nav.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-page");
      if (val === "prev") listingState.page = Math.max(1, listingState.page - 1);
      else if (val === "next") listingState.page = Math.min(totalPages, listingState.page + 1);
      else listingState.page = parseInt(val, 10);
      renderListing();
      document.querySelector(".listing-main").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* -------------------------- Master render -------------------------------- */
function renderListing() {
  const filtered = getFilteredProducts();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (listingState.page > totalPages) listingState.page = totalPages;

  const start = (listingState.page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");

  document.getElementById("resultsCount").textContent = filtered.length;

  if (pageItems.length === 0) {
    grid.style.display = "none";
    emptyState.style.display = "block";
  } else {
    grid.style.display = "grid";
    emptyState.style.display = "none";
    grid.innerHTML = "";
    pageItems.forEach((p) => grid.appendChild(createProductCard(p)));
  }

  renderActiveChips();
  renderPagination(filtered.length);

  // Page title / breadcrumb reflect state
  const titleEl = document.getElementById("pageTitle");
  const crumbEl = document.getElementById("breadcrumbLabel");
  let title = "All Products";
  if (listingState.wishlistView) title = "My Wishlist";
  else if (listingState.bestsellersOnly) title = "Best Sellers";
  else if (listingState.categories.size === 1) title = [...listingState.categories][0];
  else if (listingState.search) title = `Results for "${listingState.search}"`;
  titleEl.textContent = title;
  crumbEl.textContent = title;
}

/* -------------------------- Wire up controls -------------------------------- */
function bindListingControls() {
  document.getElementById("sortSelect").addEventListener("change", (e) => {
    listingState.sort = e.target.value;
    listingState.page = 1;
    renderListing();
  });

  const priceRange = document.getElementById("priceRange");
  priceRange.addEventListener("input", () => {
    listingState.maxPrice = parseInt(priceRange.value, 10);
    document.getElementById("priceMaxLabel").textContent = `$${listingState.maxPrice}`;
  });
  priceRange.addEventListener("change", () => {
    listingState.page = 1;
    renderListing();
  });

  document.querySelectorAll('input[name="rating"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      listingState.minRating = parseFloat(radio.value);
      listingState.page = 1;
      renderListing();
    });
  });

  document.getElementById("inStockOnly").addEventListener("change", (e) => {
    listingState.inStockOnly = e.target.checked;
    listingState.page = 1;
    renderListing();
  });

  document.getElementById("clearFilters").addEventListener("click", resetFilters);
  document.getElementById("emptyClearBtn").addEventListener("click", resetFilters);

  function resetFilters() {
    listingState.search = "";
    listingState.categories.clear();
    listingState.maxPrice = 250;
    listingState.minRating = 0;
    listingState.inStockOnly = false;
    listingState.bestsellersOnly = false;
    listingState.wishlistView = false;
    listingState.page = 1;
    priceRange.value = 250;
    document.getElementById("priceMaxLabel").textContent = "$250";
    document.querySelector('input[name="rating"][value="0"]').checked = true;
    document.getElementById("inStockOnly").checked = false;
    renderCategoryFilters();
    renderListing();
    history.replaceState(null, "", "products.html");
  }

  // Mobile filter drawer
  const sidebar = document.getElementById("filterSidebar");
  document.getElementById("openFilterDrawer").addEventListener("click", () => {
    sidebar.classList.add("is-open");
    document.body.style.overflow = "hidden";
  });
  document.getElementById("closeFilterDrawer").addEventListener("click", () => {
    sidebar.classList.remove("is-open");
    document.body.style.overflow = "";
  });
}

function initListingPage() {
  initFromURL();
  renderCategoryFilters();
  document.getElementById("sortSelect").value = listingState.sort;
  bindListingControls();
  renderListing();

  const grid = document.getElementById("productGrid");
  bindProductGridEvents(grid);
}

/* ==========================================================================
   PRODUCT DETAIL PAGE LOGIC
   (lives here too, since the required folder structure has one products.js
   covering both the listing and detail views)
   ========================================================================== */
function initProductDetailPage() {
  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get("id"));
  const content = document.getElementById("productDetailContent");
  const notFound = document.getElementById("notFoundState");

  if (!product) {
    content.style.display = "none";
    notFound.style.display = "block";
    return;
  }

  document.getElementById("pageMetaTitle").textContent = `${product.name} — ShopHive`;
  document.getElementById("crumbProductName").textContent = product.name;

  const images = [product.image, product.image, product.image];
  const thumbWrap = document.getElementById("galleryThumbs");
  thumbWrap.innerHTML = images
    .map((src, i) => `<button class="${i === 0 ? "active" : ""}" data-thumb="${i}"><img src="${src}" alt="${product.name} view ${i + 1}"></button>`)
    .join("");
  const mainImg = document.getElementById("galleryMainImg");
  mainImg.src = product.image;
  mainImg.alt = product.name;
  thumbWrap.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      thumbWrap.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      mainImg.style.opacity = 0;
      setTimeout(() => {
        mainImg.src = images[parseInt(btn.getAttribute("data-thumb"), 10)];
        mainImg.style.opacity = 1;
      }, 150);
    });
  });

  document.getElementById("pdCategory").textContent = product.category;
  document.getElementById("pdName").textContent = product.name;
  document.getElementById("pdStars").textContent = renderStars(product.rating);
  document.getElementById("pdRatingText").textContent = `${product.rating} (${product.reviews} reviews)`;
  document.getElementById("pdSku").textContent = `SKU: SH-${product.id.toUpperCase()}`;
  document.getElementById("pdPrice").textContent = `$${product.price.toFixed(2)}`;
  document.getElementById("pdDesc").textContent = product.desc;
  document.getElementById("pdFullDesc").textContent = `${product.desc} Designed with everyday durability in mind, this piece is put through rigorous quality checks before it ships from our warehouse to your door. Pair it with free returns for 30 days if it's not the right fit.`;

  if (product.oldPrice) {
    const oldEl = document.getElementById("pdOldPrice");
    oldEl.textContent = `$${product.oldPrice.toFixed(2)}`;
    oldEl.style.display = "inline";
    const discEl = document.getElementById("pdDiscountBadge");
    discEl.textContent = `${Math.round((1 - product.price / product.oldPrice) * 100)}% OFF`;
    discEl.style.display = "inline-flex";
  }

  const stockWrap = document.getElementById("pdStock");
  const stockText = document.getElementById("pdStockText");
  if (product.stock === 0) {
    stockWrap.classList.add("low");
    stockText.textContent = "Out of stock";
  } else if (product.stock <= 15) {
    stockWrap.classList.add("low");
    stockText.textContent = `Only ${product.stock} left in stock — order soon`;
  } else {
    stockText.textContent = "In stock and ready to ship";
  }

  document.getElementById("specCategory").textContent = product.category;
  document.getElementById("specRating").textContent = `${product.rating} / 5 (${product.reviews} reviews)`;
  document.getElementById("specStock").textContent = product.stock > 0 ? `${product.stock} units available` : "Out of stock";
  document.getElementById("specSku").textContent = `SH-${product.id.toUpperCase()}`;

  document.getElementById("reviewBigScore").textContent = product.rating;
  document.getElementById("reviewBigStars").textContent = renderStars(product.rating);
  document.getElementById("reviewCountText").textContent = `Based on ${product.reviews} reviews`;

  const wishBtn = document.getElementById("pdWishlistBtn");
  wishBtn.classList.toggle("is-active", Wishlist.has(product.id));
  wishBtn.addEventListener("click", () => handleToggleWishlist(product.id, wishBtn));

  const qtyInput = document.getElementById("qtyInput");
  document.getElementById("qtyMinus").addEventListener("click", () => {
    qtyInput.value = Math.max(1, parseInt(qtyInput.value, 10) - 1);
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    qtyInput.value = Math.min(10, parseInt(qtyInput.value, 10) + 1);
  });
  qtyInput.addEventListener("change", () => {
    let v = parseInt(qtyInput.value, 10) || 1;
    qtyInput.value = Math.min(10, Math.max(1, v));
  });

  document.getElementById("pdAddToCart").addEventListener("click", () => {
    handleAddToCart(product.id, { qty: parseInt(qtyInput.value, 10) || 1 });
  });
  document.getElementById("pdBuyNow").addEventListener("click", () => {
    handleAddToCart(product.id, { qty: parseInt(qtyInput.value, 10) || 1 });
    window.location.href = "cart.html";
  });

  const tabButtons = document.querySelectorAll("#pdTabs button");
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      document.querySelectorAll("[data-tab-panel]").forEach((panel) => {
        panel.style.display = panel.getAttribute("data-tab-panel") === btn.getAttribute("data-tab") ? "block" : "none";
      });
    });
  });

  const related = PRODUCTS.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const relatedGrid = document.getElementById("relatedGrid");
  const fallback = related.length ? related : PRODUCTS.filter((p) => p.id !== product.id).slice(0, 4);
  fallback.forEach((p) => relatedGrid.appendChild(createProductCard(p)));
  bindProductGridEvents(relatedGrid);
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productGrid")) initListingPage();
  if (document.getElementById("productDetailContent")) initProductDetailPage();
});