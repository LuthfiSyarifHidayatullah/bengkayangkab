import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/components/ArticleView'
import { getPostBySlug } from '@/lib/data'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(decodeURIComponent((await params).slug))
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt.slice(0, 160),
    openGraph: { images: post.image ? [post.image] : [] },
  }
}

export default async function BeritaDetail({ params }: Props) {
  const post = await getPostBySlug(decodeURIComponent((await params).slug))
  if (!post) notFound()
  return <ArticleView post={post} />
}
