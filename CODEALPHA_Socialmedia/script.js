/* =====================================================================
   SOCIALCONNECT — APP LOGIC  (No Dummy Data — Real API Only)
===================================================================== */

/* ─── API CONFIG ─────────────────────────────────────────────────── */
const API_BASE_URL        = 'http://localhost:5000/api';
const BACKEND_STATIC_URL  = 'http://localhost:5000';   // for /uploads images

async function apiFetch(endpoint, options = {}) {
  const token   = localStorage.getItem('sc-token');
  const isForm  = options.body instanceof FormData;
  const headers = {
    // Do NOT set Content-Type for FormData — browser sets it with correct boundary
    ...(isForm ? {} : { 'Content-Type': 'application/json' }),
    ...(token  ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };
  try {
    const res  = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('[API unavailable]', err.message);
    return null;
  }
}

/* Resolve image src — /uploads/... paths must point to backend port 5000 */
function resolveImage(src, fallback = 'https://i.pravatar.cc/80') {
  if (!src) return fallback;
  if (src.startsWith('http')) return src;          // already absolute
  if (src.startsWith('/uploads')) return BACKEND_STATIC_URL + src; // backend file
  return src;
}

/* ─── CURRENT USER (loaded after login) ─────────────────────────── */
let currentUser = null;

function saveUser(user) {
  currentUser = user;
  localStorage.setItem('sc-user', JSON.stringify(user));
}
function loadUser() {
  const raw = localStorage.getItem('sc-user');
  if (raw) currentUser = JSON.parse(raw);
  return currentUser;
}

/* ─── STATE ──────────────────────────────────────────────────────── */
const state = {
  currentView:         'home',
  activeConversation:  null,
  feedPage:            1,
  feedLoading:         false,
};

/* ─── HELPERS ────────────────────────────────────────────────────── */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function escapeHtml(str = '') {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function emptyState(icon, title, subtitle = '') {
  return `
    <div class="empty-state">
      <i class="fa-solid ${icon}"></i>
      <h3>${title}</h3>
      ${subtitle ? `<p>${subtitle}</p>` : ''}
    </div>`;
}

/* ─── TOASTS ─────────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const container = $('#toastContainer');
  if (!container) return;
  const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 280);
  }, 3400);
}

/* ─── OFFLINE BANNER ─────────────────────────────────────────────── */
function initOfflineBanner() {
  const banner = $('#offlineBanner');
  if (!banner) return;
  const show = () => { banner.hidden = false; };
  const hide = () => { banner.hidden = true;  };
  window.addEventListener('online',  hide);
  window.addEventListener('offline', show);
  navigator.onLine ? hide() : show();
}

/* ─── AUTH ───────────────────────────────────────────────────────── */
function initAuth() {
  /* Switch screens */
  $$('[data-switch]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      $('#loginScreen').hidden    = el.dataset.switch !== 'login';
      $('#registerScreen').hidden = el.dataset.switch !== 'register';
    });
  });

  /* Password visibility toggle */
  $$('.pw-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.querySelector('i').className =
        input.type === 'password' ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
    });
  });

  /* Avatar preview */
  $('#regAvatarInput')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const prev = $('#regAvatarPreview');
      if (prev) prev.innerHTML = `<img src="${ev.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  });

  /* LOGIN */
  $('#loginForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn      = e.target.querySelector('[type="submit"]');
    const email    = e.target.querySelector('input[type="email"]')?.value.trim();
    const password = e.target.querySelector('input[type="password"]')?.value.trim();

    if (!email || !password) { showToast('Please enter email and password.', 'error'); return; }

    btn.disabled = true; btn.textContent = 'Logging in…';
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    btn.disabled = false; btn.textContent = 'Log in';

    if (res && res.success) {
      localStorage.setItem('sc-token', res.data.token);
      saveUser(res.data.user);
      showToast(`Welcome back, ${res.data.user.name}!`, 'success');
      enterApp();
    } else {
      showToast(res?.message || 'Login failed. Check your credentials.', 'error');
    }
  });

  /* REGISTER */
  $('#registerForm')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn      = e.target.querySelector('[type="submit"]');
    const inputs   = e.target.querySelectorAll('input');
    // inputs[0] = file, [1] = name, [2] = username, [3] = email, [4] = phone, [5] = password, [6] = confirm
    const name     = inputs[1]?.value.trim();
    const username = inputs[2]?.value.trim().replace('@','');
    const email    = inputs[3]?.value.trim();
    const password = inputs[5]?.value.trim();
    const confirm  = inputs[6]?.value.trim();

    if (!name || !username || !email || !password) {
      showToast('Please fill in all required fields.', 'error'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error'); return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error'); return;
    }

    btn.disabled = true; btn.textContent = 'Creating account…';
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, username, email, password })
    });
    btn.disabled = false; btn.textContent = 'Create account';

    if (res && res.success) {
      localStorage.setItem('sc-token', res.data.token);
      saveUser(res.data.user);
      showToast('Account created successfully! Welcome 🎉', 'success');
      enterApp();
    } else {
      showToast(res?.message || 'Registration failed. Try again.', 'error');
    }
  });
}

function enterApp() {
  localStorage.setItem('sc-logged-in', 'true');
  loadUser();

  /* Update UI with real user info */
  const user = currentUser;
  if (user) {
    const avatar  = user.profileImage || `https://i.pravatar.cc/80`;
    const name    = user.name    || 'User';
    const uname   = '@' + (user.username || '');

    $$('.topbar-right .avatar-btn img').forEach(img => { img.src = avatar; img.alt = name; });
    $$('.user-card img').forEach(img => { img.src = avatar; img.alt = name; });
    $$('.user-card strong').forEach(el => { el.textContent = name; });
    $$('.user-card span').forEach(el => { el.textContent = uname; });
    $$('.dropdown-header strong').forEach(el => { el.textContent = name; });
    $$('.dropdown-header span').forEach(el => { el.textContent = uname; });
    $$('.composer-user strong').forEach(el => { el.textContent = name; });
    $$('.create-post-top img').forEach(img => { img.src = avatar; img.alt = name; });
    $$('.composer-user img').forEach(img => { img.src = avatar; img.alt = name; });
    $$('.comment-input-row img').forEach(img => { img.src = avatar; img.alt = name; });
  }

  $('#authWrap').hidden = true;
  $('#app').hidden      = false;
  navigateTo('home');
}

