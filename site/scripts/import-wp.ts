/**
 * Impor hasil ekspor WordPress (migrasi-wp/export/*.json) ke Payload.
 *
 * Jalankan dari folder proyek Payload:
 *   npx payload run scripts/import-wp.ts
 *
 * Opsional: EXPORT_DIR=../migrasi-wp/export  (default)
 * Aman dijalankan ulang: data dicocokkan lewat wpId (update, bukan duplikat).
 */
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getPayload } from 'payload'
import config from '@payload-config'

const EXPORT_DIR = process.env.EXPORT_DIR || '../migrasi-wp/export'

type WP = Record<string, any>

const readJson = async (name: string): Promise<WP[]> => {
  try {
    return JSON.parse(await readFile(join(EXPORT_DIR, name), 'utf8'))
  } catch {
    console.warn(`(lewati) ${name} tidak ditemukan`)
    return []
  }
}

// Judul dari WP berisi entitas HTML seperti &#8211; atau &amp;
const decode = (s = ''): string =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')

const stripTags = (s = ''): string => decode(s.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim()

// date_gmt dari WP tidak memuat zona waktu; tambahkan Z agar benar
const toIso = (p: WP): string => (p.date_gmt ? `${p.date_gmt}Z` : new Date(p.date).toISOString())

async function upsertByWpId(payload: any, collection: string, wpId: number, data: Record<string, any>) {
  const found = await payload.find({ collection, where: { wpId: { equals: wpId } }, limit: 1, depth: 0 })
  if (found.docs[0]) {
    return payload.update({ collection, id: found.docs[0].id, data, depth: 0 })
  }
  return payload.create({ collection, data: { ...data, wpId }, depth: 0 })
}

async function main() {
  const payload = await getPayload({ config })

  const categories = await readJson('categories.json')
  const posts = await readJson('posts.json')
  const pages = await readJson('pages.json')
  const media = await readJson('media.json')

  const mediaUrl = new Map<number, string>(media.map((m) => [m.id, m.source_url]))

  // 1. Kategori
  const catMap = new Map<number, number | string>()
  for (const c of categories) {
    const doc = await upsertByWpId(payload, 'kategori', c.id, { nama: decode(c.name), slug: c.slug })
    catMap.set(c.id, doc.id)
  }
  console.log(`Kategori: ${categories.length}`)

  const redirects: { source: string; destination: string }[] = []
  const pathOf = (link: string) => {
    try {
      return new URL(link).pathname
    } catch {
      return null
    }
  }

  // 2. Berita
  let ok = 0
  const gagal: { id: number; judul: string; error: string }[] = []
  for (const p of posts) {
    try {
      const slug = decodeURIComponent(p.slug)
      await upsertByWpId(payload, 'berita', p.id, {
        judul: decode(p.title?.rendered),
        slug,
        tanggal: toIso(p),
        kategori: (p.categories || []).map((id: number) => catMap.get(id)).filter(Boolean),
        ringkasan: stripTags(p.excerpt?.rendered).slice(0, 500),
        isiHtmlLama: p.content?.rendered || '',
        gambarUtamaUrlLama: p.featured_media ? mediaUrl.get(p.featured_media) || null : null,
        urlLama: p.link,
        _status: p.status === 'publish' ? 'published' : 'draft',
      })
      const from = pathOf(p.link)
      if (from) redirects.push({ source: from, destination: `/berita/${encodeURIComponent(slug)}` })
      ok++
    } catch (e: any) {
      gagal.push({ id: p.id, judul: decode(p.title?.rendered), error: e.message })
    }
    if ((ok + gagal.length) % 50 === 0) console.log(`Berita: ${ok + gagal.length}/${posts.length}`)
  }
  console.log(`Berita: ${ok} berhasil, ${gagal.length} gagal`)

  // 3. Halaman
  let okPage = 0
  for (const p of pages) {
    try {
      const slug = decodeURIComponent(p.slug)
      await upsertByWpId(payload, 'halaman', p.id, {
        judul: decode(p.title?.rendered),
        slug,
        isiHtmlLama: p.content?.rendered || '',
        urlLama: p.link,
        _status: p.status === 'publish' ? 'published' : 'draft',
      })
      const from = pathOf(p.link)
      if (from) redirects.push({ source: from, destination: `/halaman/${encodeURIComponent(slug)}` })
      okPage++
    } catch (e: any) {
      gagal.push({ id: p.id, judul: decode(p.title?.rendered), error: e.message })
    }
  }
  console.log(`Halaman: ${okPage}/${pages.length}`)

  await writeFile('redirects-lama.json', JSON.stringify(redirects, null, 2))
  await writeFile('impor-gagal.json', JSON.stringify(gagal, null, 2))
  console.log(`Redirect dicatat: ${redirects.length} -> redirects-lama.json`)
  console.log(`Gagal: ${gagal.length} -> impor-gagal.json`)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
