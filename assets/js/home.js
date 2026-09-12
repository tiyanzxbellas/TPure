/* TiyanPure — homepage: slider, trending, suggest live, section aplikasi */
'use strict';

/* Data demo (dipakai kalau API live tidak bisa dijangkau).
   Ikon: image.winudf.com (hasil scrape) + fallback otomatis ke ikon lokal. */
const DEMO_APPS = [
  { title: 'Block Craft 3D: Building Game', packageName: 'com.fungames.blockcraft', score: '8.7', installTotal: '100M+', version: '2.21.5', fileSize: 105000000, icon: 'https://image.winudf.com/v2/image1/Y29tLmZ1bmdhbWVzLmJsb2NrY3JhZnRfaWNvbl8xNzgxMDI3MjgxXzA0Mw/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/block-craft-3d%EF%BC%9Abuilding-game/com.fungames.blockcraft', fullDownloadUrl: 'https://m.apkpure.com/id/block-craft-3d%EF%BC%9Abuilding-game/com.fungames.blockcraft/download' },
  { title: 'PUBG Mobile (KR)', packageName: 'com.pubg.krmobile', score: '9.1', installTotal: '50M+', version: '3.5.0', fileSize: 1100000000, icon: 'https://image.winudf.com/v2/image1/Y29tLnB1Ymcua3Jtb2JpbGVfaWNvbl8xNzg4OTk5NjM3XzA2NQ/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/pubg-mobile-app/com.pubg.krmobile', fullDownloadUrl: 'https://m.apkpure.com/id/pubg-mobile-app/com.pubg.krmobile/download' },
  { title: 'Dragon City: Mobile Adventure', packageName: 'es.socialpoint.DragonCity', score: '8.9', installTotal: '100M+', version: '25.1.0', fileSize: 210000000, icon: 'https://image.winudf.com/v2/image1/ZXMuc29jaWFscG9pbnQuRHJhZ29uQ2l0eV9pY29uXzE3NTY4Mzk1MTZfMDEy/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/dragon-city-mobile-1/es.socialpoint.DragonCity', fullDownloadUrl: 'https://m.apkpure.com/id/dragon-city-mobile-1/es.socialpoint.DragonCity/download' },
  { title: 'MiniMuse', packageName: 'com.studiosirenia.minimuse', score: '10.0', installTotal: '100K+', version: '1.2.0', fileSize: 88000000, icon: 'https://image.winudf.com/v2/image1/Y29tLnN0dWRpb3NpcmVuaWEubWluaW11c2VfaWNvbl8xNzg4ODE5NzY4XzAzOQ/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/minimuse/com.studiosirenia.minimuse', fullDownloadUrl: 'https://m.apkpure.com/id/minimuse/com.studiosirenia.minimuse/download' },
  { title: 'Herex Simulator Indonesia Max', packageName: 'net.verlygamedev.herexsimulatorindonesiamax', score: '8.2', installTotal: '1M+', version: '2.0', fileSize: 156000000, icon: 'https://image.winudf.com/v2/image1/bmV0LnZlcmx5Z2FtZWRldi5oZXJleHNpbXVsYXRvcmluZG9uZXNpYW1heF9pY29uXzE3NzEzMDQ1MzhfMDI1/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/herex-simulator-indonesia-max/net.verlygamedev.herexsimulatorindonesiamax', fullDownloadUrl: 'https://m.apkpure.com/id/herex-simulator-indonesia-max/net.verlygamedev.herexsimulatorindonesiamax/download' },
  { title: 'Roblox (VN)', packageName: 'com.roblox.client.vnggames', score: '8.5', installTotal: '10M+', version: '2.66', fileSize: 178000000, icon: 'https://image.winudf.com/v2/image1/Y29tLnJvYmxveC5jbGllbnQudm5nZ2FtZXNfaWNvbl8xNzgyMzgyMzEwXzA4Mg/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/roblox-vng-game/com.roblox.client.vnggames', fullDownloadUrl: 'https://m.apkpure.com/id/roblox-vng-game/com.roblox.client.vnggames/download' },
  { title: 'Quran Audio Player: Quranify', packageName: 'com.mchutov.Quranify', score: '9.4', installTotal: '500K+', version: '3.1.2', fileSize: 42000000, icon: 'https://image.winudf.com/v2/image1/Y29tLm1jaHV0b3YuUXVyYW5pZnlfaWNvbl8xNzc0MzEyNjk4XzA0Ng/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/quran-audio-player-quranify/com.mchutov.Quranify', fullDownloadUrl: 'https://m.apkpure.com/id/quran-audio-player-quranify/com.mchutov.Quranify/download' },
  { title: 'Remi 101', packageName: 'com.mohitemi101.app', score: '7.8', installTotal: '100K+', version: '1.0.4', fileSize: 65000000, icon: 'https://image.winudf.com/v2/image1/Y29tLm1vaGl0ZW1pMTAxLmFwcF9pY29uXzE3NzY5OTc0NDJfMDU4/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/remi-101/com.mohitemi101.app', fullDownloadUrl: 'https://m.apkpure.com/id/remi-101/com.mohitemi101.app/download' },
  { title: 'ZArchiver', packageName: 'ru.zdevs.zarchiver', score: '9.0', installTotal: '100M+', version: '1.0.9', fileSize: 5200000, icon: 'https://image.winudf.com/v2/image1/cnUuemRldnMuemFyY2hpdmVyX2ljb25fMTYwMzk4MTcwNV8wMjQ/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/zarchiver-2025/ru.zdevs.zarchiver', fullDownloadUrl: 'https://m.apkpure.com/id/zarchiver-2025/ru.zdevs.zarchiver/download' },
  { title: 'EA SPORTS FC Mobile 27 BETA', packageName: 'com.ea.gp.fifamobilebeta', score: '8.0', installTotal: '5M+', version: '27.0.01', fileSize: 198000000, icon: 'https://image.winudf.com/v2/image1/Y29tLmVhLmdwLmZpZmFtb2JpbGViZXRhX2ljb25fMTc1NTcxMjQ5NV8wNTk/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/ea-sports-fc-mobile-beta/com.ea.gp.fifamobilebeta', fullDownloadUrl: 'https://m.apkpure.com/id/ea-sports-fc-mobile-beta/com.ea.gp.fifamobilebeta/download' },
  { title: 'Taxsee Driver', packageName: 'com.taxsee.driver', score: '7.5', installTotal: '10M+', version: '8.44', fileSize: 73000000, icon: 'https://image.winudf.com/v2/image1/Y29tLnRheHNlZS5kcml2ZXJfaWNvbl8xNzgxMDE1MTE4XzA2OA/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/taxsee-driver/com.taxsee.driver', fullDownloadUrl: 'https://m.apkpure.com/id/taxsee-driver/com.taxsee.driver/download' },
  { title: 'FC Mobile VN', packageName: 'com.garena.game.fcmobilevn', score: '8.3', installTotal: '1M+', version: '22.0.03', fileSize: 402000000, icon: 'https://image.winudf.com/v2/image1/Y29tLmdhcmVuYS5nYW1lLmZjbW9iaWxldm5faWNvbl8xNzgwMzc1ODQzXzA5Mg/icon.webp?w=204&fakeurl=1&type=.webp', fullUrl: 'https://m.apkpure.com/id/fc-mobile-vn/com.garena.game.fcmobilevn', fullDownloadUrl: 'https://m.apkpure.com/id/fc-mobile-vn/com.garena.game.fcmobilevn/download' },
];

