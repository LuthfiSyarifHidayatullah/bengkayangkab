// Menangani URL lama WordPress di akar, misalnya /judul-berita/ atau /profil-daerah/.
// Dicari sebagai berita dulu, lalu sebagai halaman, sehingga tautan lama tetap berfungsi.
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView, { PageView } from '@/components/ArticleView'
import { getPageBySlug, getPostBySlug } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

async function find(slug: string) {
  const post = await getPostBySlug(slug)
  if (post) return { post }
  const page = await getPageBySlug(slug)
  return page ? { page } : null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await find(decodeURIComponent((await params).slug))
  return found ? { title: (found.post ?? found.page)!.title } : {}
}

export default async function LegacyOrPage({ params }: Props) {
  const found = await find(decodeURIComponent((await params).slug))
  if (!found) notFound()
  return found.post ? <ArticleView post={found.post} /> : <PageView page={found.page!} />
}
