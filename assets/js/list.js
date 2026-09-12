/* TiyanPure — halaman listing generik (tanpa login).
   1 template dipakai banyak URL: /game /app /discover /pre-register
   /game-24h /app-24h /editor-choice /game-sales /topic/*  */
'use strict';

/* type -> {judul, deskripsi, [(judul section, keyword API)]} */
const LIST_PAGES = {
  'game': { t: '🎮 Game', d: 'Jelajahi game Android populer — unduh APK/XAPK gratis.',
    s: [['Game Online', 'game online'], ['Game Offline', 'game offline'], ['Balap & Aksi', 'racing'], ['Puzzle & Santai', 'puzzle']] },
  'app': { t: '📱 Aplikasi', d: 'Jelajahi aplikasi Android populer — unduh APK/XAPK gratis.',
    s: [['Video & Hiburan', 'video'], ['Musik & Audio', 'musik'], ['Foto & Editor', 'editor foto'], ['Tools & VPN', 'vpn']] },
  'discover': { t: '🧭 Menemukan', d: 'Temukan aplikasi & game menarik yang lagi naik daun.',
    s: [['Lagi Viral', 'viral'], ['Trending', 'trending'], ['Baru & Segar', 'game baru']] },
  'pre-register': { t: '⏳ Pra-Registrasi', d: 'Game & aplikasi yang akan segera rilis — catat dan pantau.',
    s: [['Segera Hadir', 'game baru 2025'], ['RPG & Petualangan', 'rpg'], ['Strategi', 'strategi']] },
  'game-24h': { t: '🔥 Game Populer 24 Jam', d: 'Game paling banyak dicari dalam 24 jam terakhir.',
    s: [['Terpopuler', 'game populer'], ['Battle Royale', 'battle royale']] },
  'app-24h': { t: '🔥 Aplikasi Populer 24 Jam', d: 'Aplikasi paling banyak dicari dalam 24 jam terakhir.',
    s: [['Terpopuler', 'aplikasi populer'], ['Sosial & Chat', 'media sosial']] },
  'editor-choice': { t: "⭐ Pilihan Editor", d: 'Kurasi pilihan editor — aplikasi & game terbaik minggu ini.',
    s: [['Pilihan Editor', 'premium'], ['Wajib Coba', 'pro']] },
  'game-sales': { t: '💸 Obral Game', d: 'Game premium & favorit dengan harga miring / gratis.',
    s: [['Game Premium', 'minecraft'], ['Favorit Sepanjang Masa', 'gta']] },
  'topic': { t: '🆕 Topik', d: 'Kumpulan aplikasi & game terbaik berdasarkan topik.',
    s: [['Unggulan', 'populer']] },
  'top-new-games': { t: '🆕 Game Baru Terbaik', d: 'Rilisan game terbaru yang paling banyak diunduh.',
    s: [['Baru Rilis', 'game baru'], ['Aksi & RPG', 'action rpg']] },
  'top-new-apps': { t: '🆕 Aplikasi Baru Terbaik', d: 'Rilisan aplikasi terbaru yang paling banyak diunduh.',
    s: [['Baru Rilis', 'aplikasi baru'], ['Produktivitas', 'produktivitas']] },
  'partner-developers': { t: '🤝 Developer Partner', d: 'Aplikasi resmi dari developer partner.',
    s: [['Unggulan Partner', 'spotify'], ['Hiburan', 'netflix']] },
};

function qs(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

async function loadListSection(boxId, listName, title, keyword) {
  const box = document.getElementById(boxId);
  box.innerHTML = '<div class="loading-row"><div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';
  const res = await tpSuggest(keyword, 12);
  const apps = (res.data || []).filter(a => a && (a.packageName || a.title));
  LISTS[listName] = apps;
  document.getElementById(boxId + 'Live').textContent = res.live ? '● live' : '○ demo';
  box.innerHTML = apps.length
    ? apps.map((a, i) => appCard(a, i, listName)).join('')
    : '<div class="empty">Belum ada data untuk "' + esc(keyword) + '".</div>';
}

document.addEventListener('DOMContentLoaded', () => {
  const ds = (document.body && document.body.dataset) || {};
  let type = ds.listType || qs('type') || 'discover';
  if (type === 'topic') type = ds.topic || qs('topic') || 'topic';
  const cfg = LIST_PAGES[type] || LIST_PAGES['discover'];
  document.title = cfg.t.replace(/^[^\s]+\s/, '') + ' — TiyanPure';
  $('#pageTitle').textContent = cfg.t;
  $('#pageDesc').textContent = cfg.d;
  $('#crumbHere').textContent = cfg.t;
  const wrap = $('#sections');
  wrap.innerHTML = cfg.s.map((sec, i) => `
    <section class="sec">
      <div class="sec-h"><h2>${esc(sec[0])}</h2><span id="ls${i}Live" style="font-size:1.2rem;color:var(--muted)"></span></div>
      <div class="hscroll" id="ls${i}"></div>
    </section>`).join('');
  cfg.s.forEach((sec, i) => loadListSection('ls' + i, 'ls' + i, sec[0], sec[1]));
});
