# Payload Kit: bagian khusus bengkayangkab.go.id

Folder ini berisi file yang ditambahkan ke proyek Payload hasil `create-payload-app` (template **blank**, database **PostgreSQL**).

## Pasang ke proyek Payload
Dari root repositori, setelah proyek Payload dibuat (misal di folder `web/`):

```bash
cp -r payload-kit/src/collections/*  web/src/collections/
cp -r payload-kit/scripts            web/scripts
```

Lalu edit `web/src/payload.config.ts`:

```ts
import { Berita } from './collections/Berita'
import { Halaman } from './collections/Halaman'
import { Kategori } from './collections/Kategori'
import { Media } from './collections/Media'

// ...di dalam buildConfig:
collections: [Users, Berita, Halaman, Kategori, Media],
```
(Hapus `Media` bawaan template jika ada, agar tidak dobel.)

## Impor data WordPress
```bash
cd web
npx payload run scripts/import-wp.ts
```
Hasil: `redirects-lama.json` (peta URL lama ke baru) dan `impor-gagal.json` (jika ada yang gagal).
