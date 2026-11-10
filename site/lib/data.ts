// Lapisan data: membaca langsung dari database lewat Payload Local API (bukan WordPress).
import config from '@payload-config'
import { getPayload } from 'payload'

export type Cat = { id: number; name: string; slug: string; count?: number }

export type Post = {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  image?: string
  categories: Cat[]
  html?: string // konten lama hasil migrasi WordPress
  richText?: any // konten baru dari editor admin (Lexical)
}

export type Page = { id: number; slug: string; title: string; html?: string; richText?: any }

const db = () => getPayload({ config })

function toPost(d: any): Post {
  const cats = (Array.isArray(d.kategori) ? d.kategori : []).filter((c: any) => c && typeof c === 'object')
  const gambar = d.gambarUtama && typeof d.gambarUtama === 'object' ? d.gambarUtama.url : undefined
  return {
    id: d.id,
    slug: d.slug,
    title: d.judul,
    excerpt: d.ringkasan || '',
    date: d.tanggal,
    image: gambar || d.gambarUtamaUrlLama || undefined,
    categories: cats.map((c: any) => ({ id: c.id, name: c.nama, slug: c.slug })),
    html: d.isiHtmlLama || undefined,
    richText: d.isi || undefined,
  }
}

const published = { _status: { equals: 'published' } }

export async function getPosts(opts: { page?: number; perPage?: number; category?: number; search?: string } = {}) {
  const payload = await db()
  const and: any[] = [published]
  if (opts.category) and.push({ kategori: { equals: opts.category } })
  if (opts.search) and.push({ or: [{ judul: { like: opts.search } }, { ringkasan: { like: opts.search } }] })
  const res = await payload.find({
    collection: 'berita',
    where: { and },
    sort: '-tanggal',
    page: opts.page ?? 1,
    limit: opts.perPage ?? 12,
    depth: 1,
  })
  return { data: res.docs.map(toPost), totalPages: res.totalPages, total: res.totalDocs }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const payload = await db()
  const res = await payload.find({
    collection: 'berita',
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  return res.docs[0] ? toPost(res.docs[0]) : null
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const payload = await db()
  const res = await payload.find({
    collection: 'halaman',
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 0,
  })
  const d: any = res.docs[0]
  return d ? { id: d.id, slug: d.slug, title: d.judul, html: d.isiHtmlLama || undefined, richText: d.isi || undefined } : null
}

export async function getCategories(): Promise<Cat[]> {
  const payload = await db()
  const res = await payload.find({ collection: 'kategori', limit: 100, sort: 'nama', depth: 0 })
  const cats = res.docs.map((c: any) => ({ id: c.id, name: c.nama, slug: c.slug }) as Cat)
  // hitung jumlah berita per kategori
  const withCount = await Promise.all(
    cats.map(async (c) => {
      const r = await payload.count({ collection: 'berita', where: { and: [published, { kategori: { equals: c.id } }] } })
      return { ...c, count: r.totalDocs }
    }),
  )
  return withCount.filter((c) => c.count > 0 && c.slug !== 'uncategorized').sort((a, b) => b.count - a.count)
}

export async function getCategoryBySlug(slug: string): Promise<Cat | null> {
  const payload = await db()
  const res = await payload.find({ collection: 'kategori', where: { slug: { equals: slug } }, limit: 1, depth: 0 })
  const c: any = res.docs[0]
  return c ? { id: c.id, name: c.nama, slug: c.slug } : null
}

// ---------- util tampilan ----------
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export const beritaHref = (slug: string) => `/berita/${encodeURIComponent(slug)}`
