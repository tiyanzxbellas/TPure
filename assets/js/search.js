/* TiyanPure — halaman hasil pencarian (pakai suggest API hasil scrape) */
'use strict';

function qs(name) {
  return new URLSearchParams(location.search).get(name) || '';
}

async function runSearch() {
  const q = qs('q').trim() || 'minecraft';
  $('#q').value = q;
  $('#resTitle').textContent = 'Hasil untuk "' + q + '"';
  const box = $('#results');
  box.innerHTML = '<div class="empty">Memuat…</div>';

  const res = await tpSuggest(q, 20);
  const apps = (res.data || []).filter(a => a && (a.packageName || a.title));
  $('#liveBadge').textContent = res.live ? '● data live' : '○ mode demo (API tidak terjangkau)';
  if (!apps.length) {
    box.innerHTML = '<div class="empty">Tidak ada hasil. Coba kata kunci lain.<br><br>' +
      TP.TRENDING.map(k => `<a class="chip" href="/search.html?q=${encodeURIComponent(k)}">${esc(k)}</a>`).join(' ') + '</div>';
    return;
  }
  LISTS.res = apps;
  box.innerHTML = apps.map((a, i) => appRow(a, i, 'res')).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  $('#searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('#q').value.trim();
    if (q) location.href = '/search.html?q=' + encodeURIComponent(q);
  });
  runSearch();
});
