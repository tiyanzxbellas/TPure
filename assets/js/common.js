/* TiyanPure — common: config API (hasil scrape), helper, share/salin link, PWA */
'use strict';

/* Hasil scrape m.apkpure.com — endpoint live.
   Di Vercel, /apiproxy diteruskan (rewrite) ke https://m.apkpure.com agar bebas CORS.
   Lokal (tanpa proxy) otomatis fallback ke direct lalu ke data demo. */
const TP = {
  LANG: 'id',
  API_BASES: ['/apiproxy', 'https://m.apkpure.com'],
  suggestURL(base, key, limit) {
    return `${base}/${this.LANG}/api/v1/search_suggestion_new?key=${encodeURIComponent(key)}&limit=${limit || 10}`;
  },
  FALLBACK_ICON: '/assets/icons/icon-96x96.png',
  TRENDING: ['call of duty', 'minecraft', 'fc mobile', 'nekopoi', 'tiktok', 'whatsapp',
    'free fire', 'roblox', 'capcut', 'kucing pink'],
  isLocal: /^(localhost|127\.0\.0\.1|0\.0\.0\.0)/.test(location.hostname),
  /* URL detail cantik & shareable. Hosting (Vercel/.htaccess/_redirects)
     me-rewrite /d/<paket> -> /apk.html?pkg=<paket>. Lokal: pakai query langsung. */
  detailPath(pkg) {
    return this.isLocal ? `/apk.html?pkg=${encodeURIComponent(pkg)}` : `/d/${encodeURIComponent(pkg)}`;
  },
  detailURL(pkg) {
    return location.origin + this.detailPath(pkg);
  },
  /* Halaman download milik kita (/dl/<paket>). Semua info app dibawa via query
     agar user tetap di domain kita; file diambil dari pola direct hasil scrape. */
  dlPath(n) {
    const p = new URLSearchParams();
    if (n.name) p.set('n', n.name);
    if (n.icon) p.set('i', n.icon);
    if (n.version) p.set('v', n.version);
    if (n.size) p.set('s', String(n.size));
    if (n.score) p.set('sc', String(n.score));
    if (n.installs) p.set('inst', n.installs);
    if (n.url && n.url !== '#') p.set('u', n.url);
    const q = p.toString();
    const base = this.isLocal
      ? '/dl.html?pkg=' + encodeURIComponent(n.pkg || '')
      : '/dl/' + encodeURIComponent(n.pkg || '');
    return q ? base + (this.isLocal ? '&' : '?') + q : base;
  },
};

const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtBytes(b) {
  b = Number(b) || 0;
  if (!b) return '-';
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  while (b >= 1024 && i < 3) { b /= 1024; i++; }
  return b.toFixed(b >= 100 ? 0 : 1) + ' ' + u[i];
}

/* Fetch dengan fallback antar base + demo */
async function tpFetchJSON(urls, demo) {
  for (const u of urls) {
    try {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 12000);
      const r = await fetch(u, { signal: ctl.signal, headers: { 'Accept': 'application/json' } });
      clearTimeout(t);
      if (!r.ok) continue;
      const j = await r.json();
      if (j) return { data: j, live: true, via: u };
    } catch (e) { /* coba berikutnya */ }
  }
  return { data: demo || [], live: false, via: 'demo' };
}

async function tpSuggest(key, limit) {
  const urls = TP.API_BASES.map(b => TP.suggestURL(b, key, limit));
  return tpFetchJSON(urls, []);
}

/* Normalisasi item aplikasi dari API suggest / data demo */
function normApp(a) {
  a = a || {};
  return {
    name: a.title || a.key || a.name || 'Unknown',
    pkg: a.packageName || a.pkg || '',
    icon: a.icon || TP.FALLBACK_ICON,
    score: a.score || a.s || '-',
    installs: a.installTotal || a.installs || '',
    version: a.version || '',
    versionCode: a.versionCode || '',
    size: a.fileSize || a.size || 0,
    dl: a.fullDownloadUrl || a.downloadUrl || a.dl ||
      (a.packageName ? `https://m.apkpure.com/id/app/${a.packageName}` : '#'),
    url: a.fullUrl || a.url || '#',
  };
}

/* Kartu + baris + modal detail */
function imgFallback(el) {
  el.onerror = null;
  el.src = TP.FALLBACK_ICON;
}
function appCard(a, i, listName) {
  const n = normApp(a);
  return `<div class="app" data-act="detail" data-list="${esc(listName || '')}" data-i="${i}">
    <img loading="lazy" src="${esc(n.icon)}" alt="${esc(n.name)}" onerror="imgFallback(this)">
    <div class="n">${esc(n.name)}</div><div class="s">★ ${esc(n.score)}</div>
    <a class="dl" data-act="dl" href="${esc(TP.dlPath(n))}">Unduh</a>
  </div>`;
}
function appRow(a, i, listName) {
  const n = normApp(a);
  return `<div class="row" data-act="detail" data-list="${esc(listName || '')}" data-i="${i}">
    <img loading="lazy" src="${esc(n.icon)}" alt="${esc(n.name)}" onerror="imgFallback(this)">
    <div class="t"><div class="n">${esc(n.name)}</div>
    <div class="m">★ ${esc(n.score)}${n.installs ? ' • ' + esc(n.installs) : ''}${n.version ? ' • v' + esc(n.version) : ''}</div></div>
    <a class="dl" data-act="dl" href="${esc(TP.dlPath(n))}">Unduh</a>
  </div>`;
}

