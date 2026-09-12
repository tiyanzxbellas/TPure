/* TiyanPure — halaman detail aplikasi (/d/<paket> atau /apk.html?pkg=<paket>).
   Data: suggest API (hasil scrape) — cocokkan packageName persis bila ketemu. */
'use strict';

function qs(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

function heroHTML(n, found) {
  return `<div class="hero-app">
      <img src="${esc(n.icon)}" alt="${esc(n.name)}" onerror="imgFallback(this)">
      <div><h1>${esc(n.name)}</h1><p>${esc(n.pkg)}</p></div>
    </div>
    <div class="kv">
      <div>Skor<b>★ ${esc(n.score)}</b></div>
      <div>Versi<b>${n.version ? 'v' + esc(n.version) : '-'}</b></div>
      <div>Ukuran<b>${fmtBytes(n.size)}</b></div>
      <div>Install<b>${esc(n.installs || '-')}</b></div>
    </div>
    ${found
      ? `<a class="btn green" href="${esc(TP.dlPath(n))}">⬇ Unduh APK${n.version ? ' v' + esc(n.version) : ''}</a>`
      : `<a class="btn green" href="https://apkpure.com/id/search?q=${encodeURIComponent(n.pkg)}" target="_blank" rel="noopener">🔍 Cari "${esc(n.pkg)}" di sumber</a>`}
    <div class="share-row">
      <button class="btn blue" onclick="copyPageLink()">🔗 Salin Link Halaman</button>
      <button class="btn blue" onclick="shareURL(location.href, document.title, '')">📤 Bagikan</button>
    </div>
    ${found && n.url && n.url !== '#' ? `<a class="btn ghost" href="${esc(n.url)}" target="_blank" rel="noopener">Detail di sumber ↗</a>` : ''}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  const pkg = (qs('pkg') || '').trim();
  const box = $('#detailBox');
  const rel = $('#related');
  if (!pkg) {
    box.innerHTML = '<div class="empty">Paket tidak valid. <a href="/">Kembali ke beranda</a>.</div>';
    return;
  }
  $('#crumbHere').textContent = pkg;
  rel.innerHTML = '<div class="loading-row"><div class="skel"></div><div class="skel"></div><div class="skel"></div></div>';

  // 1) Coba cocokkan persis via suggest API
  const res = await tpSuggest(pkg, 20);
  const apps = (res.data || []).filter(a => a && (a.packageName || a.title));
  const hit = apps.find(a => (a.packageName || '').toLowerCase() === pkg.toLowerCase());

  if (hit) {
    const n = normApp(hit);
    document.title = n.name + ' — TiyanPure';
    $('#crumbHere').textContent = n.name;
    box.innerHTML = heroHTML(n, true);
    const others = apps.filter(a => a !== hit).slice(0, 12);
    LISTS.rel = others;
    $('#relLive').textContent = res.live ? '● live' : '○ demo';
    rel.innerHTML = others.length
      ? others.map((a, i) => appCard(a, i, 'rel')).join('')
      : '<div class="empty">Tidak ada data terkait.</div>';
    return;
  }

  // 2) Tidak ketemu persis — tampilkan info dasar + hasil terkait dari keyword
  const key = pkg.split('.').pop() || pkg;
  const res2 = await tpSuggest(key, 12);
  const apps2 = (res2.data || []).filter(a => a && (a.packageName || a.title));
  const guess = { title: key, packageName: pkg };
  document.title = key + ' — TiyanPure';
  box.innerHTML = heroHTML(normApp(guess), false) +
    '<div class="info-box">ℹ️ Detail persis untuk paket ini tidak ketemu di API — tampilkan hasil terkait di bawah, atau cari manual di sumber.</div>';
  LISTS.rel = apps2;
  $('#relLive').textContent = res2.live ? '● live' : '○ demo';
  rel.innerHTML = apps2.length
    ? apps2.map((a, i) => appCard(a, i, 'rel')).join('')
    : '<div class="empty">Tidak ada data terkait.</div>';
});
