/* ==========================================================================
   CHECKOUT.JS — Checkout page & order processing
   Syncs order placement with Node.js REST API
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  renderCheckoutSummary();
  initCheckoutForm();
});

function getCartItems() {
  return Cart.detailedItems();
}

function renderCheckoutSummary() {
  const container = document.getElementById("checkoutItemsList");
  if (!container) return;

  const cart = getCartItems();
  if (cart.length === 0) {
    container.innerHTML = `<p style="color: var(--color-text-muted);">Your cart is empty.</p>`;
    document.getElementById("placeOrderBtn").disabled = true;
    return;
  }

  const subtotal = Cart.subtotal();
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  container.innerHTML = cart
    .map(
      (item) => `
      <div class="summary-item" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:0.75rem;">
        <div style="display:flex; align-items:center; gap:0.75rem;">
          <img src="${item.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df'}" alt="${item.name}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;">
          <div>
            <div style="font-weight:600; font-size:0.9rem;">${item.name}</div>
            <div style="font-size:0.8rem; color:var(--color-text-muted);">Qty: ${item.qty || item.quantity}</div>
          </div>
        </div>
        <div style="font-weight:600;">$${(item.price * (item.qty || item.quantity)).toFixed(2)}</div>
      </div>
    `
    )
    .join("");

  document.getElementById("coSubtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("coShipping").textContent = shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`;
  document.getElementById("coTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("coTotal").textContent = `$${total.toFixed(2)}`;
}

function initCheckoutForm() {
  const form = document.getElementById("checkoutForm");
  if (!form) return;

  // Pre-fill profile info if logged in
  const currentUser = readStore(STORAGE_KEYS.user, null);
  if (currentUser) {
    if (currentUser.email && document.getElementById("coEmail")) document.getElementById("coEmail").value = currentUser.email;
    if (currentUser.name && document.getElementById("coFirstName")) {
      const parts = currentUser.name.split(" ");
      document.getElementById("coFirstName").value = parts[0] || "";
      if (document.getElementById("coLastName")) document.getElementById("coLastName").value = parts.slice(1).join(" ") || "";
    }
    if (currentUser.phone && document.getElementById("coPhone")) document.getElementById("coPhone").value = currentUser.phone;
    if (currentUser.address) {
      if (currentUser.address.street && document.getElementById("coStreet")) document.getElementById("coStreet").value = currentUser.address.street;
      if (currentUser.address.city && document.getElementById("coCity")) document.getElementById("coCity").value = currentUser.address.city;
      if (currentUser.address.state && document.getElementById("coState")) document.getElementById("coState").value = currentUser.address.state;
      if (currentUser.address.zipCode && document.getElementById("coZip")) document.getElementById("coZip").value = currentUser.address.zipCode;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const cart = getCartItems();
    if (cart.length === 0) {
      showToast("Your cart is empty!", "error");
      return;
    }

    const placeBtn = document.getElementById("placeOrderBtn");
    placeBtn.disabled = true;
    placeBtn.textContent = "Processing Order...";

    const shippingAddress = {
      street: document.getElementById("coStreet") ? document.getElementById("coStreet").value.trim() : "123 Main St",
      city: document.getElementById("coCity") ? document.getElementById("coCity").value.trim() : "City",
      state: document.getElementById("coState") ? document.getElementById("coState").value.trim() : "State",
      zipCode: document.getElementById("coZip") ? document.getElementById("coZip").value.trim() : "10001",
      country: document.getElementById("coCountry") ? document.getElementById("coCountry").value.trim() : "USA",
    };

    const paymentMethodEl = document.querySelector('input[name="paymentMethod"]:checked');
    const paymentMethod = paymentMethodEl ? paymentMethodEl.value : "Cash on Delivery";

    const orderPayload = {
      products: cart.map((i) => ({
        productId: i.id && i.id.length === 24 ? i.id : "65b000000000000000000001", // Default fallback objectId if dummy product
        title: i.name || i.title,
        price: i.price,
        quantity: i.qty || i.quantity || 1,
        image: i.image,
      })),
      shippingAddress,
      paymentMethod,
    };

    try {
      let createdOrder = null;

      if (typeof API !== "undefined" && API.isAuthenticated()) {
        try {
          const res = await API.createOrder(orderPayload);
          if (res.data && res.data.order) {
            createdOrder = res.data.order;
          }
        } catch (apiErr) {
          console.warn("API Order Creation failed, falling back to local history:", apiErr.message);
        }
      }

      if (!createdOrder) {
        createdOrder = {
          id: "ORD-" + Math.floor(100000 + Math.random() * 900000),
          createdAt: new Date().toISOString(),
          orderStatus: "Pending",
          products: orderPayload.products,
          totalPrice: Cart.subtotal() * 1.08,
          shippingAddress,
        };

        const existingOrders = readStore(STORAGE_KEYS.orders, []);
        existingOrders.unshift(createdOrder);
        writeStore(STORAGE_KEYS.orders, existingOrders);
      }

      // Clear local cart
      Cart.clear();

      showToast("Order placed successfully! Thank you.", "success");
      setTimeout(() => (window.location.href = "profile.html"), 1000);
    } catch (error) {
      showToast(error.message || "Failed to place order", "error");
      placeBtn.disabled = false;
      placeBtn.textContent = "Place Order";
    }
  });
}
