import Link from 'next/link'

export default function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  if (totalPages <= 1) return null
  const sep = basePath.includes('?') ? '&' : '?'
  const href = (p: number) => `${basePath}${sep}page=${p}`
  return (
    <nav className="pagination" aria-label="Halaman">
      {page > 1 && <Link href={href(page - 1)}>← Sebelumnya</Link>}
      <span>
        Halaman {page} dari {totalPages}
      </span>
      {page < totalPages && <Link href={href(page + 1)}>Berikutnya →</Link>}
    </nav>
  )
}
