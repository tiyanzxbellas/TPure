# Hasil Scrape — APKPure Mobile Web: API Endpoint & Base URL

> **Sumber yang di-scrape:**
> - `https://m.apkpure.com/id/` (homepage)
> - `https://m.apkpure.com/id/submit-apk` (halaman upload APK)
>
> **Tanggal scrape:** 12 September 2026
> **Metode:** curl (UA Chrome Android) + parsing HTML/JS inline & eksternal, lalu verifikasi ulang tiap endpoint penting dengan request langsung.
> **File mentah tersimpan di:** `apkpure_scrape/` (`home.html`, `submit.html`, `js/*.js`, `robots.txt`)
>
> Kesimpulan singkat: **kedua URL memang 1 web yang sama** — template, `global_v1285.min.js`, analytics, dan pola auth-nya identik. Bedanya hanya modul konten (`dt_report_s_v1239.js?page=page_home_common` vs `page_category_ranking`) dan modul upload chunked (jQuery File Upload) yang hanya ada di halaman submit-apk.

---

## 1. Base URL / Domain

### 1.1 Domain utama APKPure

| Base URL | Fungsi | Bukti |
|---|---|---|
| `https://m.apkpure.com` | **Base utama (mobile web)** — semua path `/id/...` di bawah ini menempel di sini | URL yang di-scrape |
| `https://apkpure.com` | Desktop web; canonical (`<link rel=canonical href="https://apkpure.com/id/">`); **action form search** mengarah ke sini | `home.html` form `action="https://apkpure.com/id/search"` |
| `https://developer.apkpure.com` | Developer Console + **API upload APK** | `initPostUploadApk('https://m.apkpure.com','https://developer.apkpure.com')` |
| `https://i.apkpure.com` | **Identity/Account API** (dibaca dari `data-iapi-url="https://i.apkpure.com"` di `<body>`) + serve `user_v1002.js` | `home.html`, `submit.html`, `global_v1285.min.js` |
| `https://a.apkpure.com` | API share-counter; juga di dns-prefetch/preconnect | `$.ajax({url:"https://a.apkpure.com/api-shares.json?url="...})` |
| `https://download.apkpure.com` | CDN download (preconnect + dns-prefetch) | `<link rel=preconnect href="//download.apkpure.com">` |
| `https://image.winudf.com` | Image CDN (icon, banner, screenshot, PWA icon) — domain paling sering muncul (±278 ref di homepage) | seluruh `<img>` |
| `https://static.apkpure.com` | Static asset legacy (menu png, stars svg, no_login) | CSS inline + `user_v1002.js` |
| `https://static.apkpures.xyz` | Static asset utama (JS/CSS mobile & www: `global_*`, `search_*`, fileupload, touchslide…) | semua `<script src>` lokal |
| `https://apkpure.com/static-2/` | Static asset v2 (device lib, SVG sprite) | `device-1.2.49-min.js`, `*.stack-*.svg` |
| `https://a.apkpures.xyz` | Analytics + DT SDK (`analytics_v1025.js`, `dt_sdk_v1023.js`, `dt_report_s_v1239.js`) | `<script src="//a.apkpures.xyz/...">` |
| `https://a.cdnpure.com` | Analytics collect + group_user report | `analytics_v1025.js`, inline `$.ajax` |
| `https://r.cdnpure.com` | Event/device/speed report | inline `$.ajax` + `fetch` + `Image().src` |
| `https://beacon.cdnpure.com` | **Report domain aktif DT SDK** (`reportDomain` di `reportDtConfig`; fallback default `r.apkpure.net`) | `window.reportDtConfig` inline |
| `https://r.apkpure.net` | Fallback report domain DT (`/webReport`, `/tmp`, `/report`) | `dt_sdk_v1023.js`, `dt_report_home.js` |
| `https://r-eo.apkpure.net` | Speed report jalur EO (`ru_speed`) | inline `fetch(...)` |
| `https://svibeacon.onezapp.com` | DataHub upload (`/analytics/v2_upload`, dipakai saat `use_datahub:true`) | `dt_sdk_v1023.js` |
| `https://tapi.pureapk.com` | Push/FCM token report API (`/v3/report_token`) | inline `uploadToken()` |
| `https://cdnpure.com` | Library iklan + share-button | `ads-1.0.4.js`, `share-button.1.2.4.*` |
| `https://iphone.apkpure.com` | Knowledge base upload aplikasi iOS (.IPA) | blok `ios-text` di submit-apk |
| `https://windows.apkpure.com`, `https://tvonic.apkpure.com`, `https://apk.com`, `https://aipure.ai` | Sister site (footer) | footer homepage |

