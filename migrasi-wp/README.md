# Ekspor WordPress bengkayangkab.go.id

## Cara pakai
1. Pasang Node.js 18 atau lebih baru.
2. Di folder ini jalankan:
   ```bash
   node export-wp.mjs
   ```
   Untuk situs lain: `WP_URL=https://contoh.go.id node export-wp.mjs`
3. Hasil ada di folder `export/`:
   - `posts.json`, `pages.json`, dan JSON untuk tiap custom post type
   - `categories.json`, `tags.json`, `users.json`, `media.json`
   - `uploads/`: salinan file media dengan struktur path asli
   - `media-gagal.json`: file yang gagal diunduh (jika ada)

### Hanya teks (tanpa unduh media)
- Mac/Linux: `SKIP_MEDIA=1 node export-wp.mjs`
- Windows CMD: `set SKIP_MEDIA=1 && node export-wp.mjs`
- Windows PowerShell: `$env:SKIP_MEDIA=1; node export-wp.mjs`

Media tetap terdaftar di `media.json`. Unduh filenya nanti, sebelum WordPress dimatikan.

Skrip aman dijalankan ulang. File media yang sudah terunduh dilewati.

## Catatan
- Ruang disk: cek dulu ukuran media di server. Media situs pemerintah bisa mencapai beberapa GB.
- Jika media banyak yang gagal, ambil folder `wp-content/uploads` langsung dari server (FTP/cPanel) dan letakkan di `export/uploads/`.