/* ─── THEME ──────────────────────────────────────────────────────── */
function initTheme() {
  applyTheme(localStorage.getItem('sc-theme') || 'light');
  $('#darkModeToggle')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
  $$('[data-theme-choice]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(btn.dataset.themeChoice);
      $$('[data-theme-choice]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sc-theme', theme);
  const icon = $('#darkModeToggle i');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* ─── NAVIGATION ─────────────────────────────────────────────────── */
const VALID_VIEWS = ['home','explore','profile','messages','notifications','settings','bookmarks'];

function initNavigation() {
  document.addEventListener('click', e => {
    const navEl = e.target.closest('[data-nav]');
    if (navEl && !$('#app').hidden) {
      e.preventDefault();
      navigateTo(navEl.dataset.nav);
      $('#profileDropdownMenu').hidden = true;
      closeMobileSidebar();
    }
  });
}

function navigateTo(view) {
  if (!VALID_VIEWS.includes(view)) return;
  $$('.view').forEach(v => { v.hidden = v.dataset.view !== view; });
  state.currentView = view;
  $$('[data-nav]').forEach(el => el.classList.toggle('active', el.dataset.nav === view));

  if (view === 'home')          loadFeed();
  if (view === 'explore')       loadExplore();
  if (view === 'notifications') loadNotifications();
  if (view === 'messages')      loadConversations();
  if (view === 'profile')       loadProfile();
  if (view === 'bookmarks')     loadBookmarks();
}

/* ─── MOBILE SIDEBAR ─────────────────────────────────────────────── */
function initMobileSidebar() {
  $('#sidebarToggle')?.addEventListener('click', () => {
    $('#sidebarLeft')?.classList.toggle('open');
    $('#sidebarScrim')?.classList.toggle('open');
  });
  $('#sidebarScrim')?.addEventListener('click', closeMobileSidebar);
}
function closeMobileSidebar() {
  $('#sidebarLeft')?.classList.remove('open');
  $('#sidebarScrim')?.classList.remove('open');
}

/* ─── PROFILE DROPDOWN ───────────────────────────────────────────── */
function initProfileDropdown() {
  const btn  = $('#profileDropdownBtn');
  const menu = $('#profileDropdownMenu');
  if (!btn || !menu) return;
  btn.addEventListener('click', e => {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    btn.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', () => { if (menu) menu.hidden = true; });
}

/* ─── FEED ───────────────────────────────────────────────────────── */
async function loadFeed() {
  const feed      = $('#feed');
  const skeletons = $('#feedSkeletons');
  const endMsg    = $('#feedEnd');
  if (!feed) return;

  feed.innerHTML = '';
  if (skeletons) skeletons.hidden = false;

  const res = await apiFetch(`/posts?page=1&limit=10`);

  if (skeletons) skeletons.hidden = true;

  if (!res || !res.success || !res.data?.length) {
    feed.innerHTML = emptyState('fa-newspaper', 'No posts yet', 'Be the first to share something!');
    return;
  }

  feed.innerHTML = res.data.map(post => postTemplate(post)).join('');
  if (endMsg) endMsg.hidden = res.data.length < 10;
}

function postTemplate(post) {
  const author   = post.author || {};
  const avatar   = resolveImage(author.profileImage);
  const name     = escapeHtml(author.name     || 'Unknown');
  const username = escapeHtml(author.username || 'user');
  const caption  = escapeHtml(post.caption   || '');
  const tags     = (post.hashtags || []).map(t => `<span class="hashtag">#${t}</span>`).join(' ');
  const likeCount = (post.likes || []).length;
  const commentCount = (post.comments || []).length;
  const liked    = (post.likes || []).includes(currentUser?.id);
  const time     = timeAgo(post.createdAt);

  return `
  <article class="card post" data-post-id="${post._id}">
    <div class="post-header">
      <img src="${avatar}" alt="${name}">
      <div class="post-header-info">
        <div class="name-row">
          ${name}
          ${author.isVerified ? '<i class="fa-solid fa-circle-check verified"></i>' : ''}
        </div>
        <div class="meta"><span>@${username}</span> &middot; <span>${time}</span></div>
      </div>
    </div>
    <p class="post-caption">${caption} ${tags}</p>
    ${post.image ? `<div class="post-media"><img src="${resolveImage(post.image)}" alt="Post image" loading="lazy"></div>` : ''}
    <div class="post-stats">
      <span><span class="like-count">${likeCount}</span> likes</span>
      <span><span class="comment-count">${commentCount}</span> comments</span>
    </div>
    <div class="post-actions">
      <button class="post-action-btn ${liked ? 'liked' : ''}" data-action="like">
        <i class="fa-${liked ? 'solid' : 'regular'} fa-heart"></i> Like
      </button>
      <button class="post-action-btn" data-action="comment">
        <i class="fa-regular fa-comment"></i> Comment
      </button>
      <button class="post-action-btn" data-action="share">
        <i class="fa-regular fa-share-from-square"></i> Share
      </button>
      <button class="post-action-btn" data-action="save" style="flex:0;padding:9px 12px">
        <i class="fa-regular fa-bookmark"></i>
      </button>
    </div>
  </article>`;
}

/* ─── POST INTERACTIONS ──────────────────────────────────────────── */
function initPostInteractions() {
  document.addEventListener('click', e => {
    const actionBtn = e.target.closest('[data-action]');
    if (!actionBtn) return;
    const postEl = actionBtn.closest('.post');
    if (!postEl) return;
    const postId = postEl.dataset.postId;
    handlePostAction(postEl, postId, actionBtn.dataset.action);
  });
}

async function handlePostAction(postEl, postId, action) {
  if (action === 'like') {
    const btn       = postEl.querySelector('[data-action="like"]');
    const countEl   = postEl.querySelector('.like-count');
    const liked     = btn.classList.contains('liked');
    const current   = parseInt(countEl.textContent) || 0;

    // Optimistic
    btn.classList.toggle('liked', !liked);
    btn.querySelector('i').className = `fa-${!liked ? 'solid' : 'regular'} fa-heart`;
    countEl.textContent = liked ? current - 1 : current + 1;

    const res = await apiFetch(`/posts/${postId}/like`, { method: 'POST' });
    if (!res || !res.success) {
      // Revert on failure
      btn.classList.toggle('liked', liked);
      btn.querySelector('i').className = `fa-${liked ? 'solid' : 'regular'} fa-heart`;
      countEl.textContent = current;
    }
  }

  if (action === 'comment') toggleCommentBox(postEl, postId);

  if (action === 'share') {
    if (navigator.share) {
      navigator.share({ title: 'SocialConnect', url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Link copied to clipboard!', 'success');
    }
  }

  if (action === 'save') {
    const btn = postEl.querySelector('[data-action="save"]');
    const saved = btn.querySelector('i').classList.contains('fa-solid');
    btn.querySelector('i').className = saved ? 'fa-regular fa-bookmark' : 'fa-solid fa-bookmark';
    await apiFetch(`/posts/${postId}/save`, { method: saved ? 'DELETE' : 'POST' });
    showToast(saved ? 'Removed from bookmarks.' : 'Saved to bookmarks!', saved ? 'info' : 'success');
  }
}

/* ─── COMMENT BOX ────────────────────────────────────────────────── */
async function toggleCommentBox(postEl, postId) {
  $$('.comment-section').forEach(el => { if (!postEl.contains(el)) el.remove(); });
  const existing = postEl.querySelector('.comment-section');
  if (existing) { existing.remove(); return; }

  const section = document.createElement('div');
  section.className = 'comment-section';

  const user   = currentUser;
  const avatar = user?.profileImage || 'https://i.pravatar.cc/80';

  section.innerHTML = `
    <div class="comment-list" id="commentList-${postId}">
      <div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading comments…</div>
    </div>
    <div class="comment-input-row">
      <img src="${avatar}" alt="You">
      <input type="text" class="comment-input" placeholder="Write a comment…" maxlength="300">
      <button class="btn btn-primary btn-sm comment-submit-btn" disabled>Post</button>
    </div>`;

  postEl.appendChild(section);

  const input     = section.querySelector('.comment-input');
  const submitBtn = section.querySelector('.comment-submit-btn');
  const listEl    = section.querySelector(`#commentList-${postId}`);

  input.focus();
  input.addEventListener('input', () => { submitBtn.disabled = !input.value.trim(); });

  // Load real comments from backend
  const res = await apiFetch(`/comments/${postId}`);
  if (!res || !res.success || !res.data?.length) {
    listEl.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
  } else {
    listEl.innerHTML = res.data.map(c => commentTemplate(c)).join('');
  }

  // Submit new comment
  submitBtn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;

    submitBtn.disabled = true;
    const postRes = await apiFetch('/comments', {
      method: 'POST',
      body: JSON.stringify({ postId, text })
    });

    if (postRes && postRes.success) {
      const noComment = listEl.querySelector('.no-comments');
      if (noComment) noComment.remove();
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.innerHTML = commentTemplate(postRes.data);
      listEl.appendChild(div);

      // Update comment count
      const countEl = postEl.querySelector('.comment-count');
      if (countEl) countEl.textContent = parseInt(countEl.textContent || 0) + 1;

      input.value = '';
    } else {
      showToast('Could not post comment. Is the backend running?', 'error');
    }
    submitBtn.disabled = false;
  });
}

function commentTemplate(c) {
  const user   = c.user || {};
  const avatar = user.profileImage || 'https://i.pravatar.cc/40';
  return `
    <div class="comment-item">
      <img src="${avatar}" alt="${escapeHtml(user.name || 'User')}">
      <div class="comment-bubble">
        <strong>${escapeHtml(user.name || 'User')}</strong>
        <span>${escapeHtml(c.text)}</span>
        <small>${timeAgo(c.createdAt)}</small>
      </div>
    </div>`;
}

/* ─── COMPOSER ───────────────────────────────────────────────────── */
function initComposer() {
  const textarea  = $('#postTextarea');
  const submitBtn = $('#submitPostBtn');
  const charCount = $('#charCount');
  if (!textarea || !submitBtn) return;

  textarea.addEventListener('input', () => {
    if (charCount) charCount.textContent = textarea.value.length;
    submitBtn.disabled = !textarea.value.trim();
  });

  /* Store selected image file for upload */
  let selectedImageFile = null;

  $('#addImageBtn')?.addEventListener('click', () => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = e => {
      const file = e.target.files[0]; if (!file) return;
      selectedImageFile = file;          // keep reference for FormData
      const reader = new FileReader();
      reader.onload = ev => {
        const strip = $('#imagePreviewStrip');
        if (strip) { strip.hidden = false; strip.querySelector('img').src = ev.target.result; }
        submitBtn.disabled = false;
      };
      reader.readAsDataURL(file);
    };
    inp.click();
  });

  $('#removeImageBtn')?.addEventListener('click', () => {
    const strip = $('#imagePreviewStrip');
    if (strip) { strip.hidden = true; strip.querySelector('img').src = ''; }
    selectedImageFile = null;            // clear stored file
    if (!textarea.value.trim()) submitBtn.disabled = true;
  });

  const emojiPicker = $('#emojiPicker');
  $('#addEmojiBtn')?.addEventListener('click', () => {
    if (!emojiPicker) return;
    if (emojiPicker.hidden) {
      const EMOJIS = ['😀','😍','🔥','💡','✨','🌍','🎉','🙌','❤️','😂','🤔','💪','🚀','🌿','☕','🏔️'];
      emojiPicker.innerHTML = EMOJIS.map(em => `<span>${em}</span>`).join('');
      emojiPicker.hidden = false;
    } else { emojiPicker.hidden = true; }
  });
  emojiPicker?.addEventListener('click', e => {
    if (e.target.tagName === 'SPAN') {
      textarea.value += e.target.textContent;
      textarea.dispatchEvent(new Event('input'));
      emojiPicker.hidden = true;
    }
  });

  $('#addLocationBtn')?.addEventListener('click', () => { $('#locationTag').hidden = false; });
  $('#removeLocationBtn')?.addEventListener('click', () => { $('#locationTag').hidden = true; });

  submitBtn.addEventListener('click', async () => {
    const caption = textarea.value.trim();
    if (!caption) return;

    submitBtn.disabled = true; submitBtn.textContent = 'Posting…';

    /* Use FormData so the image file is sent as multipart/form-data */
    const form = new FormData();
    form.append('caption',    caption);
    form.append('visibility', 'public');
    if (selectedImageFile) form.append('image', selectedImageFile);

    const res = await apiFetch('/posts', { method: 'POST', body: form });

    submitBtn.disabled = false; submitBtn.textContent = 'Post';

    if (res && res.success) {
      showToast('Post published successfully! 🎉', 'success');
      textarea.value = '';
      if (charCount) charCount.textContent = '0';
      $('#imagePreviewStrip').hidden = true;
      $('#locationTag').hidden       = true;
      if (emojiPicker) emojiPicker.hidden = true;
      closeModal('createPostModal');
      loadFeed(); // Reload feed with real data
    } else {
      showToast(res?.message || 'Could not publish post. Is backend running?', 'error');
    }
  });
}

/* ─── MODALS ─────────────────────────────────────────────────────── */
function initModals() {
  document.addEventListener('click', e => {
    const opener = e.target.closest('[data-open-modal]');
    if (opener) openModal(opener.dataset.openModal);

    if (e.target.closest('[data-close-modal]')) {
      const overlay = e.target.closest('.modal-overlay');
      if (overlay) closeModal(overlay.id);
    }
    if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') $$('.modal-overlay:not([hidden])').forEach(m => closeModal(m.id));
  });

  $('#confirmLogoutBtn')?.addEventListener('click', () => {
    closeModal('logoutModal');
    localStorage.removeItem('sc-logged-in');
    localStorage.removeItem('sc-token');
    localStorage.removeItem('sc-user');
    currentUser = null;
    $('#app').hidden      = true;
    $('#authWrap').hidden = false;
    $('#loginScreen').hidden    = false;
    $('#registerScreen').hidden = true;
    showToast('Logged out successfully.', 'info');
  });

  $('#saveProfileBtn')?.addEventListener('click', async () => {
    const modal  = $('#editProfileModal');
    const name   = modal.querySelector('input:nth-of-type(1)')?.value.trim();
    const bio    = modal.querySelector('textarea')?.value.trim();
    const location = modal.querySelector('input:nth-of-type(3)')?.value.trim();

    const res = await apiFetch('/users/profile', {
      method: 'PUT',
      body: JSON.stringify({ name, bio, location })
    });
    if (res && res.success) {
      showToast('Profile updated!', 'success');
      if (name && currentUser) { currentUser.name = name; saveUser(currentUser); }
    } else {
      showToast('Profile update failed.', 'error');
    }
    closeModal('editProfileModal');
  });
}

function openModal(id)  { const el = document.getElementById(id); if (el) el.hidden = false; }
function closeModal(id) { const el = document.getElementById(id); if (el) el.hidden = true;  }

/* ─── EXPLORE ────────────────────────────────────────────────────── */
async function loadExplore() {
  const creatorRow = $('#creatorRow');
  const masonry    = $('#masonryGrid');

  if (creatorRow) {
    creatorRow.innerHTML = '<div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';
    const res = await apiFetch('/users?limit=8');
    if (res && res.success && res.data?.length) {
      creatorRow.innerHTML = res.data.map(u => `
        <div class="creator-card">
          <img src="${u.profileImage || 'https://i.pravatar.cc/80'}" alt="${escapeHtml(u.name)}">
          <strong>${escapeHtml(u.name)}</strong>
          <span>@${escapeHtml(u.username)}</span>
          <button class="btn btn-outline btn-sm" style="margin-top:10px;width:100%"
            onclick="handleFollowBtn(this,'${u._id}')">Follow</button>
        </div>`).join('');
    } else {
      creatorRow.innerHTML = emptyState('fa-users', 'No creators yet', 'Be the first to join!');
    }
  }

  if (masonry) {
    masonry.innerHTML = '<div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';
    const res = await apiFetch('/posts/trending?limit=8');
    if (res && res.success && res.data?.length) {
      masonry.innerHTML = res.data.map(p => `
        <div class="masonry-item">
          ${p.image ? `<img src="${p.image}" alt="">` : `<div style="padding:20px;font-size:14px;color:var(--text-muted)">${escapeHtml(p.caption)}</div>`}
        </div>`).join('');
    } else {
      masonry.innerHTML = emptyState('fa-images', 'No trending posts yet');
    }
  }

  $$('.chip[data-cat]').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('.chip[data-cat]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });
}

/* ─── PROFILE ────────────────────────────────────────────────────── */
async function loadProfile() {
  const user = currentUser;
  if (!user) return;

  const res = await apiFetch(`/users/${user.id || user._id}`);
  const u   = (res && res.success) ? res.data : user;

  // Update profile page fields
  const avatar = u.profileImage || 'https://i.pravatar.cc/200';
  $('#view-profile .profile-avatar').src = avatar;
  const nameEl = $('#view-profile .profile-name-row h1');
  if (nameEl) nameEl.childNodes[0].textContent = u.name || '';
  const usernameEl = $('#view-profile .username');
  if (usernameEl) usernameEl.textContent = '@' + (u.username || '');
  const bioEl = $('#view-profile .bio');
  if (bioEl) bioEl.textContent = u.bio || 'No bio yet.';

  const stats = $('#view-profile .profile-stats');
  if (stats) {
    const divs = stats.querySelectorAll('div');
    if (divs[0]) divs[0].innerHTML = `<strong>${u.postsCount || 0}</strong> Posts`;
    if (divs[1]) divs[1].innerHTML = `<strong>${(u.followers || []).length}</strong> Followers`;
    if (divs[2]) divs[2].innerHTML = `<strong>${(u.following || []).length}</strong> Following`;
  }

  // Load user's posts
  const grid = $('#profileGrid');
  if (grid) {
    grid.innerHTML = '<div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';
    const postsRes = await apiFetch(`/posts?author=${u._id || u.id}&limit=12`);
    if (postsRes && postsRes.success && postsRes.data?.length) {
      grid.innerHTML = postsRes.data.map(p => `
        <div class="profile-grid-item">
          ${p.image
            ? `<img src="${p.image}" alt="">`
            : `<div style="padding:14px;font-size:13px;background:var(--bg-muted);min-height:100px">${escapeHtml(p.caption)}</div>`}
        </div>`).join('');
    } else {
      grid.innerHTML = emptyState('fa-camera', 'No posts yet', 'Share your first post!');
    }
  }

  // Tab switching
  $$('.tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab[data-tab]').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active'); tab.setAttribute('aria-selected','true');
      $('#profileGrid').hidden    = tab.dataset.tab !== 'grid';
      $('#profileTimeline').hidden = tab.dataset.tab !== 'timeline';
    });
  });
}

