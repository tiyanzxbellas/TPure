# TiyanPure 💙💚🖤

Clone mobile web APKPure (`m.apkpure.com/id/`) yang di-rebrand jadi **TiyanPure** dengan tema
**hijau – hitam – biru**, ditenagai **live API hasil scrape** + data demo sebagai fallback.

## Fitur

- 🔍 **Search + suggest live** — `GET /id/api/v1/search_suggestion_new` (via proxy `/apiproxy`, fallback direct, fallback demo)
- 🏠 **Homepage clone** — hero slider, trending chips, 3 section aplikasi live, tombol unduh real
- 📄 **Modal detail aplikasi** — skor, versi, ukuran, tombol Unduh APK
- ⬆️ **Submit APK** — upload chunked 1 MB ke `developer.apkpure.com/api/v1/user_upload/apk` (header `X-File-Identifier`)
- 🖼️ **Semua ikon lokal** di `assets/icons/` (PWA 48–512, maskable, favicon, apple-touch, og-cover) — anti broken/expired
- 🔗 **SEO share** — OG + Twitter Card + JSON-LD, logo tampil saat link di-share (WA/Twitter/Telegram/dll)
- 📲 **PWA installable** — manifest, service worker + offline page, banner install, panduan iOS
- 📚 **Dokumentasi scrape** — `docs/API-ENDPOINTS.md` + halaman `/docs/API-ENDPOINTS.html`
- ▲ **Siap deploy ke Vercel** — `vercel.json` (clean URLs + rewrite `/apiproxy/*` → `m.apkpure.com/*` agar bebas CORS)

## Struktur

```
tiyanpure/
├── index.html                ← beranda (clone m.apkpure.com/id/)
├── search.html               ← hasil pencarian (?q=...)
├── list.html                 ← template listing (?type=game|app|discover|...)
├── app.html                  ← detail aplikasi (?pkg=... atau /d/...)
├── submit-apk.html           ← upload APK (clone submit-apk)
├── offline.html              ← halaman offline PWA
├── about.html, contact-us.html, cooperation.html, support.html
├── privacy-policy.html, copyright-policy.html, terms.html, eu-amau.html
├── tiyanpure-app.html        ← promo + install PWA
├── manifest.webmanifest, sw.js
├── vercel.json               ← rewrite URL cantik + proxy API (Vercel)
├── .htaccess                 ← URL cantik (Apache/cPanel)
├── _redirects                ← URL cantik (Netlify/Cloudflare Pages)
├── robots.txt, sitemap.xml
├── assets/
│   ├── css/style.css
│   ├── js/common.js, home.js, search.js, list.js, detail.js, upload.js
│   └── icons/            ← SEMUA logo/ikon lokal (anti-expired)
└── docs/API-ENDPOINTS.md (+ .html)
```

## Daftar URL (shareable, bisa disalin)

| URL | Isi |
|---|---|
| `/` | Beranda |
| `/game`, `/app` | Hub Game & Aplikasi |
| `/discover` | Menemukan |
| `/pre-register` | Pra-Registrasi |
| `/game-24h`, `/app-24h` | Populer 24 jam |
| `/editor-choice` | Pilihan Editor |
| `/game-sales` | Obral Game |
| `/topic/top-new-games`, `/topic/top-new-apps` | Topik rilisan baru |
| `/partner-developers` | Developer Partner |
| `/dl/nama.paket` | **Halaman download di domain kita** (countdown + tombol, pola direct `d.apkpure.com/b/APK/...`) |
| `/d/nama.paket` | **Detail tiap aplikasi** (cth: `/d/com.whatsapp`) — ada tombol Salin/Bagikan |
| `/search.html?q=...` | Hasil pencarian |
| `/submit-apk.html` | Upload APK/XAPK |
| `/about.html`, `/contact-us.html`, `/support.html`, `/privacy-policy.html`, `/terms.html`, `/copyright-policy.html`, `/cooperation.html`, `/eu-amau.html` | Halaman info |
| `/tiyanpure-app.html` | Promo + install PWA |

> Semua tombol **🔗 Salin Link** & **📤 Bagikan** sudah terpasang di: modal tiap aplikasi,
> halaman detail, halaman listing, dan halaman info. Fitur login/auth TIDAK di-clone
> (butuh backend) — semua fitur di web ini jalan tanpa login.

## Deploy ke Vercel (2 cara)

**Cara A — via Dashboard (paling gampang):**

