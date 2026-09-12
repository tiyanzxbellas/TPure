/* TiyanPure — halaman download di domain KITA (/dl/<paket>).
   Pakai pola direct hasil scrape ulang halaman download APKPure:
     https://d.apkpure.com/b/APK/{package}?version=latest
   Browser langsung mengunduh file-nya (user tetap di halaman kita),
   fallback: link halaman download asli. */
'use strict';

function qs(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

document.addEventListener('DOMContentLoaded', () => {
  const box = $('#dlBox');
  const pkg = (qs('pkg') || '').trim();
  if (!pkg) {
    box.innerHTML = '<div class="empty">Paket tidak valid. <a href="/">Kembali ke beranda</a>.</div>';
    return;
  }
  const info = {
    name: qs('n') || pkg,
    icon: qs('i') || TP.FALLBACK_ICON,
    version: qs('v') || '',
    size: Number(qs('s')) || 0,
    score: qs('sc') || '-',
    installs: qs('inst') || '',
    url: qs('u') || '',
  };
  document.title = 'Download ' + info.name + ' — TiyanPure';

  const direct = 'https://d.apkpure.com/b/APK/' + encodeURIComponent(pkg) + '?version=latest';
  const detailHref = TP.detailPath(pkg);

  box.innerHTML = `
    <div class="hero-app">
      <img src="${esc(info.icon)}" alt="${esc(info.name)}" onerror="imgFallback(this)">
      <div><h1>${esc(info.name)}</h1><p>${esc(pkg)}</p></div>
    </div>
    <div class="kv">
      <div>Skor<b>★ ${esc(info.score)}</b></div>
      <div>Versi<b>${info.version ? 'v' + esc(info.version) : 'Terbaru'}</b></div>
      <div>Ukuran<b>${info.size ? fmtBytes(info.size) : '-'}</b></div>
      <div>Install<b>${esc(info.installs || '-')}</b></div>
    </div>
    <div class="upload-card" style="text-align:center">
      <div style="font-size:4rem" id="dlEmoji">⏳</div>
      <h2 id="dlTitle">Menyiapkan unduhan… <span id="dlCount">4</span></h2>
      <p style="color:var(--muted)" id="dlSub">Mohon tunggu, file sedang disiapkan dari server.</p>
      <a class="btn green" id="dlBtn" href="${esc(direct)}">⬇ Download APK${info.version ? ' v' + esc(info.version) : ''}</a>
      ${info.url ? `<a class="btn ghost" href="${esc(info.url)}" target="_blank" rel="noopener">Halaman download asli ↗</a>` : ''}
      <a class="btn blue" href="${esc(detailHref)}">← Kembali ke Detail</a>
    </div>
    <div class="share-row">
      <button class="btn blue" onclick="copyPageLink()">🔗 Salin Link Download</button>
      <button class="btn blue" onclick="shareURL(location.href, document.title, '')">📤 Bagikan</button>
    </div>
    <div class="info-box">💡 <b>Cara install:</b> buka file APK yang terunduh → izinkan "Install dari sumber tak dikenal" → Install. Untuk file XAPK gunakan installer XAPK.</div>`;

  // Hitung mundur lalu unduh otomatis (tetap di domain kita sampai browser ambil alih)
  let c = 4;
  const el = $('#dlCount');
  const timer = setInterval(() => {
    c--;
    if (c <= 0) {
      clearInterval(timer);
      $('#dlEmoji').textContent = '⬇️';
      $('#dlTitle').textContent = 'Unduhan dimulai!';
      $('#dlSub').textContent = 'Jika tidak mulai otomatis, ketuk tombol di bawah.';
      location.href = direct;
    } else if (el) {
      el.textContent = c;
    }
  }, 1000);
});
