/* ==========================================================================
   AUTH.JS — Login & Register page logic
   Connects login & registration to Node.js REST API with local fallback
   ========================================================================== */

function saveMockUser(profile) {
  writeStore(STORAGE_KEYS.user, profile);
}
function getMockUser() {
  return readStore(STORAGE_KEYS.user, null);
}

/* -------------------------- LOGIN FORM -------------------------------- */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const emailInput = document.getElementById("loginEmail");
  const passwordInput = document.getElementById("loginPassword");

  emailInput.addEventListener("blur", () => {
    setFieldValidity(emailInput, Validators.required(emailInput.value) && Validators.email(emailInput.value));
  });
  passwordInput.addEventListener("blur", () => {
    setFieldValidity(passwordInput, Validators.minLength(passwordInput.value, 6));
  });

  const forgotLink = document.getElementById("forgotPasswordLink");
  if (forgotLink) {
    forgotLink.addEventListener("click", (e) => {
      e.preventDefault();
      showToast("Password reset link sent — check your inbox.", "info");
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailValid = Validators.required(emailInput.value) && Validators.email(emailInput.value);
    const passwordValid = Validators.minLength(passwordInput.value, 6);
    setFieldValidity(emailInput, emailValid);
    setFieldValidity(passwordInput, passwordValid);

    if (!emailValid || !passwordValid) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }

    const submitBtn = document.getElementById("loginSubmitBtn");
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    try {
      if (typeof API !== "undefined") {
        try {
          const res = await API.login({
            email: emailInput.value.trim(),
            password: passwordInput.value,
          });
          showToast(res.message || "Welcome back!", "success");
        } catch (apiErr) {
          console.warn("API login failed, checking offline mode:", apiErr.message);
          if (apiErr.message.includes("credentials") || apiErr.message.includes("Invalid")) {
            showToast(apiErr.message, "error");
            submitBtn.classList.remove("btn-loading");
            submitBtn.disabled = false;
            return;
          }
          // Fallback to local store if server unreachable
          saveMockUser({
            name: emailInput.value.split("@")[0].replace(/[._]/g, " "),
            email: emailInput.value,
            remember: document.getElementById("rememberMe") ? document.getElementById("rememberMe").checked : true,
            joined: new Date().toISOString(),
          });
        }
      }

      submitBtn.classList.remove("btn-loading");
      const banner = document.getElementById("loginSuccessBanner");
      if (banner) banner.classList.add("show");
      showToast("Welcome back!", "success");
      setTimeout(() => (window.location.href = "profile.html"), 800);
    } catch (err) {
      showToast(err.message || "Login failed", "error");
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  });
}

