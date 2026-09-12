/* TiyanPure — upload APK/XAPK chunked (hasil scrape submit-apk).
   Target utama (direct, TER-RINGAN — byte langsung browser -> APKPure,
   tidak lewat hosting kita sama sekali):
     POST https://developer.apkpure.com/api/v1/user_upload/apk
   Cadangan otomatis (kalau direct diblokir CORS):
     POST /api-upload/api/v1/user_upload/apk   (rewrite Vercel -> developer API)
   Protokol: multipart per chunk 1MB + header X-File-Identifier
             {chunk_total, chunk_index, chunk_logo: "<Date.now()>_<package>"} */
'use strict';

const UPLOAD_TARGETS = [
  'https://developer.apkpure.com/api/v1/user_upload/apk', // direct (diutamakan)
  '/api-upload/api/v1/user_upload/apk',                   // proxy Vercel (aktif setelah deploy)
];
const CHUNK = 1024 * 1024; // 1 MB
const MAXSIZE = 2000 * 1024 * 1024; // 2000 MB
let aborter = null;

function setStatus(msg, cls) {
  const s = $('#upStatus');
  s.textContent = msg;
  s.className = 'status ' + (cls || '');
}
function setBar(pct) {
  $('#upBar').style.display = 'block';
  $('#upBarFill').style.width = pct + '%';
  $('#upPct').textContent = pct + '%';
}

/* Upload penuh ke 1 target. Melempar {retryable:true} kalau gagal level
   jaringan/CORS (boleh coba target lain), atau Error biasa kalau server
   menolak isi file (tak perlu coba target lain). */
async function doUpload(target, meta, f) {
  const total = Math.ceil(f.size / CHUNK);
  const logo = Date.now() + '_' + meta.pkg;
  for (let i = 1; i <= total; i++) {
    const start = (i - 1) * CHUNK;
    const blob = f.slice(start, start + CHUNK);
    const fd = new FormData();
    fd.append('file', blob, f.name);
    fd.append('package_name', meta.pkg);
    fd.append('email', meta.mail);
    fd.append('name', meta.name);
    fd.append('whats_new', meta.whats);
    let res;
    try {
      res = await fetch(target, {
        method: 'POST',
        body: fd,
        signal: aborter.signal,
        headers: {
          'X-File-Identifier': JSON.stringify({ chunk_total: total, chunk_index: i, chunk_logo: logo }),
          'Content-Range': `bytes ${start}-${start + blob.size - 1}/${f.size}`,
        },
      });
    } catch (err) {
      if (err && err.name === 'AbortError') throw err;
      const e = new Error('network');
      e.retryable = true; // CORS / offline / DNS -> coba target lain
      throw e;
    }
    const j = await res.json().catch(() => ({}));
    if (j && j.commands && j.commands.statusCode && j.commands.statusCode !== 'SUCCESS') {
      throw new Error(j.commands.displayMessage || ('Server: ' + j.commands.statusCode));
    }
    const pct = Math.round((i / total) * 100);
    setBar(pct);
    setStatus(`Mengupload… ${pct}% (chunk ${i}/${total})`, '');
    if (i === total) return j;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const drop = $('#dropZone');
  const fileInput = $('#fileInput');
  const form = $('#upForm');

  drop.addEventListener('click', () => fileInput.click());
  ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; showFile(); }
  });
  fileInput.addEventListener('change', showFile);
  $('#cancelBtn').addEventListener('click', () => {
    if (aborter) { aborter.abort(); setStatus('Upload dibatalkan.', 'err'); }
  });

  function showFile() {
    const f = fileInput.files[0];
    if (f) $('#fileName').textContent = f.name + ' (' + fmtBytes(f.size) + ')';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const meta = {
      pkg: $('#fPkg').value.trim(),
      mail: $('#fEmail').value.trim(),
      name: $('#fName').value.trim(),
      whats: $('#fWhats').value.trim(),
    };
    const f = fileInput.files[0];
    if (!meta.pkg || !meta.mail || !meta.name) { setStatus('Lengkapi Nama paket, Nama, dan Email dulu.', 'err'); return; }
    if (!f) { setStatus('Pilih file .APK / .XAPK dulu.', 'err'); return; }
    if (!/\.(apk|xapk)$/i.test(f.name)) { setStatus('Hanya file .APK / .XAPK yang didukung.', 'err'); return; }
    if (f.size > MAXSIZE) { setStatus('Ukuran file melebihi 2000 MB.', 'err'); return; }

    aborter = new AbortController();
    $('#cancelBtn').style.display = '';
    setBar(0);

    try {
      setStatus('Mengupload langsung ke APKPure… 0%', '');
      const done = await doUpload(UPLOAD_TARGETS[0], meta, f);
      setStatus('Berhasil! File masuk antrean review APKPure. ' + ((done && done.commands && done.commands.displayMessage) || ''), 'ok');
    } catch (err) {
      if (err && err.name === 'AbortError') return;
      if (err && err.retryable && !aborter.signal.aborted) {
        // Direct diblokir (biasanya CORS) -> coba lagi via proxy Vercel (same-origin)
        try {
          setStatus('Direct diblokir, mencoba via proxy… 0%', '');
          setBar(0);
          const done2 = await doUpload(UPLOAD_TARGETS[1], meta, f);
          setStatus('Berhasil via proxy! File masuk antrean review APKPure. ' + ((done2 && done2.commands && done2.commands.displayMessage) || ''), 'ok');
          return;
        } catch (err2) {
          if (err2 && err2.name === 'AbortError') return;
          err = err2;
        }
      }
      setStatus('Gagal: ' + (err.message || err) + ' — Alternatif: upload langsung via developer.apkpure.com.', 'err');
    } finally {
      $('#cancelBtn').style.display = 'none';
    }
  });
});