/* ─── FOLLOW BUTTON ──────────────────────────────────────────────── */
async function handleFollowBtn(btn, userId) {
  const following = btn.textContent.trim() === 'Following';
  const method    = following ? 'DELETE' : 'POST';
  btn.disabled    = true;
  const res = await apiFetch(`/follow/${userId}`, { method });
  btn.disabled = false;
  if (res && res.success) {
    btn.textContent = following ? 'Follow' : 'Following';
    btn.classList.toggle('btn-primary', !following);
    btn.classList.toggle('btn-outline', following);
    showToast(following ? 'Unfollowed.' : 'Now following!', following ? 'info' : 'success');
  } else {
    showToast('Action failed. Check backend.', 'error');
  }
}

/* ─── MESSAGES ───────────────────────────────────────────────────── */
async function loadConversations() {
  const container = $('#conversationItems');
  if (!container) return;
  container.innerHTML = '<div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';

  const res = await apiFetch('/messages/conversations');
  if (!res || !res.success || !res.data?.length) {
    container.innerHTML = emptyState('fa-paper-plane', 'No messages yet', 'Start a conversation!');
    return;
  }

  container.innerHTML = res.data.map(c => {
    const other = c.participants?.find(p => p._id !== (currentUser?.id || currentUser?._id)) || {};
    return `
      <div class="convo-item" data-conv-id="${c._id}">
        <div class="avatar-wrap">
          <img src="${other.profileImage || 'https://i.pravatar.cc/80'}" alt="${escapeHtml(other.name || '')}">
        </div>
        <div class="convo-info">
          <div class="name-time">
            <strong>${escapeHtml(other.name || 'User')}</strong>
            <span class="time">${c.updatedAt ? timeAgo(c.updatedAt) : ''}</span>
          </div>
          <div class="last-msg">Click to open chat</div>
        </div>
      </div>`;
  }).join('');

  $$('.convo-item').forEach(item => {
    item.addEventListener('click', () => {
      state.activeConversation = item.dataset.convId;
      $$('.convo-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      loadMessages(state.activeConversation);
    });
  });
}

async function loadMessages(convId) {
  const messagesEl = $('#chatMessages');
  if (!messagesEl) return;
  messagesEl.innerHTML = '<div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';

  const res = await apiFetch(`/messages/${convId}`);
  if (!res || !res.success || !res.data?.length) {
    messagesEl.innerHTML = emptyState('fa-comments', 'No messages yet', 'Say hello!');
    return;
  }

  const myId = currentUser?.id || currentUser?._id;
  messagesEl.innerHTML = res.data.map(m => {
    const isMe = m.sender?._id === myId || m.sender === myId;
    return `
      <div class="msg ${isMe ? 'me' : ''}">
        ${!isMe ? `<img src="${m.sender?.profileImage || 'https://i.pravatar.cc/40'}" alt="">` : ''}
        <div>
          <div class="msg-bubble">${escapeHtml(m.message)}</div>
          <span class="msg-time">${timeAgo(m.createdAt)}</span>
        </div>
      </div>`;
  }).join('');
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function initChat() {
  const form  = $('#chatForm');
  const input = $('#chatInput');
  if (!form || !input) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text || !state.activeConversation) {
      if (!state.activeConversation) showToast('Select a conversation first.', 'info');
      return;
    }
    input.value = '';
    const res = await apiFetch('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId: state.activeConversation, message: text })
    });
    if (res && res.success) loadMessages(state.activeConversation);
    else showToast('Message failed to send.', 'error');
  });
}

