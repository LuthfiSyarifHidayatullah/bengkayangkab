# Situs Kabupaten Bengkayang (Next.js)

Situs ini membaca berita, halaman, dan kategori **langsung dari API WordPress** (`WP_URL`). Data di-cache 5 menit.

## Menjalankan
```bash
cd site
cp .env.example .env.local     # Windows: copy .env.example .env.local
npm install
npm run dev                    # http://localhost:3000
```

Produksi:
```bash
npm run build
npm start
```

## Halaman
| URL | Isi |
|---|---|
| `/` | Berita utama, berita terbaru, kategori |
| `/berita` | Daftar berita + pencarian (`?q=`) + paginasi |
| `/berita/[slug]` | Detail berita |
| `/kategori/[slug]` | Berita per kategori |
| `/[slug]` | URL lama WordPress (berita atau halaman) |

## Batasan versi ini
Isi masih **bergantung pada WordPress**. Jika WordPress dimatikan, situs ini kosong, dan konten baru masih harus ditulis lewat WordPress. Tahap berikutnya adalah menambahkan Payload CMS dan database sendiri (lihat `../payload-kit`) agar konten baru ditulis di sistem baru.
