/* ==========================================================================
   PROFILE.JS — User Profile & Orders Page Logic
   Syncs user profile and orders with Node.js REST API
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  loadUserProfile();
  loadUserOrders();
  initForms();
});

/* -------------------------- Tab Switching -------------------------------- */
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tabs .tab-btn[data-tab]");
  const panes = document.querySelectorAll(".profile-content .tab-pane");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");

      tabs.forEach((t) => t.classList.remove("active"));
      panes.forEach((p) => p.classList.remove("active"));

      tab.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    if (confirm("Are you sure you want to log out?")) {
      await API.logout();
      showToast("Logged out successfully", "info");
      setTimeout(() => (window.location.href = "login.html"), 600);
    }
  });
}

/* -------------------------- Load User Profile -------------------------------- */
async function loadUserProfile() {
  try {
    let user = null;

    if (API.isAuthenticated()) {
      try {
        const res = await API.getProfile();
        if (res.data && res.data.user) {
          user = res.data.user;
        }
      } catch (e) {
        console.warn("API profile fetch failed, falling back to local store.");
      }
    }

    if (!user) {
      user = readStore(STORAGE_KEYS.user, null);
    }

    if (!user) {
      showToast("Please log in to access your profile", "warning");
      setTimeout(() => (window.location.href = "login.html"), 1000);
      return;
    }

    // Populate Sidebar UI
    const name = user.name || "User Profile";
    document.getElementById("sidebarUserName").textContent = name;
    document.getElementById("sidebarUserEmail").textContent = user.email || "";
    document.getElementById("sidebarUserRole").textContent = (user.role || "Member").toUpperCase();
    document.getElementById("userAvatar").textContent = name.charAt(0).toUpperCase();

    // Populate Form Inputs
    document.getElementById("profName").value = user.name || "";
    document.getElementById("profEmail").value = user.email || "";
    document.getElementById("profPhone").value = user.phone || "";

    if (user.address) {
      document.getElementById("profStreet").value = user.address.street || "";
      document.getElementById("profCity").value = user.address.city || "";
      document.getElementById("profState").value = user.address.state || "";
      document.getElementById("profZip").value = user.address.zipCode || "";
      document.getElementById("profCountry").value = user.address.country || "";
    }
  } catch (error) {
    showToast("Error loading user profile", "error");
  }
}

/* -------------------------- Load User Orders -------------------------------- */
async function loadUserOrders() {
  const container = document.getElementById("ordersContainer");
  if (!container) return;

  try {
    let orders = [];

    if (API.isAuthenticated()) {
      try {
        const res = await API.getMyOrders();
        if (res.data && res.data.orders) {
          orders = res.data.orders;
        }
      } catch (e) {
        console.warn("API orders fetch failed, checking local store.");
      }
    }

    if (!orders || orders.length === 0) {
      orders = readStore(STORAGE_KEYS.orders, []);
    }

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet.</p>
          <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders
      .map((order) => {
        const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        const statusClass = `status-${order.orderStatus || "Pending"}`;
        const items = order.products || order.items || [];
        const total = order.totalPrice || order.total || 0;

        const itemsHTML = items
          .map(
            (item) => `
          <div class="order-item-row">
            <img src="${item.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df'}" alt="${item.title}" class="item-thumb">
            <div class="item-details">
              <h4>${item.title}</h4>
              <p>Qty: ${item.quantity} × $${Number(item.price).toFixed(2)}</p>
            </div>
          </div>
        `
          )
          .join("");

        return `
          <div class="order-card">
            <div class="order-header">
              <div>
                <span class="order-id">Order #${(order._id || order.id || "").toString().slice(-8).toUpperCase()}</span>
                <span class="order-date"> • ${dateStr}</span>
              </div>
              <span class="status-badge ${statusClass}">${order.orderStatus || "Pending"}</span>
            </div>
            <div class="order-items-list">
              ${itemsHTML}
            </div>
            <div class="order-footer">
              <span>Total Amount</span>
              <span style="color: var(--color-primary); font-size: 1.1rem;">$${Number(total).toFixed(2)}</span>
            </div>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    container.innerHTML = `<div class="empty-state"><p style="color: var(--color-danger)">Error loading order history.</p></div>`;
  }
}

/* -------------------------- Form Submit Handlers -------------------------------- */
function initForms() {
  // Update Profile Form
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("saveProfileBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Saving...";

      const profileData = {
        name: document.getElementById("profName").value.trim(),
        phone: document.getElementById("profPhone").value.trim(),
        address: {
          street: document.getElementById("profStreet").value.trim(),
          city: document.getElementById("profCity").value.trim(),
          state: document.getElementById("profState").value.trim(),
          zipCode: document.getElementById("profZip").value.trim(),
          country: document.getElementById("profCountry").value.trim(),
        },
      };

      try {
        if (API.isAuthenticated()) {
          const res = await API.updateProfile(profileData);
          if (res.data && res.data.user) {
            writeStore(STORAGE_KEYS.user, res.data.user);
          }
        } else {
          const localUser = readStore(STORAGE_KEYS.user, {}) || {};
          writeStore(STORAGE_KEYS.user, { ...localUser, ...profileData });
        }

        showToast("Profile updated successfully!", "success");
        loadUserProfile();
      } catch (error) {
        showToast(error.message || "Failed to update profile", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Changes";
      }
    });
  }

  // Update Password Form
  const passwordForm = document.getElementById("passwordForm");
  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword !== confirmPassword) {
        showToast("Passwords do not match!", "error");
        return;
      }

      const submitBtn = document.getElementById("updatePasswordBtn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Updating...";

      try {
        if (API.isAuthenticated()) {
          await API.updateProfile({ password: newPassword });
        }
        showToast("Password updated successfully!", "success");
        passwordForm.reset();
      } catch (error) {
        showToast(error.message || "Failed to update password", "error");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Password";
      }
    });
  }
}