1. Zip folder ini → upload sebagai project baru, atau push ke GitHub lalu Import di vercel.com
2. Framework Preset: **Other**. Build Command: kosong. Output Directory: `.` (root)
3. Deploy. Selesai — PWA + proxy API langsung jalan (butuh HTTPS, otomatis dari Vercel).

**Cara B — via CLI:**

```bash
npm i -g vercel
cd tiyanpure
vercel --prod
```

## 🔄 Ganti domain (expired / DDoS / ganti nama) — TANPA edit file

**Kabar baik: semua URL fungsional web ini relatif** (`/assets/...`, `/apiproxy/...`,
tombol salin link pakai `location.origin` otomatis). Jadi kalau ganti domain:

1. Vercel Dashboard → project → **Settings → Domains** → tambah domain baru (atau hapus yang lama)
2. Arahkan DNS domain baru ke Vercel. **Selesai. Web langsung jalan, 0 file diubah.**

Satu-satunya yang hardcoded cuma tag SEO statis (`og:image`, `canonical`, sitemap) —
itu pun **tidak bikin error**, cuma preview share yang perlu trik di bawah.

**Trik biar preview share (WA/Telegram) anti-pecah selamanya:**
`og:image` TIDAK harus satu domain dengan web. Jadi pasang sekali ke URL Vercel gratisan
(`https://namaproyek.vercel.app/assets/icons/og-cover.jpg`) yang **tidak akan pernah
expired**, lalu domain utama boleh ganti-ganti seenaknya — preview share tetap muncul.
(Vercel juga kasih SSL gratis + proteksi DDoS edge + URL `*.vercel.app` sebagai cadangan
darurat kalau domain custom bermasalah.)

> Bonus: `common.js` → `fixSeoUrls()` otomatis menulis ulang canonical & OG URL mengikuti
> domain aktif saat halaman dibuka (dipakai crawler ber-JS seperti Google).

**Opsional (boleh di-skip):** kalau mau tag statisnya rapi 100% mengikuti domain utama,
find-replace `tiyanpure.vercel.app` → domain kamu di file ini (tidak wajib, web tetap jalan):

- `index.html` (canonical + og:url + og:image + JSON-LD)
- `search.html`, `submit-apk.html`, `list.html`, `app.html`, halaman info (og:*)

## ⬇️ Cara kerja download (tetap di domain kita)

Hasil scrape ulang halaman download APKPure menemukan pola direct file:

```
https://d.apkpure.com/b/APK/{package}?version=latest        ← APK (utama)
https://d.apkpure.com/b/APK/{package}?versionCode=..&nc=..   ← varian versi/ABI
https://d.apkpure.com/b/XAPK/{package}?...                   ← varian XAPK
```

Semua tombol **Unduh** mengarah ke halaman `/dl/{paket}` **milik kita** (countdown +
tombol + salin link), yang lalu meneruskan browser langsung ke file-nya. User tidak
lagi dilempar ke situs APKPure. Kalau pola direct gagal, tersedia link cadangan ke
halaman download asli. (File final dilayani `data.winudf.com` bertoken dari sisi APKPure.)

## 🛟 Troubleshooting: 404 NOT_FOUND di hosting

1. Pastikan **isi folder** `tiyanpure/` yang di-deploy (bukan file `.zip`-nya), dan
   `vercel.json` ada di **root project** (sejajar `index.html`).
2. URL cantik (`/game`, `/d/...`, `/dl/...`) didukung 4 lapis: file statis asli
   (`game.html`, `topic/*.html`, ...) + `vercel.json` + `.htaccess` + `_redirects` +
   router darurat `404.html`. Kalau satu lapis gagal, lapis lain mengambil alih.
3. Setelah deploy ulang, hard-refresh (`Ctrl+Shift+R`) agar service worker lama
   (cache `tiyanpure-v1/v2`) diganti `v3`.

## Test lokal

```bash
cd tiyanpure
python3 -m http.server 8080
# buka http://localhost:8080
```

Catatan: di lokal (tanpa rewrite Vercel), `/apiproxy` tidak ada sehingga web otomatis
pakai direct API → kalau kena CORS, tampil **data demo** (tetap kelihatan bagus).
Setelah deploy ke Vercel, data jadi **live** otomatis.

## Cek PWA & SEO

- Chrome DevTools → **Application → Manifest** & **Lighthouse → PWA/SEO**
- Test share: https://www.opengraph.xyz / https://cards-dev.twitter.com/validator
- Install: Chrome Android → banner "Install TiyanPure" otomatis muncul.
