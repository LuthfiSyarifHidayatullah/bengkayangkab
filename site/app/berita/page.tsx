import type { Metadata } from 'next'
import PostCard from '@/components/PostCard'
import Pagination from '@/components/Pagination'
import { getPosts } from '@/lib/wp'

export const metadata: Metadata = { title: 'Berita' }

export default async function BeritaIndex({ searchParams }: { searchParams: Promise<{ page?: string; q?: string }> }) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page) || 1)
  const q = sp.q?.trim() || ''
  const { data: posts, totalPages } = await getPosts({ page, search: q || undefined })

  return (
    <div className="container">
      <h1 className="page-title">{q ? `Hasil pencarian: “${q}”` : 'Berita'}</h1>
      {posts.length === 0 ? (
        <p>Tidak ada berita ditemukan.</p>
      ) : (
        <div className="grid">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} basePath={q ? `/berita?q=${encodeURIComponent(q)}` : '/berita'} />
    </div>
  )
}
