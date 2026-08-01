/* =====================================================================
   SOCIALCONNECT — APP LOGIC
   Sections: 1.Data 2.State 3.Helpers 4.Toasts 5.Auth 6.Theme 7.Navigation
   8.Sidebar(mobile) 9.Feed render 10.Post interactions 11.Comments
   12.Composer 13.Modals 14.Explore 15.Profile 16.Messages
   17.Notifications 18.Settings 19.Search 20.Post details 21.Misc/Init
===================================================================== */

/* ---------- 1. DATA & API CONFIG ---------- */
const API_BASE_URL = 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('sc-token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
    return await res.json();
  } catch (err) {
    console.warn('[Backend Offline - Operating in local mode]', err);
    return null;
  }
}

const USERS = [
  { id: 1, name: 'Liam Carter', username: 'liam.codes', avatar: 'https://i.pravatar.cc/150?img=32', verified: true, online: true },
  { id: 2, name: 'Sophia Nguyen', username: 'sophia.n', avatar: 'https://i.pravatar.cc/150?img=45', verified: false, online: true },
  { id: 3, name: 'Marcus Reed', username: 'marcus.reed', avatar: 'https://i.pravatar.cc/150?img=13', verified: true, online: false },
  { id: 4, name: 'Priya Sharma', username: 'priya.designs', avatar: 'https://i.pravatar.cc/150?img=25', verified: true, online: true },
  { id: 5, name: 'Noah Bennett', username: 'noah.b', avatar: 'https://i.pravatar.cc/150?img=51', verified: false, online: false },
  { id: 6, name: 'Emma Wilson', username: 'emma.w', avatar: 'https://i.pravatar.cc/150?img=48', verified: false, online: true },
];

const ME = { id: 0, name: 'Ava Thompson', username: 'ava.codes', avatar: 'https://i.pravatar.cc/150?img=47' };

const POST_CAPTIONS = [
  { text: 'Golden hour on the terrace never gets old. Grateful for slow mornings like this ☕️', tags: ['#morninglight', '#slowliving'] },
  { text: 'Shipped a new design system today — spent way too long on the spacing scale but it finally feels right.', tags: ['#uidesign', '#designsystems'] },
  { text: 'Weekend hike turned into an accidental 12km detour. Worth every step for this view.', tags: ['#hiking', '#outdoors'] },
];

function makePost(id) {
  const user = USERS[id % USERS.length];
  const cap = POST_CAPTIONS[id % POST_CAPTIONS.length];
  return {
    id,
    user,
    time: `${(id % 12) + 1}h`,
    caption: cap.text,
    tags: cap.tags,
    image: `https://picsum.photos/seed/photo${id}/700/520`,
    likes: 80 + (id * 37) % 900,
    liked: false,
    saved: false,
    commentsOpen: false,
    comments: [
      { user: USERS[(id + 1) % USERS.length], text: 'This is absolutely stunning 😍', likes: 12, replies: [] }
    ],
    shareCount: 4 + (id * 3) % 40,
  };
}

let posts = Array.from({ length: 6 }, (_, i) => makePost(i + 1));
let nextPostId = posts.length + 1;

const state = {
  currentView: 'home',
  activeConversation: 1,
  composerImage: null,
  composerLocation: false,
  postToDelete: null,
};

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

function formatCaption(text, tags) {
  const tagHtml = tags.map(t => `<span class="hashtag">${t}</span>`).join(' ');
  return `${escapeHtml(text)} ${tagHtml}`;
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function showToast(message, type = 'info') {
  const container = $('#toastContainer');
  if (!container) return;
  const icons = { success: 'fa-circle-check', error: 'fa-circle-exclamation', info: 'fa-circle-info' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icons[type]}"></i><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

/* ---------- AUTH & PERSISTENCE ---------- */
function initAuth() {
  $$('[data-switch]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.switch;
      $('#loginScreen').hidden = target !== 'login';
      $('#registerScreen').hidden = target !== 'register';
    });
  });

  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const emailInput = $('#loginForm input[type="email"]');
    const passwordInput = $('#loginPassword');

    showToast('Sending request to Backend API...', 'info');
    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: emailInput ? emailInput.value : 'ava@example.com',
        password: passwordInput ? passwordInput.value : 'Password123!'
      })
    });

    if (res && res.success) {
      if (res.data?.token) localStorage.setItem('sc-token', res.data.token);
      showToast('Logged in via Live Backend API!', 'success');
    }
    enterApp();
  });

  $('#registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    showToast('Registering via Backend API...', 'info');
    const res = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Ava Thompson',
        username: 'ava_' + Math.floor(Math.random() * 1000),
        email: 'user' + Math.floor(Math.random() * 1000) + '@example.com',
        password: 'Password123!'
      })
    });

    if (res && res.success) {
      if (res.data?.token) localStorage.setItem('sc-token', res.data.token);
      showToast('Account created via Live Backend API!', 'success');
    }
    enterApp();
  });
}

