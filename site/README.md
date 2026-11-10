# Situs + Admin Panel Kabupaten Bengkayang

Satu aplikasi Next.js dengan Payload CMS dan PostgreSQL.
- **Situs publik**: `/`, `/berita`, `/berita/[slug]`, `/kategori/[slug]`, dan `/[slug]` (URL lama WordPress).
- **Admin panel**: `/admin`. Tambah, ubah, dan hapus berita, halaman, kategori, dan upload foto/PDF, tanpa WordPress.

## 1. Persiapan
Butuh Node.js 22.23.4+ dan Docker (untuk PostgreSQL).
```bash
cd site
docker compose up -d                     # menyalakan PostgreSQL
copy .env.example .env                   # Mac/Linux: cp
# edit .env: ganti PAYLOAD_SECRET dengan string acak panjang
npm install
```

## 2. Jalankan
```bash
npm run dev
```
- Admin: http://localhost:3000/admin. Saat pertama dibuka, Anda diminta membuat **akun admin pertama**.
- Situs: http://localhost:3000

Jika admin menampilkan error "importMap", jalankan `npm run generate:importmap` lalu ulangi `npm run dev`.

## 3. Impor data WordPress lama
```bash
# di folder ../migrasi-wp (sekali saja)
set SKIP_MEDIA=1 && node export-wp.mjs
# lalu di folder site
npm run import:wp
```
Aman diulang, tidak membuat data ganda. Gambar lama sementara masih memakai alamat WordPress lama (lihat bagian media di README utama).

## Menulis berita baru
Admin → **Berita** → **Create New** → isi judul, slug, tanggal, kategori, gambar utama, dan isi berita → **Publish**. Berita langsung muncul di situs.
