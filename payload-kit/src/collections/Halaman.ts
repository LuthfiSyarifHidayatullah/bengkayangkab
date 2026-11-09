import type { CollectionConfig } from 'payload'

export const Halaman: CollectionConfig = {
  slug: 'halaman',
  labels: { singular: 'Halaman', plural: 'Halaman' },
  admin: { useAsTitle: 'judul', defaultColumns: ['judul', 'slug', '_status'] },
  versions: { drafts: true },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
  },
  fields: [
    { name: 'judul', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, admin: { position: 'sidebar' } },
    { name: 'isi', type: 'richText', label: 'Isi halaman' },
    {
      name: 'isiHtmlLama',
      type: 'code',
      label: 'Isi (HTML lama dari WordPress)',
      admin: { language: 'html' },
    },
    { name: 'wpId', type: 'number', unique: true, index: true, admin: { position: 'sidebar', readOnly: true } },
    { name: 'urlLama', type: 'text', admin: { position: 'sidebar', readOnly: true } },
  ],
}