/* -------------------------- REGISTER FORM -------------------------------- */
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const nameInput = document.getElementById("registerName");
  const emailInput = document.getElementById("registerEmail");
  const passwordInput = document.getElementById("registerPassword");
  const confirmInput = document.getElementById("registerConfirm");
  const strengthMeter = document.getElementById("strengthMeter");
  const strengthLabel = document.getElementById("strengthLabel");

  const STRENGTH_LABELS = ["Too weak", "Weak — add numbers & symbols", "Fair — add a symbol", "Good", "Strong password"];
  const STRENGTH_CLASSES = ["", "weak", "fair", "good", "strong"];

  if (passwordInput && strengthMeter) {
    passwordInput.addEventListener("input", () => {
      const score = scorePasswordStrength(passwordInput.value);
      strengthMeter.className = "strength-meter " + STRENGTH_CLASSES[score];
      if (strengthLabel) {
        strengthLabel.textContent = passwordInput.value ? STRENGTH_LABELS[score] : "Use 8+ characters with a number and a symbol";
      }
    });
  }

  nameInput.addEventListener("blur", () => setFieldValidity(nameInput, Validators.required(nameInput.value) && Validators.minLength(nameInput.value, 2)));
  emailInput.addEventListener("blur", () => setFieldValidity(emailInput, Validators.required(emailInput.value) && Validators.email(emailInput.value)));
  passwordInput.addEventListener("blur", () => setFieldValidity(passwordInput, Validators.minLength(passwordInput.value, 6)));
  confirmInput.addEventListener("blur", () => setFieldValidity(confirmInput, Validators.matches(confirmInput.value, passwordInput.value) && confirmInput.value.length > 0));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameValid = Validators.required(nameInput.value) && Validators.minLength(nameInput.value, 2);
    const emailValid = Validators.required(emailInput.value) && Validators.email(emailInput.value);
    const passwordValid = Validators.minLength(passwordInput.value, 6);
    const confirmValid = Validators.matches(confirmInput.value, passwordInput.value) && confirmInput.value.length > 0;
    const termsCheck = document.getElementById("agreeTerms");
    const termsValid = termsCheck ? termsCheck.checked : true;

    setFieldValidity(nameInput, nameValid);
    setFieldValidity(emailInput, emailValid);
    setFieldValidity(passwordInput, passwordValid);
    setFieldValidity(confirmInput, confirmValid);

    if (!nameValid || !emailValid || !passwordValid || !confirmValid) {
      showToast("Please fix the highlighted fields", "error");
      return;
    }
    if (!termsValid) {
      showToast("Please agree to the Terms & Privacy Policy", "error");
      return;
    }

    const submitBtn = document.getElementById("registerSubmitBtn");
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    try {
      if (typeof API !== "undefined") {
        try {
          const res = await API.register({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value,
          });
          showToast(res.message || "Account created!", "success");
        } catch (apiErr) {
          console.warn("API registration failed, checking error:", apiErr.message);
          if (apiErr.message.includes("exists") || apiErr.message.includes("Validation")) {
            showToast(apiErr.message, "error");
            submitBtn.classList.remove("btn-loading");
            submitBtn.disabled = false;
            return;
          }
          saveMockUser({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            joined: new Date().toISOString(),
          });
        }
      }

      submitBtn.classList.remove("btn-loading");
      const banner = document.getElementById("registerSuccessBanner");
      if (banner) banner.classList.add("show");
      showToast("Account created — welcome to ShopHive!", "success");
      setTimeout(() => (window.location.href = "profile.html"), 800);
    } catch (err) {
      showToast(err.message || "Registration failed", "error");
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  });
}

function checkExistingSession() {
  const user = readStore(STORAGE_KEYS.user, null);
  const token = localStorage.getItem("shophive_jwt_token");
  if (user || token) {
    const banner = document.createElement("div");
    banner.className = "existing-session-banner";
    banner.style.cssText = "background:var(--color-bg-alt,#F1F5F9);border:1px solid var(--color-primary);border-radius:12px;padding:16px;margin-bottom:24px;text-align:center;";
    banner.innerHTML = `
      <p style="margin:0 0 10px 0;font-weight:600;color:var(--color-text);">You are currently logged in as <strong style="color:var(--color-primary);">${user ? user.name || user.email : "User"}</strong></p>
      <div style="display:flex;gap:10px;justify-content:center;">
        <a href="profile.html" class="btn btn-primary" style="padding:6px 16px;font-size:0.88rem;">Go to Profile & Orders</a>
        <button id="alreadyLoggedOutBtn" class="btn btn-secondary" style="padding:6px 16px;font-size:0.88rem;" type="button">Logout</button>
      </div>
    `;
    const card = document.querySelector(".auth-card, .auth-wrapper, #loginForm");
    if (card && card.parentNode) {
      card.parentNode.insertBefore(banner, card);
    }
    const logoutBtn = document.getElementById("alreadyLoggedOutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        if (typeof API !== "undefined") {
          try { await API.logout(); } catch (e) {}
        }
        localStorage.removeItem("shophive_jwt_token");
        removeStore(STORAGE_KEYS.user);
        showToast("Logged out successfully", "info");
        setTimeout(() => window.location.reload(), 500);
      });
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkExistingSession();
  initLoginForm();
  initRegisterForm();
});