/* Section homepage: tiap section = 1 keyword ke suggest API */
const SECTIONS = [
  { id: 'secDiscover', list: 'discover', title: 'Menemukan', key: 'game online' },
  { id: 'secPop', list: 'pop', title: 'Populer', key: 'video' },
  { id: 'secTop', list: 'top', title: 'Top Aplikasi', key: 'music' },
];

function skeleton(el) {
  el.innerHTML = '<div class="loading-row"><div class="skel"></div><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';
}

async function loadSection(sec, idx) {
  const el = document.getElementById(sec.id);
  if (!el) return;
  skeleton(el);
  const res = await tpSuggest(sec.key, 12);
  let apps = (res.data || []).filter(a => a && (a.packageName || a.title || a.key));
  if (!apps.length) apps = DEMO_APPS.slice(idx * 4, idx * 4 + 8).concat(DEMO_APPS.slice(0, 4)).slice(0, 10);
  LISTS[sec.list] = apps;
  el.innerHTML = apps.map((a, i) => appCard(a, i, sec.list)).join('');
  const badge = document.getElementById(sec.id + 'Live');
  if (badge) badge.textContent = res.live ? '● live' : '○ demo';
}

function renderTrending() {
  const box = $('#trendChips');
  if (!box) return;
  box.innerHTML = TP.TRENDING.map(k =>
    `<a class="chip" href="/search.html?q=${encodeURIComponent(k)}">${esc(k)}</a>`).join('');
}

/* Slider */
function initSlider() {
  const track = $('#slideTrack');
  if (!track) return;
  const dots = $$('#slideDots span');
  let i = 0;
  const n = track.children.length;
  setInterval(() => {
    i = (i + 1) % n;
    track.style.transform = `translateX(-${i * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
  }, 5000);
}

/* Search + suggest live */
function initSearch() {
  const input = $('#q');
  const box = $('#suggestBox');
  const form = $('#searchForm');
  if (!input || !box) return;
  let timer = null;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value.trim() || input.placeholder;
    saveHistory(q);
    location.href = '/search.html?q=' + encodeURIComponent(q);
  });
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (q.length < 2) { box.classList.remove('show'); return; }
    timer = setTimeout(async () => {
      const res = await tpSuggest(q, 8);
      const apps = (res.data || []).filter(a => a && (a.packageName || a.title));
      if (!apps.length) { box.classList.remove('show'); return; }
      LISTS.sug = apps;
      box.innerHTML = apps.map((a, j) => {
        const n = normApp(a);
        return `<div class="sug-item" data-act="detail" data-list="sug" data-i="${j}">
          <img loading="lazy" src="${esc(n.icon)}" alt="" onerror="imgFallback(this)">
          <div class="t"><div class="n">${esc(n.name)}</div><div class="s">★ ${esc(n.score)}${n.installs ? ' • ' + esc(n.installs) : ''}</div></div>
          <a class="dl" data-act="dl" href="${esc(TP.dlPath(n))}">Unduh</a>
        </div>`;
      }).join('');
      box.classList.add('show');
    }, 350);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.suggest')) box.classList.remove('show');
  });
}

function saveHistory(q) {
  try {
    const k = 'tp.search.history';
    let h = JSON.parse(localStorage.getItem(k) || '[]');
    h = [q, ...h.filter(x => x !== q)].slice(0, 10);
    localStorage.setItem(k, JSON.stringify(h));
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  renderTrending();
  initSlider();
  initSearch();
  SECTIONS.forEach((s, i) => loadSection(s, i));
});
