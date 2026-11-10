import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media' },
  access: { read: () => true },
  upload: {
    // File disimpan di folder ini (di luar kode). Pastikan ikut di-backup.
    staticDir: process.env.MEDIA_DIR || 'media',
    mimeTypes: ['image/*', 'application/pdf'],
  },
  fields: [
    { name: 'alt', type: 'text', label: 'Teks alternatif' },
    // Tahap 1: media lama masih dilayani WordPress. Isi URL lama di sini.
    { name: 'urlLama', type: 'text', admin: { position: 'sidebar', readOnly: true } },
    { name: 'wpId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
  ],
}
