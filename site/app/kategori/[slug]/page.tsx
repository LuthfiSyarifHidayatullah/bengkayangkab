import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { decode, getCategoryBySlug, getPosts } from '@/lib/wp'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const cat = await getCategoryBySlug(decodeURIComponent((await params).slug))
  return { title: cat ? decode(cat.name) : 'Kategori' }
}

export default async function KategoriPage({ params, searchParams }: Props) {
  const slug = decodeURIComponent((await params).slug)
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const cat = await getCategoryBySlug(slug)
  if (!cat) notFound()
  const { data: posts, totalPages } = await getPosts({ page, category: cat.id })

  return (
    <div className="container">
      <h1 className="page-title">{decode(cat.name)}</h1>
      <div className="grid">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} basePath={`/kategori/${encodeURIComponent(slug)}`} />
    </div>
  )
}