### 1.2 Domain pihak ketiga

| Domain | Fungsi |
|---|---|
| `www.googletagmanager.com` | gtag (`UA-61066224-5` di home, `G-NT1VQC8HKJ` di submit) |
| `pagead2.googlesyndication.com`, `googleads.g.doubleclick.net` | AdSense (`ca-pub-6510778225276763`) |
| `www.gstatic.com` | Firebase SDK (`firebase-app.js`, `firebase-messaging.js` v8.10.0) |
| `cdnjs.cloudflare.com` | fancybox, clipboard.js, typeahead |
| `apkpure.disqus.com` | Komentar Disqus (detail page) |
| `www.pushbullet.com`, `www.apkpure.com/pushbullet` | Notifikasi update aplikasi |
| `cdn.taboola.com` | Taboola widget |
| `chrome.google.com` (webstore) | APK Downloader extension (`glngapejbnmnicniccdcemghaoaopdji`) |
| `t.me`, `instagram.com`, `twitter.com`, `youtube.com`, `facebook.com`, `vk.com` | Sosial media |
| `buffbuff.com`, `snaptube.live` | Partner (`apkpurePartnerConfig`) |

---

## 2. API Endpoint

Legenda: ✅ = sudah diverifikasi live saat scrape (12 Sep 2026). `{lang}` = kode bahasa, mis. `/id`.

### 2.1 Search & Discovery — base `https://m.apkpure.com` / `https://apkpure.com`

| # | Method | Endpoint | Parameter | Keterangan | Sumber |
|---|---|---|---|---|---|
| 1 | ✅ GET | `{lang}/api/v1/search_suggestion_new?key=%QUERY&limit=20` | `key` (query), `limit` (default 20) | **Autocomplete search** (Bloodhound `remote.url`). Response: array JSON berisi `key`, `packageName`, `title`, `icon`, `score`, `scoreTotal`, `installTotal`, `url`, `fullUrl`, `downloadUrl`, `fullDownloadUrl`, `fileId`, `fileSize`, `version`, `versionCode`, `searchInfo.rid`, `showDownloadBtn`, dsb. | `search_v1011.min.js` |
| 2 | ✅ GET | `https://apkpure.com/{lang}/search?q=...` | `q`, `ici=hot_index` (trending), `region`, `search_type`, `search_input_key` | **Halaman hasil search** — action dari `<form class="formsearch">`. Catatan: form di mobile web POST/GET-nya ke domain **desktop** `apkpure.com`, bukan `m.*`. | `home.html` `<form action=...>` |
| 3 | GET | link trending `https://apkpure.com/{lang}/search?q=...&ici=hot_index` | — | 10 keyword trending di homepage (contoh: `call of duty`, `minecraft`, `fc mobile`…) | `home.html` |

Contoh respons #1 (`GET https://m.apkpure.com/id/api/v1/search_suggestion_new?key=minecraft&limit=3`):

```json
[{"key":"Minecraft Original","packageName":"com.minecraftpe.minecraft.original.free",
"title":"Minecraft Original","icon":"https://image.winudf.com/...","installTotal":"10M+",
"score":"5.2","fullUrl":"https://apkpure.com/id/minecraft-original/com.minecraftpe.minecraft.original.free",
"downloadUrl":"/id/minecraft-original/com.minecraftpe.minecraft.original.free/download?utm_content=1008",
"fullDownloadUrl":"https://m.apkpure.com/id/.../download?utm_content=1008",
"fileId":"b/APK/Y29tLm1pbmVjcmFmdHBl...","fileSize":136553032,"version":"1.16.201","versionCode":3, ...}]
```

