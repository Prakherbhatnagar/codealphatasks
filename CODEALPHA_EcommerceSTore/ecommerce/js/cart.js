/* ==========================================================================
   CART.JS — Shopping cart page logic
   Reads/writes the shared Cart engine from app.js (localStorage-backed)
   ========================================================================== */

const SHIPPING_FLAT_RATE = 6.99;
const FREE_SHIPPING_THRESHOLD = 50;
const TAX_RATE = 0.08;

const VALID_COUPONS = {
  SAVE10: { type: "percent", value: 10, label: "10% off" },
  SAVE20: { type: "percent", value: 20, label: "20% off" },
  FLAT15: { type: "flat", value: 15, label: "$15 off" },
};

let appliedCoupon = null;

function renderCartPage() {
  const items = Cart.detailedItems();
  const filledView = document.getElementById("cartFilled");
  const emptyView = document.getElementById("cartEmptyState");

  if (items.length === 0) {
    filledView.style.display = "none";
    emptyView.style.display = "block";
    return;
  }
  filledView.style.display = "block";
  emptyView.style.display = "none";

  document.getElementById("cartItemCountLabel").textContent = `${items.reduce((s, i) => s + i.qty, 0)} Item${items.length !== 1 ? "s" : ""}`;

  const list = document.getElementById("cartItemsList");
  list.innerHTML = items
    .map(
      (item) => `
    <div class="cart-item" data-cart-row="${item.id}">
      <div class="cart-item-thumb"><img src="${item.image}" alt="${item.name}"></div>
      <div class="cart-item-info">
        <h3><a href="product.html?id=${item.id}">${item.name}</a></h3>
        <div class="cat">${item.category}</div>
        <div class="unit-price">$${item.price.toFixed(2)} each</div>
        <button class="remove-item-btn" data-remove="${item.id}">🗑 Remove</button>
      </div>
      <div class="cart-item-qty">
        <div class="qty-selector">
          <button type="button" data-decrease="${item.id}" aria-label="Decrease quantity">−</button>
          <input type="number" value="${item.qty}" min="1" max="10" data-qty-input="${item.id}" aria-label="Quantity for ${item.name}">
          <button type="button" data-increase="${item.id}" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-total">$${(item.price * item.qty).toFixed(2)}</div>
    </div>`
    )
    .join("");

  renderSummary();
}

function renderSummary() {
  const subtotal = Cart.subtotal();
  let discount = 0;

  if (appliedCoupon) {
    discount = appliedCoupon.type === "percent" ? subtotal * (appliedCoupon.value / 100) : appliedCoupon.value;
    discount = Math.min(discount, subtotal);
  }

  const afterDiscount = subtotal - discount;
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const tax = afterDiscount * TAX_RATE;
  const total = afterDiscount + shipping + tax;

  document.getElementById("summarySubtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("summaryShipping").textContent = shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;
  document.getElementById("summaryTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("summaryTotal").textContent = `$${total.toFixed(2)}`;

  const discountRow = document.getElementById("summaryDiscountRow");
  if (discount > 0) {
    discountRow.style.display = "flex";
    document.getElementById("summaryDiscount").textContent = `-$${discount.toFixed(2)}`;
  } else {
    discountRow.style.display = "none";
  }

  // Persist cart totals for the checkout page to read
  writeStore("shophive_cart_summary", { subtotal, discount, shipping, tax, total, coupon: appliedCoupon });
}

function bindCartEvents() {
  const list = document.getElementById("cartItemsList");

  list.addEventListener("click", (e) => {
    const removeBtn = e.target.closest("[data-remove]");
    const decBtn = e.target.closest("[data-decrease]");
    const incBtn = e.target.closest("[data-increase]");

    if (removeBtn) {
      const id = removeBtn.getAttribute("data-remove");
      const row = list.querySelector(`[data-cart-row="${id}"]`);
      row.style.transition = "opacity 220ms ease, transform 220ms ease";
      row.style.opacity = "0";
      row.style.transform = "translateX(20px)";
      setTimeout(() => {
        Cart.remove(id);
        showToast("Item removed from cart", "info");
        renderCartPage();
      }, 200);
    }

    if (decBtn) {
      const id = decBtn.getAttribute("data-decrease");
      const current = Cart.get().find((i) => i.id === id);
      if (current) Cart.updateQty(id, current.qty - 1);
      renderCartPage();
    }
    if (incBtn) {
      const id = incBtn.getAttribute("data-increase");
      const current = Cart.get().find((i) => i.id === id);
      if (current) Cart.updateQty(id, Math.min(10, current.qty + 1));
      renderCartPage();
    }
  });

  list.addEventListener("change", (e) => {
    const input = e.target.closest("[data-qty-input]");
    if (!input) return;
    const id = input.getAttribute("data-qty-input");
    let qty = parseInt(input.value, 10) || 1;
    qty = Math.min(10, Math.max(1, qty));
    Cart.updateQty(id, qty);
    renderCartPage();
  });

  document.getElementById("clearCartBtn").addEventListener("click", () => {
    if (Cart.get().length === 0) return;
    Cart.clear();
    appliedCoupon = null;
    showToast("Cart cleared", "info");
    renderCartPage();
  });

  document.getElementById("applyCouponBtn").addEventListener("click", () => {
    const input = document.getElementById("couponInput");
    const code = input.value.trim().toUpperCase();
    const messageEl = document.getElementById("couponMessage");

    if (!code) {
      messageEl.textContent = "Enter a coupon code first.";
      messageEl.className = "coupon-message show error";
      return;
    }

    if (VALID_COUPONS[code]) {
      appliedCoupon = VALID_COUPONS[code];
      messageEl.textContent = `"${code}" applied — ${appliedCoupon.label}`;
      messageEl.className = "coupon-message show success";
      showToast(`Coupon applied: ${appliedCoupon.label}`, "success");
    } else {
      appliedCoupon = null;
      messageEl.textContent = "Invalid or expired coupon code.";
      messageEl.className = "coupon-message show error";
      showToast("Invalid coupon code", "error");
    }
    renderSummary();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("cartItemsList")) return; // not on the cart page
  bindCartEvents();
  renderCartPage();
});