/* ─── NOTIFICATIONS ──────────────────────────────────────────────── */
async function loadNotifications(filter = 'all') {
  const list = $('#notifList');
  if (!list) return;
  list.innerHTML = '<div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';

  const res = await apiFetch('/notifications');
  if (!res || !res.success || !res.data?.notifications?.length) {
    list.innerHTML = emptyState('fa-bell', 'No notifications yet', "You're all caught up!");
    const badge = $('#notifBadge');
    if (badge) badge.hidden = true;
    return;
  }

  const all = res.data.notifications;
  const filtered = filter === 'all' ? all : all.filter(n => n.type === filter.replace(/s$/, ''));

  list.innerHTML = filtered.length
    ? filtered.map(n => `
        <div class="notif-item ${n.isRead ? '' : 'unread'}">
          <img src="${n.sender?.profileImage || 'https://i.pravatar.cc/40'}" alt="">
          <div class="notif-body">
            <p><strong>${escapeHtml(n.sender?.name || 'Someone')}</strong> ${escapeHtml(n.message)}</p>
            <span class="notif-time">${timeAgo(n.createdAt)}</span>
          </div>
          <div class="notif-icon ${n.type}">
            <i class="fa-solid ${n.type === 'like' ? 'fa-heart' : n.type === 'comment' ? 'fa-comment' : 'fa-user-plus'}"></i>
          </div>
          ${!n.isRead ? '<span class="unread-dot"></span>' : ''}
        </div>`).join('')
    : emptyState('fa-bell-slash', 'No notifications here');

  const unread = all.filter(n => !n.isRead).length;
  const badge  = $('#notifBadge');
  if (badge) { badge.textContent = unread || ''; badge.hidden = !unread; }

  // Chip filter
  $$('[data-notif-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      $$('[data-notif-filter]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loadNotifications(chip.dataset.notifFilter);
    });
  });

  // Mark all read
  $('#markAllReadBtn')?.addEventListener('click', async () => {
    await apiFetch('/notifications/read-all', { method: 'PUT' });
    showToast('All marked as read.', 'success');
    loadNotifications(filter);
  });
}