### 2.2 Info aplikasi & AJAX listing — base `https://m.apkpure.com`

| # | Method | Endpoint | Parameter / Body | Keterangan | Sumber |
|---|---|---|---|---|---|
| 4 | ✅ POST | `/api/www/command-version_more` | `package`, `vid` (version id), `lang` | Ambil changelog versi lama ("more" di daftar versi, detail page). Tes dummy → `{"error":1}` (endpoint hidup). | `global_v1285.min.js` → `initVersions` |
| 5 | GET | `{halaman-listing}?ajax=1&page=N` | `ajax=1`, `page` | **Paginasi "load more"** — `initLoadMore` mengubah href tombol menjadi `setUrlParams(t,{ajax:1})`, lalu append HTML. Juga dipakai form `#search-page`. | `global_v1285.min.js`; didukung `robots.txt` (`Disallow: /*?*ajax=1*`) |
| 6 | ✅ GET | `{lang}/api/v2/app-update-recommend` | (butuh login, cookie session) | Rekomendasi update aplikasi di menu user. Tanpa login → `{"error":-1,"msg":"User not logged in"}`. | `user_v1002.js` → `` $.get(`${$$x_ll}/api/v2/app-update-recommend`) `` |
| 7 | GET | `//apkpure.disqus.com/embed.js` + iframe `comment_url + $.param(comment_config)` | — | Sistem komentar (detail page). | `global_v1285.min.js` → `initDisqus` |

### 2.3 Akun & Auth — base `https://i.apkpure.com` (via `data-iapi-url`) + same-origin

| # | Method | Endpoint | Body / Param | Keterangan | Sumber |
|---|---|---|---|---|---|
| 8 | ✅ POST | `https://i.apkpure.com/account/api/v2/user_email_auth` | (kosong; mengandalkan cookie, `withCredentials:true`) | Otorisasi/subscribe email user. Tanpa login → `{"error":1,"msg":"user no login"}`. Dipanggil dari popup bell-email & `user_sub_confirm`. | `global_v1285.min.js` → `initEmailAuthorization`; inline home |
| 9 | POST | `https://i.apkpure.com/account/api/v2/user_download_info` | `packageName` | Mencatat info download user saat klik `.download-box`. | `global_v1285.min.js` → `initDetailsUserDownload` |
| 10 | GET | `{lang}/account/auth/login` | — | Mengembalikan JSON `{newLoginCss, newLoginHtml, newLoginJs, cdnjsUrl}` untuk popup login (One-Tap fallback). | `global_v1285.min.js` → `oneTapTAfallback` |
| 11 | POST | `{action form #cmt-login-form}` | `account`, `password` (+`captcha` jika ada) | Login akun (AJAX, `withCredentials`). Validasi: username 1–20 char, password 6–32 char. | `global_v1285.min.js` → `initLoginRegister` |
| 12 | POST | `{action form #cmt-register-form}` | `account`, `email`, `password`, `password_r` (+`captcha`) | Register akun. Sukses → redirect `apkpure__next` cookie / `{lang}/account/email?show_tip=1` / `{lang}/` | `global_v1285.min.js` |
| 13 | POST | `{action form reset password}` | `email`, `captcha`, `password` | Reset password. Sukses → redirect `{lang}/login`. | `global_v1285.min.js` |
| 14 | GET (popup) | `/auth/{provider}` dan `/auth/v2/{google,facebook,twitter}` | — | Login sosial via `window.open(url,"Connect",700x520)`. Google/FB/Twitter memakai `/auth/v2/`. Callback global: `window.popupResult`. | `global_v1285.min.js` (`[data-social]` handler) |
| 15 | POST | `{iapi}/auth/v2/one-tap/verify` | `credential` (Google One Tap JWT) | Verifikasi One Tap → response `{user}` lalu `setNavUserInfo()`. | `global_v1285.min.js` |
| 16 | GET | `/account/logout` | — | Logout (link nav + menu). | `home.html`, `submit.html`, `user_v1002.js` |
| 17 | GET | `{lang}/account/email?show_tip=1` | — | Landing setelah register. | `global_v1285.min.js` |
| 18 | GET | halaman: `{lang}/login`, `{lang}/users/`, `{lang}/users/{id}`, `…/download-management`, `…/settings` | — | Halaman user (di-set dinamis oleh `setNavUserInfo()`; guest diarahkan ke `/id/login`). | `user_v1002.js` |

