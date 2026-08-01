/* ==========================================================================
   VALIDATION.JS — Reusable client-side form validation helpers
   Used by: auth.js (login/register) and checkout.js (shipping/billing/payment)
   ========================================================================== */

const Validators = {
  required(value) {
    return value.trim().length > 0;
  },
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  },
  minLength(value, len) {
    return value.trim().length >= len;
  },
  matches(value, other) {
    return value === other;
  },
  digitsOnly(value) {
    return /^\d+$/.test(value.trim());
  },
  cardNumber(value) {
    const cleaned = value.replace(/\s+/g, "");
    return /^\d{13,19}$/.test(cleaned);
  },
  cardExpiry(value) {
    // MM/YY format, and not already expired
    const match = value.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
    if (!match) return false;
    const month = parseInt(match[1], 10);
    const year = parseInt(match[2], 10) + 2000;
    const now = new Date();
    const expiry = new Date(year, month); // first day of month AFTER expiry
    return expiry > now;
  },
  cvv(value) {
    return /^\d{3,4}$/.test(value.trim());
  },
  zip(value) {
    return /^\d{4,10}$/.test(value.trim());
  },
  phone(value) {
    return /^[\d+()\-\s]{7,16}$/.test(value.trim());
  },
};

/**
 * Marks a form-group as valid/invalid and shows/hides its field-error span.
 * Expects the input's closest .form-group wrapper to contain a .field-error element.
 */
function setFieldValidity(inputEl, isValid, customMessage) {
  const group = inputEl.closest(".form-group");
  if (!group) return;
  group.classList.toggle("has-error", !isValid);
  inputEl.classList.toggle("is-invalid", !isValid);
  inputEl.classList.toggle("is-valid", isValid && inputEl.value.trim().length > 0);
  if (customMessage) {
    const errorEl = group.querySelector(".field-error");
    if (errorEl) errorEl.textContent = customMessage;
  }
}

/** Simple password strength scorer used on the register page. 0-4 scale. */
function scorePasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

/** Generic password visibility toggle wiring, used across login/register/checkout */
function initPasswordToggles(scope = document) {
  scope.querySelectorAll("[data-toggle-password]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.getAttribute("data-toggle-password"));
      if (!target) return;
      const isPassword = target.type === "password";
      target.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "Hide" : "Show";
    });
  });
}

document.addEventListener("DOMContentLoaded", () => initPasswordToggles());