/* ─── BOOKMARKS ──────────────────────────────────────────────────── */
async function loadBookmarks() {
  const feed = $('#bookmarksFeed');
  if (!feed) return;
  feed.innerHTML = '<div class="comment-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>';

  const res = await apiFetch('/users/saved');
  if (!res || !res.success || !res.data?.length) {
    feed.innerHTML = emptyState('fa-bookmark', 'No saved posts yet', 'Bookmark posts to see them here!');
    return;
  }
  feed.innerHTML = res.data.map(post => postTemplate(post)).join('');
}

/* ─── SEARCH ─────────────────────────────────────────────────────── */
function initSearch() {
  const input   = $('#globalSearch');
  const results = $('#searchResults');
  if (!input || !results) return;

  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) { results.hidden = true; return; }
    timer = setTimeout(async () => {
      const res = await apiFetch(`/users/search?q=${encodeURIComponent(q)}&limit=5`);
      if (!res || !res.success || !res.data?.length) { results.hidden = true; return; }
      results.innerHTML = res.data.map(u => `
        <div class="search-result-item" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer" data-nav="profile">
          <img src="${u.profileImage || 'https://i.pravatar.cc/40'}" alt="${escapeHtml(u.name)}" style="width:34px;height:34px;border-radius:50%">
          <div>
            <strong style="font-size:13.5px">${escapeHtml(u.name)}</strong>
            <div style="font-size:12px;color:var(--text-faint)">@${escapeHtml(u.username)}</div>
          </div>
        </div>`).join('');
      results.hidden = false;
    }, 350);
  });

  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !results.contains(e.target)) results.hidden = true;
  });
}

/* ─── INIT ───────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initOfflineBanner();
  initAuth();
  initTheme();
  initNavigation();
  initMobileSidebar();
  initProfileDropdown();
  initModals();
  initComposer();
  initPostInteractions();
  initChat();
  initSearch();

  // Restore session on page refresh
  if (localStorage.getItem('sc-logged-in') === 'true') {
    loadUser();
    enterApp();
  }
});
