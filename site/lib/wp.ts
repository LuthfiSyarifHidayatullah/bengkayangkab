// Klien sederhana untuk WordPress REST API.
const WP_URL = (process.env.WP_URL || 'https://bengkayangkab.go.id').replace(/\/$/, '')
const API = `${WP_URL}/wp-json/wp/v2`
const REVALIDATE = 300 // detik; data di-cache 5 menit

export type WPTerm = { id: number; name: string; slug: string }

export type WPPost = {
  id: number
  date: string
  slug: string
  link: string
  title: { rendered: string }
  excerpt: { rendered: string }
  content: { rendered: string }
  categories: number[]
  _embedded?: {
    'wp:featuredmedia'?: { source_url?: string; alt_text?: string }[]
    'wp:term'?: WPTerm[][]
  }
}

export type WPPage = {
  id: number
  slug: string
  title: { rendered: string }
  content: { rendered: string }
}

async function wp<T>(path: string): Promise<{ data: T; totalPages: number; total: number }> {
  const res = await fetch(`${API}/${path}`, {
    next: { revalidate: REVALIDATE },
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    // Halaman di luar jangkauan dikembalikan WP sebagai 400
    if (res.status === 400) return { data: [] as unknown as T, totalPages: 0, total: 0 }
    throw new Error(`WordPress API ${res.status}: ${path}`)
  }
  return {
    data: (await res.json()) as T,
    totalPages: Number(res.headers.get('x-wp-totalpages') || 1),
    total: Number(res.headers.get('x-wp-total') || 0),
  }
}

export async function getPosts(opts: { page?: number; perPage?: number; category?: number; search?: string } = {}) {
  const q = new URLSearchParams({
    _embed: '1',
    page: String(opts.page ?? 1),
    per_page: String(opts.perPage ?? 12),
  })
  if (opts.category) q.set('categories', String(opts.category))
  if (opts.search) q.set('search', opts.search)
  return wp<WPPost[]>(`posts?${q}`)
}

export async function getPostBySlug(slug: string) {
  const { data } = await wp<WPPost[]>(`posts?_embed=1&slug=${encodeURIComponent(slug)}`)
  return data[0] ?? null
}

export async function getPageBySlug(slug: string) {
  const { data } = await wp<WPPage[]>(`pages?slug=${encodeURIComponent(slug)}`)
  return data[0] ?? null
}

export async function getPages() {
  const { data } = await wp<WPPage[]>('pages?per_page=100&orderby=menu_order&order=asc&_fields=id,slug,title')
  return data
}

export async function getCategories() {
  const { data } = await wp<(WPTerm & { count: number })[]>(
    'categories?per_page=100&orderby=count&order=desc&hide_empty=true&_fields=id,name,slug,count',
  )
  return data.filter((c) => c.slug !== 'uncategorized')
}

export async function getCategoryBySlug(slug: string) {
  const { data } = await wp<WPTerm[]>(`categories?slug=${encodeURIComponent(slug)}`)
  return data[0] ?? null
}

// ---------- util tampilan ----------
export function decode(s = ''): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

export const plain = (html = '') => decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

export const postImage = (p: WPPost) => p._embedded?.['wp:featuredmedia']?.[0]?.source_url

export const postCategories = (p: WPPost): WPTerm[] =>
  (p._embedded?.['wp:term']?.[0] ?? []).filter((t) => t.slug !== 'uncategorized')

// slug dari URL (sudah di-decode oleh Next) -> link aman
export const beritaHref = (slug: string) => `/berita/${encodeURIComponent(slug)}`