const LISTS = {}; // listName -> array aplikasi
let CURRENT_DETAIL = null;
function openDetail(listName, i) {
  const arr = LISTS[listName] || [];
  const n = normApp(arr[Number(i)]);
  CURRENT_DETAIL = n;
  $('#dIcon').src = n.icon;
  $('#dIcon').onerror = function () { imgFallback(this); };
  $('#dName').textContent = n.name;
  $('#dPkg').textContent = n.pkg;
  $('#dScore').textContent = '★ ' + n.score;
  $('#dVer').textContent = n.version ? 'v' + n.version : '-';
  $('#dSize').textContent = fmtBytes(n.size);
  $('#dDl').href = TP.dlPath(n);
  $('#dWeb').href = n.url;
  const dp = $('#dPage');
  if (dp) dp.href = n.pkg ? TP.detailPath(n.pkg) : '#';
  $('#detailModal').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeDetail() {
  $('#detailModal').classList.remove('show');
  document.body.style.overflow = '';
}
document.addEventListener('click', (e) => {
  const dl = e.target.closest('[data-act="dl"]');
  if (dl) { e.stopPropagation(); return; } // biarkan link unduh jalan
  const card = e.target.closest('[data-act="detail"]');
  if (card) openDetail(card.dataset.list, card.dataset.i);
});

/* ---- Salin link + bagikan ---- */
function toast(msg) {
  let t = $('#tpToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'tpToast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2200);
}
async function copyText(t) {
  try {
    await navigator.clipboard.writeText(t);
    return true;
  } catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      return true;
    } catch (e2) { return false; }
  }
}
async function copyLink(url, label) {
  const ok = await copyText(url);
  toast(ok ? ('Link disalin! ' + (label || '')) : 'Gagal menyalin link');
}
function copyDetailLink() {
  if (!CURRENT_DETAIL || !CURRENT_DETAIL.pkg) return toast('Tidak ada link');
  copyLink(TP.detailURL(CURRENT_DETAIL.pkg), CURRENT_DETAIL.name);
}
function copyPageLink() {
  copyLink(location.href, '');
}
async function shareDetail() {
  if (!CURRENT_DETAIL) return;
  const url = CURRENT_DETAIL.pkg ? TP.detailURL(CURRENT_DETAIL.pkg) : location.href;
  shareURL(url, CURRENT_DETAIL.name + ' — TiyanPure', 'Unduh ' + CURRENT_DETAIL.name + ' di TiyanPure');
}
async function shareURL(url, title, text) {
  if (navigator.share) {
    try { await navigator.share({ title: title || 'TiyanPure', text: text || '', url }); } catch (e) {}
  } else {
    copyLink(url, '');
  }
}

/* Drawer menu */
function bindDrawer() {
  const d = $('#drawer');
  if (!d) return;
  $('#menuBtn').addEventListener('click', () => d.classList.add('open'));
  d.querySelector('.mask').addEventListener('click', () => d.classList.remove('open'));
}

/* SEO dinamis: samakan canonical & OG URL dengan domain aktif.
   Crawler tanpa-JS (WhatsApp/Telegram) baca tag statis sebagai fallback,
   crawler ber-JS (Google) selalu dapat URL yang benar walau domain diganti. */
function fixSeoUrls() {
  try {
    const abs = location.origin + location.pathname;
    const img = location.origin + '/assets/icons/og-cover.jpg';
    const set = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    set('link[rel="canonical"]', 'href', abs);
    set('meta[property="og:url"]', 'content', abs);
    set('meta[property="og:image"]', 'content', img);
    set('meta[name="twitter:image"]', 'content', img);
  } catch (e) {}
}

/* ---- PWA: service worker + install prompt ---- */
let deferredPrompt = null;
function bindPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    $$('.need-install').forEach(b => b.style.display = '');
    const banner = $('#pwaBanner');
    if (banner && !localStorage.getItem('tp-pwa-hide')) banner.classList.add('show');
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const banner = $('#pwaBanner');
    if (banner) banner.classList.remove('show');
  });
  $$('[data-install]').forEach(b => b.addEventListener('click', installApp));
  const x = $('#pwaX');
  if (x) x.addEventListener('click', () => {
    $('#pwaBanner').classList.remove('show');
    localStorage.setItem('tp-pwa-hide', '1');
  });
}
async function installApp() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    const banner = $('#pwaBanner');
    if (banner) banner.classList.remove('show');
    return;
  }
  // Fallback: panduan manual (iOS / sudah terinstall / browser tak mendukung)
  $('#iosGuide').classList.add('show');
}

document.addEventListener('DOMContentLoaded', () => { bindDrawer(); bindPWA(); });