### 2.4 Upload APK — halaman `submit-apk` → base `https://developer.apkpure.com` ✅

Alur lengkap dari inline script (fungsi `initPostUploadApk(local_host, post_host)`):

```js
initPostUploadApk('https://m.apkpure.com', 'https://developer.apkpure.com');
// url upload = post_host + '/api/v1/user_upload/apk'
```

| # | Method | Endpoint | Detail |
|---|---|---|---|
| 19 | ✅ POST | `https://developer.apkpure.com/api/v1/user_upload/apk` | **Upload APK/XAPK chunked** via jQuery File Upload. Probe GET → `{"commands":{"statusCode":"INCORRECT_PKG","displayMessage":"Invalid Package Name"},...}` (endpoint hidup). |
| | | Konfigurasi upload | `maxChunkSize: 1 MB`, `type:'POST'`, `withCredentials:true`, `acceptFileTypes: /(\.\|\/)(apk\|xapk)$/i`, `maxFileSize: 2000 MB`, `limitConcurrentUploads: 1`, `dropZone: null`, `dataType:'json'` |
| | | `formData` | `package_name` (#file-upload-package), `email` (#file-upload-email), `whats_new` (#file-upload-whats_new), `name` (#file-upload-name) — ketiganya wajib lolos `reportValidity()` sebelum upload jalan |
| | | Header per chunk | `X-File-Identifier: {"chunk_total": ceil(total/maxChunkSize), "chunk_index": n, "chunk_logo": "<Date.now()>_<package>"}` (di-set di `beforeSend`) |
| | | Respons | `data.jqXHR.responseJSON.commands.statusCode === 'SUCCESS'` → UI "Your App is Success" + trigger `.js-upload-questionnaire-trigger`; selain itu tampilkan `commands.displayMessage`, tombol jadi "Upload Again". `chunkdone` non-SUCCESS menghentikan chunk berikutnya. Progress lingkaran via callback `progress`. |
| 20 | — | Input file | `<input type="file" id="file_upload" name="file" accept=".apk,.xapk">` |
| 21 | GET | `https://iphone.apkpure.com/ipa-install-online` | Jalur upload aplikasi iOS (.IPA) — knowledge base. |

### 2.5 Download — base `https://m.apkpure.com` + CDN

| # | Method | Endpoint / Pola | Keterangan |
|---|---|---|---|
| 22 | GET | `{lang}/{slug}/{package}/download[/{version}]?utm_content=…&icn=…&ici=…&from=…` | Pola URL download. Contoh nyata: `/id/apkpure/com.apkpure.aegon/download/3.20.7803?utm_content=1006&icn=aegon&ici=text_home-m&from=text_home-m`. Search-suggest juga mengembalikan `downloadUrl`/`fullDownloadUrl` per aplikasi. |
| 23 | GET | `//download.apkpure.com` | Host file download (preconnect). |
| 24 | GET (jsonp) | `{action #captcha_form}` → `…?callback=…` | Download region-terkunci: submit captcha → `status_code:"SUCCESS"` → redirect `down_url`; `CAPTCHA_ERROR` → tampilkan error. Terkait string `REGION_DOWN-*` di `language_v1034.js`. |
| 25 | GET (popup) | `https://www.apkpure.com/pushbullet?package={pkg}` atau `https://www.pushbullet.com/channel-popup?tag={tag}` | Follow update aplikasi (700×460). |

### 2.6 Analytics, reporting & tracking

| # | Method | Endpoint | Parameter / Body | Keterangan | Sumber |
|---|---|---|---|---|---|
| 26 | ✅ GET (jsonp) | `//a.cdnpure.com/analytics/collect_v1025?...&callback=…` | `qimei` (localStorage `__BEACON_deviceId`), `client_id` (cookie `_ga`), `cmd` (`pageview`/`event`), `c`, `a`, `l`, `v`, `hl`, `t`, `w` (btoa `navigator.webdriver`), `r` (referrer), `u` (URL), `tzo`, `page_config`, `sample`, `f/fc/ff` (fingerprint) | `$$.analytics.send(cmd,c,a,l,v)`; langsung kirim `pageview` saat load. Tes → `test({"cmd":"pageview","error":""})`. | `analytics_v1025.js` |
| 27 | GET | `//a.cdnpure.com/report/group_user` | `user_id` (qimei cookie, direfresh), `biz_id='apkpure'`, `sub_bizid='h5'`, `h5_url`, `h5_ref`, `event_timestamp`; `withCredentials:true` | Report grup user saat load. | inline home & submit |
| 28 | POST (JSON) | `https://r.cdnpure.com/report?project=web_navigator` | `{pagePvId…, interactionType, eventData{clientX,clientY,targetTag,…}, ts, pageUrl, referrer, host}` | Report interaksi pertama user (click/touchstart/… sekali per tipe). | inline home |
| 29 | GET | `https://{deviceReportDomain‖r.cdnpure.com}/report?project=device_report&host=…&msg=…` | `project=device_report`, `host`, `msg` (init/init_qimei/init_fingerprint/…) | Device/fingerprint report. | inline `reportDeviceEvent` |
| 30 | POST | `https://{reportDomain‖r.apkpure.net}/webReport` | batch event DT SDK 4.5.3-web | **Upload event utama DT**. `reportDomain` aktual = `beacon.cdnpure.com` (`use_datahub:true`, `use_es:true`, `h5_exp_id`, `rmd:'prod123'`, `setName:'ath-m-fjny-prod'`). | `dt_sdk_v1023.js` + `reportDtConfig` |
| 31 | POST | `https://{reportDomain‖r.apkpure.net}/tmp` | `{platformId, mainAppKey, appVersion, sdkVersion, …}` | Ambil konfigurasi SDK (sampling, blacklist…). | `dt_sdk_v1023.js` → `requestConfig` |
| 32 | POST (sendBeacon) | `https://svibeacon.onezapp.com/analytics/v2_upload` | batch event (URL hasil replace `/webReport`) | Jalur DataHub saat `use_datahub:true`; jalur ES via sendBeacon ke `/webReport` saat `use_es:true`. | `dt_sdk_v1023.js` → `onSendBeacon` |
| 33 | GET | `https://r.apkpure.net/report?project=DT_ERROR&url=…&refer=…&os=…&wpid=…&msg=…` | error JS + stack | Error log DT. | `dt_report_home.js` |
| 34 | GET + POST | `https://r.cdnpure.com/report?project=ru_speed&type=cf_bottom&host=…` (Image) dan `POST https://r-eo.apkpure.net/report?project=ru_speed` `{type:'eo_bottom',url,host}` | — | Speed report Rusia/CDN, sampling 30% (`Math.random()<0.3`, `window.yaContextCb`). | inline home & submit |
| 35 | ✅ GET (jsonp) | `https://a.apkpure.com/api-shares.json?url={canonical}&callback=…` | `url` (canonical page) | Share counter → render `.share-counter` + `SHARES`. Tes → `{"shares":""}`. | inline share-button |
| 36 | ✅ GET→POST | `https://tapi.pureapk.com/v3/report_token?h5_qimei=…&token=…&lang=en&uid=…&account_type=1&domain=…&zone=…` + header `Ual-Access-Businessid: projecta` | FCM token (hanya jika `Notification.permission==="granted"`) | Upload push token; Firebase project `apkpure-web-firebase` (apiKey `AIzaSyDGl5…`, sender `708547724301`, vapid `BBGaVC7…` — public web key). Token disimpan di `localStorage` (`apkpure-firebase-token`, `apkpure-last-upload-token-time`). | inline `uploadToken()/getAndUploadToken()` |
| 37 | — | Google stack | — | gtag `UA-61066224-5` (home) / `G-NT1VQC8HKJ` (submit), AdSense `ca-pub-6510778225276763`, Taboola, Pushbullet `gtag event`. | `<script>` tags + `global_v1285.min.js` |

### 2.7 Static asset, i18n, PWA & misc — base `https://m.apkpure.com` kecuali disebut

| # | Method | Endpoint | Keterangan |
|---|---|---|---|
| 38 | GET | `/language_v1034.js?hl={lang}` | Kamus `$$lang` (UPLOAD-*, SIGN_VERIFY-*, REGION_DOWN-*, USER-*, COMMENT-*) + `$$x_ll='/id'`, `$$x_ll_root='/id/'`. |
| 39 | GET | `https://i.apkpure.com/user_v1002.js?hl=id&mobile=1&r={rand}` | State user `$$_$$.user` + `setNavUserInfo()` (guest → link `/id/login`). |
| 40 | GET | `//a.apkpures.xyz/analytics_v1025.js`, `dt_sdk_v1023.js`, `dt_report_s_v1239.js?page={page_home_common‖page_category_ranking}` | Analytics & DT SDK; **submit-apk memakai modul `page_category_ranking`** (bukan `page_submit`), homepage memakai `page_home_common`. |
| 41 | GET | `https://static.apkpures.xyz/mobile/static/js/global_v1285.min.js` (+`jquery.3.6.0`, `lazyload-11.0.6`, `touchslide.fix.v2`) | Core logic mobile web (semua `init*` di atas). |
| 42 | GET | `https://static.apkpures.xyz/www/static/js/search_v1011.min.js`, `…/script/typeahead.bundle.fix.v2.min.js` | Search suggest (Bloodhound + typeahead). |
| 43 | GET | `https://static.apkpures.xyz/www/static/script/jquery.{ui.widget,fileupload,fileupload-process,fileupload-validate}.js` | **Hanya di submit-apk** — mesin chunked upload. |
| 44 | GET | `https://apkpure.com/static-2/assets/js/device-1.2.49-min.js` | Library device-fingerprint **ter-obfuscasi** (±954 KB); endpoint pastinya hanya terlihat saat runtime. |
| 45 | GET | `/sw_v3.js` | Service Worker (`navigator.serviceWorker.register("/sw_v3.js")`). |
| 46 | GET | `/manifest_v11.json` | PWA manifest (`start_url: "/?utm_source=pwa…"`, icon `image.winudf.com/.../pwa_icon.png`). |
| 47 | GET | `/robots.txt` | `Disallow: /url?q=`, `/u/`, `/users/`, `*?*ajax=1*`, `need-update.html`, `report-content.html` (× semua locale). Sitemap: `https://apkpure.com/sitemap.xml`. |

---

## 3. Route internal (mobile, locale `id`)

Ditemukan dari `href` di homepage (pola berlaku untuk semua locale: ganti `/id` dengan `/`, `/br`, `/es`, …):

**Hub & listing**

| Route | Keterangan |
|---|---|
| `/id/` | Homepage (yang di-scrape) |
| `/id/game`, `/id/app` | Hub game & aplikasi |
| `/id/discover` | Discover ("Menemukan") |
| `/id/pre-register` | Pre-registrasi |
| `/id/game-24h`, `/id/app-24h` | Populer 24 jam |
| `/id/editor-choice` | Pilihan editor |
| `/id/game-sales` | Obral game |
| `/id/topic/top-new-games`, `/id/topic/top-new-apps` | Topik |
| `/id/partner-developers-apps-on-apkpure` | Partner developer |

**Detail & aksi**

| Pola route | Contoh |
|---|---|
| `/id/{slug}/{package}` | `/id/whatsapp-android/com.whatsapp` |
| `/id/{slug}/{package}/download[/{version}]` | `/id/apkpure/com.apkpure.aegon/download/3.20.7803` |
| `/id/submit-apk` | Upload APK (yang di-scrape) |
| `/id/login`, `/id/users/…` | Auth & user center |
| `/id/support`, `/id/apkpure-app.html` | Support & app promo |
| `/id/about.html`, `/contact-us.html`, `/cooperation.html`, `/privacy-policy.html`, `/copyright-policy.html`, `/terms.html`, `/eu-amau.html` | Halaman statis |

---

## 4. Contoh pemakaian (curl)

```bash
# 1. Search suggestion ( Andy )
curl -A "Mozilla/5.0 (Linux; Android 10; K) ... Chrome/120.0 Mobile Safari/537.36" \
  "https://m.apkpure.com/id/api/v1/search_suggestion_new?key=minecraft&limit=3"

# 2. Rekomendasi update (butuh cookie login; tanpa login -> error -1)
curl -b "cookies.txt" "https://m.apkpure.com/id/api/v2/app-update-recommend"

# 3. Changelog versi (POST form)
curl -X POST "https://m.apkpure.com/api/www/command-version_more" \
  --data "package=com.whatsapp&vid=<VID>&lang=id"

# 4. Share counter (jsonp)
curl "https://a.apkpure.com/api-shares.json?url=https%3A%2F%2Fm.apkpure.com%2Fid%2F"

# 5. Email auth (butuh cookie login di i.apkpure.com)
curl -X POST -b "cookies.txt" "https://i.apkpure.com/account/api/v2/user_email_auth"

# 6. Load-more listing (pola)
curl "https://m.apkpure.com/id/game-24h?ajax=1&page=2"

# 7. Probe endpoint upload (GET aman, tanpa file)
curl "https://developer.apkpure.com/api/v1/user_upload/apk"
# -> {"commands":{"statusCode":"INCORRECT_PKG",...}}
```

---

## 5. Catatan & batasan scrape

1. **Halaman login terproteksi Cloudflare** (`Just a moment...`) untuk request curl polos, jadi `action` form login/register/reset tidak bisa dibaca statis — polanya didokumentasikan dari `global_v1285.min.js` (`initLoginRegister`, `#cmt-login-form`, `#cmt-register-form`, `window.popupResult`).
2. **`device-1.2.49-min.js` ter-obfuscasi** (string di-XOR/base64) — endpoint pastinya hanya bisa dilihat via DevTools runtime (Network tab), kemungkinan besar mengarah ke `r.cdnpure.com` / `beacon.cdnpure.com`.
3. **Submit-apk memakai modul DT `page_category_ranking`** (bukan modul khusus submit) — terlihat dari `dt_report_s_v1239.js?page=page_category_ranking`.
4. **Form search mobile mengarah ke domain desktop** (`https://apkpure.com/id/search`), sedangkan suggest API tetap di `m.apkpure.com`.
5. Firebase `apiKey`/`vapidKey` di §2.6 #36 adalah **public web key** (normal untuk FCM Web) — bukan kredensial rahasia.
6. Semua klaim "✅ terverifikasi" diuji dengan respons HTTP 200 pada 12 Sep 2026; beberapa endpoint butuh cookie login (`user_email_auth`, `app-update-recommend`, upload) sehingga respons guest berupa JSON error — itu justru membuktikan endpoint-nya hidup.

---

## 6. Update — Scrape ulang halaman download (12 Sep 2026)

Sumber: `https://m.apkpure.com/id/tiktok-app/com.zhiliaoapp.musically/download` (HTTP 200, 412 KB).

### Base URL baru

| Base URL | Fungsi | Bukti |
|---|---|---|
| `https://d.apkpure.com` | **Direct file link** (`/b/APK/...`, `/b/XAPK/...`, `/custom/...`) | `href` tombol `#download_link` |
| `https://data.winudf.com` | CDN file final (redirect 302 + token waktu, tidak bisa di-hotlink mentah) | header `location:` hasil test |

### Pola direct download (terverifikasi)

```
https://d.apkpure.com/b/APK/{package}?version=latest
https://d.apkpure.com/b/APK/{package}?versionCode={vc}&nc={abi}&sv={sdk}
https://d.apkpure.com/b/XAPK/{package}?versionCode={vc}&nc={abi}&sv={sdk}
```

Contoh nyata: `https://d.apkpure.com/b/APK/com.zhiliaoapp.musically?version=latest`
→ 302 → `https://data.winudf.com/APK/Y29tLnpoaWxpYW9hcHA...?filename=TikTok...apk&full_size=465162398&token=...`

Test: request curl polos → 403 Cloudflare; request dengan UA browser + referer
→ 302 ke file. Kesimpulan: pola ini **jalan di browser asli** (dipakai tombol
`#download_link` "Jika unduhan tidak dimulai..." milik APKPure sendiri).
