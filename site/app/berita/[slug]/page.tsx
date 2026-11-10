import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/components/ArticleView'
import { decode, getPostBySlug, plain, postImage } from '@/lib/wp'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(decodeURIComponent((await params).slug))
  if (!post) return {}
  const img = postImage(post)
  return {
    title: decode(post.title.rendered),
    description: plain(post.excerpt.rendered).slice(0, 160),
    openGraph: { images: img ? [img] : [] },
  }
}

export default async function BeritaDetail({ params }: Props) {
  const post = await getPostBySlug(decodeURIComponent((await params).slug))
  if (!post) notFound()
  return <ArticleView post={post} />
}
