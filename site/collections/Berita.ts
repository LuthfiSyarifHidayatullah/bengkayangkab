import type { CollectionConfig } from 'payload'

export const Berita: CollectionConfig = {
  slug: 'berita',
  labels: { singular: 'Berita', plural: 'Berita' },
  admin: { useAsTitle: 'judul', defaultColumns: ['judul', 'tanggal', 'kategori', '_status'] },
  defaultSort: '-tanggal',
  versions: { drafts: true },
  access: {
    // Publik hanya melihat yang sudah terbit
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  fields: [
    { name: 'judul', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    { name: 'tanggal', type: 'date', required: true, admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'kategori', type: 'relationship', relationTo: 'kategori', hasMany: true, admin: { position: 'sidebar' } },
    { name: 'ringkasan', type: 'textarea' },
    { name: 'gambarUtama', type: 'upload', relationTo: 'media', label: 'Gambar utama' },
    // Dipakai untuk berita hasil migrasi selama gambar masih di WordPress lama
    { name: 'gambarUtamaUrlLama', type: 'text', admin: { position: 'sidebar', readOnly: true } },

    // Konten BARU: ditulis lewat editor rich text
    { name: 'isi', type: 'richText', label: 'Isi berita' },
    // Konten LAMA hasil migrasi: HTML asli dari WordPress (embed TikTok/Facebook dipertahankan)
    {
      name: 'isiHtmlLama',
      type: 'code',
      label: 'Isi (HTML lama dari WordPress)',
      admin: { language: 'html', description: 'Terisi otomatis dari migrasi. Kosongkan jika isi sudah dipindah ke editor di atas.' },
    },

    { name: 'wpId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'urlLama', type: 'text', admin: { position: 'sidebar', readOnly: true } },
  ],
}
