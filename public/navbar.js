// navbar.js — Gavin Dsn Store

/* ---- Theme toggle (persisted) ---- */
(function(){
    const saved = localStorage.getItem('gd-theme');
    if (saved === 'light') document.body.classList.add('light');
})();

function toggleTheme() {
    const isLight = document.body.classList.toggle('light');
    localStorage.setItem('gd-theme', isLight ? 'light' : 'dark');
}

/* ---- SVG icons ---- */
const ICON_SUN = `<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`;

const ICON_MOON = `<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
</svg>`;

/* ---- Main init ---- */
async function initNavbar(activePage) {
    if (window.Clerk) await window.Clerk.load();

    const clerkUser = window.Clerk?.user || null;
    const username  = clerkUser ? (clerkUser.username || clerkUser.firstName || 'User') : null;
    const email     = clerkUser ? (clerkUser.primaryEmailAddress?.emailAddress || '') : null;

    const nav = document.querySelector('nav');
    if (!nav) return;

    /* --- Theme toggle button --- */
    const themeBtn = document.createElement('button');
    themeBtn.className = 'theme-toggle';
    themeBtn.setAttribute('aria-label', 'Toggle tema');
    themeBtn.innerHTML = ICON_SUN + ICON_MOON;
    themeBtn.addEventListener('click', toggleTheme);
    nav.appendChild(themeBtn);

    /* --- Hamburger --- */
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.id = 'hamburger';
    hamburger.innerHTML = '<span></span><span></span><span></span>';
    nav.appendChild(hamburger);

    /* --- Mobile menu --- */
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.id = 'mobileMenu';

    if (clerkUser) {
        mobileMenu.innerHTML = `
            <div class="mobile-user-info">
                <div class="mobile-avatar">${username.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="mobile-user-name">${username}</div>
                    <div class="mobile-user-email">${email || 'Pengguna Gavin Dsn'}</div>
                </div>
            </div>
            <a href="/" class="mobile-nav-item ${activePage==='home'?'active':''}">
                <div class="mobile-nav-icon">H</div>Beranda
            </a>
            <a href="/dashboard" class="mobile-nav-item ${activePage==='dashboard'?'active':''}">
                <div class="mobile-nav-icon">D</div>Dashboard
            </a>
            <a href="/products" class="mobile-nav-item ${activePage==='products'?'active':''}">
                <div class="mobile-nav-icon">P</div>Produk
            </a>
            <a href="/orders" class="mobile-nav-item ${activePage==='orders'?'active':''}">
                <div class="mobile-nav-icon">O</div>Pesanan Saya
            </a>
            <div class="mobile-divider"></div>
            <a href="https://wa.me/6282298673652" target="_blank" class="mobile-nav-item">
                <div class="mobile-nav-icon">S</div>Hubungi Support
            </a>
            <div class="mobile-divider"></div>
            <button class="mobile-nav-item logout-item" onclick="logoutUser()">
                <div class="mobile-nav-icon">X</div>Logout
            </button>`;
    } else {
        mobileMenu.innerHTML = `
            <a href="/" class="mobile-nav-item ${activePage==='home'?'active':''}">
                <div class="mobile-nav-icon">H</div>Beranda
            </a>
            <a href="/products" class="mobile-nav-item ${activePage==='products'?'active':''}">
                <div class="mobile-nav-icon">P</div>Produk
            </a>
            <div class="mobile-divider"></div>
            <div class="mobile-auth-buttons">
                <a href="/login" class="btn btn-secondary btn-full" style="text-align:center;">Masuk</a>
                <a href="/register" class="btn btn-primary btn-full" style="text-align:center;">Daftar Gratis</a>
            </div>`;
    }

    document.body.appendChild(mobileMenu);

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        }
    });

    const navButtons = document.getElementById('navButtons');
    if (navButtons) {
        if (clerkUser) {
            navButtons.innerHTML =
                '<span class="nav-user">' + username + '</span>' +
                '<a href="/dashboard" class="btn-sm btn-grad">Dashboard</a>' +
                '<button class="btn-sm btn-ghost" onclick="logoutUser()">Logout</button>';
        } else {
            navButtons.innerHTML =
                '<a href="/login" class="btn-sm btn-ghost">Masuk</a>' +
                '<a href="/register" class="btn-sm btn-grad">Daftar</a>';
        }
    }
}

async function logoutUser() {
    if (window.Clerk) await window.Clerk.signOut();
    window.location.href = '/';
}
