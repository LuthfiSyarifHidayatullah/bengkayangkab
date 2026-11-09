import type { CollectionConfig } from 'payload'

export const Kategori: CollectionConfig = {
  slug: 'kategori',
  labels: { singular: 'Kategori', plural: 'Kategori' },
  admin: { useAsTitle: 'nama', defaultColumns: ['nama', 'slug'] },
  access: { read: () => true },
  fields: [
    { name: 'nama', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    // ID lama di WordPress, dipakai agar impor bisa diulang tanpa duplikat
    { name: 'wpId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
  ],
}
