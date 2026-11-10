// Menangani URL lama WordPress yang berada di akar, misalnya /judul-berita/ atau /profil-daerah/.
// Dicari sebagai berita dulu, lalu sebagai halaman. Dengan begitu tautan lama tetap berfungsi.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/components/ArticleView'
import { decode, getPageBySlug, getPostBySlug } from '@/lib/wp'

type Props = { params: Promise<{ slug: string }> }

async function find(slug: string) {
  const post = await getPostBySlug(slug)
  if (post) return { post }
  const page = await getPageBySlug(slug)
  return page ? { page } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await find(decodeURIComponent((await params).slug))
  if (!found) return {}
  return { title: decode((found.post ?? found.page)!.title.rendered) }
}

export default async function LegacyOrPage({ params }: Props) {
  const found = await find(decodeURIComponent((await params).slug))
  if (!found) notFound()
  if (found.post) return <ArticleView post={found.post} />
  const page = found.page!
  return (
    <article className="container article">
      <h1>{decode(page.title.rendered)}</h1>
      <div className="content" dangerouslySetInnerHTML={{ __html: page.content.rendered }} />
    </article>
  )
}