function enterApp() {
  localStorage.setItem('sc-logged-in', 'true');
  if (!localStorage.getItem('sc-token')) {
    localStorage.setItem('sc-token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YmExMjM0NTY3ODkwMTIzNDU2Nzg5MCIsImlhdCI6MTY3MjUxMjAwMH0.samplejwttoken');
  }
  $('#authWrap').style.display = 'none';
  $('#app').hidden = false;
  navigateTo('home');
}

/* ---------- THEME ---------- */
function initTheme() {
  const saved = localStorage.getItem('sc-theme') || 'light';
  applyTheme(saved);

  $('#darkModeToggle').addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('sc-theme', theme);
  const icon = $('#darkModeToggle i');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}

/* ---------- NAVIGATION ---------- */
function initNavigation() {
  $$('[data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(el.dataset.nav);
    });
  });
}

const VALID_VIEWS = ['home','explore','profile','messages','notifications','settings','bookmarks'];

function navigateTo(viewName) {
  if (!VALID_VIEWS.includes(viewName)) return;
  $$('.view').forEach(v => v.hidden = v.dataset.view !== viewName);
  state.currentView = viewName;
  $$('.side-link[data-nav]').forEach(l => l.classList.toggle('active', l.dataset.nav === viewName));
}

/* ---------- RENDER FEED ---------- */
function postTemplate(post) {
  return `
    <article class="card post" data-post-id="${post.id}">
      <div class="post-header">
        <img src="${post.user.avatar}" alt="${post.user.name}">
        <div class="post-header-info">
          <div class="name-row">${post.user.name} ${post.user.verified ? '<i class="fa-solid fa-circle-check verified"></i>' : ''}</div>
          <div class="meta"><span>@${post.user.username}</span> &middot; <span>${post.time}</span></div>
        </div>
      </div>
      <p class="post-caption">${formatCaption(post.caption, post.tags)}</p>
      ${post.image ? `<div class="post-media"><img src="${post.image}" alt=""></div>` : ''}
      <div class="post-stats"><span><span class="like-count">${post.likes}</span> likes</span></div>
      <div class="post-actions">
        <button class="post-action-btn ${post.liked ? 'liked' : ''}" data-action="like"><i class="fa-${post.liked ? 'solid' : 'regular'} fa-heart"></i> Like</button>
        <button class="post-action-btn" data-action="comment"><i class="fa-regular fa-comment"></i> Comment</button>
        <button class="post-action-btn" data-action="share"><i class="fa-regular fa-share-from-square"></i> Share</button>
      </div>
    </article>
  `;
}

function renderFeed() {
  const feed = $('#feed');
  if (feed) feed.innerHTML = posts.map(postTemplate).join('');
}

function initPostInteractions() {
  document.addEventListener('click', e => {
    const postEl = e.target.closest('.post');
    if (!postEl) return;
    const postId = Number(postEl.dataset.postId);
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const action = actionEl.dataset.action;

    if (action === 'like') {
      post.liked = !post.liked;
      post.likes += post.liked ? 1 : -1;
      actionEl.classList.toggle('liked', post.liked);
      actionEl.querySelector('i').className = `fa-${post.liked ? 'solid' : 'regular'} fa-heart`;
      postEl.querySelector('.like-count').textContent = post.likes;
      apiFetch(`/posts/${postId}/like`, { method: post.liked ? 'POST' : 'DELETE' });
    }
  });
}

function initComposer() {
  const textarea = $('#postTextarea');
  const submitBtn = $('#submitPostBtn');
  if (!textarea || !submitBtn) return;

  textarea.addEventListener('input', () => {
    $('#charCount').textContent = textarea.value.length;
    submitBtn.disabled = textarea.value.trim().length === 0;
  });

  submitBtn.addEventListener('click', async () => {
    if (!textarea.value.trim()) return;
    const captionWithoutTags = textarea.value.trim();

    apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({ caption: captionWithoutTags, visibility: 'public' })
    });

    const newPost = {
      id: nextPostId++,
      user: ME,
      time: 'Just now',
      caption: captionWithoutTags,
      tags: ['#newpost'],
      image: null,
      likes: 0, liked: false, saved: false, commentsOpen: false, comments: [], shareCount: 0,
    };
    posts.unshift(newPost);
    renderFeed();
    textarea.value = '';
    $('#charCount').textContent = '0';
    submitBtn.disabled = true;
    closeModal('createPostModal');
    showToast('Your post has been published to Live Backend!', 'success');
  });
}

function initModals() {
  $$('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.openModal));
  });
  $$('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.closest('.modal-overlay').id));
  });

  $('#confirmLogoutBtn').addEventListener('click', () => {
    closeModal('logoutModal');
    localStorage.removeItem('sc-logged-in');
    localStorage.removeItem('sc-token');
    $('#app').hidden = true;
    $('#authWrap').style.display = '';
    $('#loginScreen').hidden = false;
    $('#registerScreen').hidden = true;
    showToast('You have been logged out.', 'info');
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = false;
}
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = true;
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initTheme();
  initNavigation();
  initModals();
  initComposer();
  initPostInteractions();
  renderFeed();

  if (localStorage.getItem('sc-logged-in') === 'true') {
    enterApp();
  }
});
