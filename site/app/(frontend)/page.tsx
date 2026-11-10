import Link from 'next/link'
import PostCard from '@/components/PostCard'
import { beritaHref, formatDate, getCategories, getPosts } from '@/lib/data'

export default async function Home() {
  const [{ data: posts }, cats] = await Promise.all([getPosts({ perPage: 10 }), getCategories().catch(() => [])])
  const [hero, ...rest] = posts

  return (
    <>
      <section className="container hero-section">
        {hero ? (
          <Link href={beritaHref(hero.slug)} className="hero-card">
            {hero.image && <img src={hero.image} alt="" />}
            <div className="hero-text">
              <time dateTime={hero.date}>{formatDate(hero.date)}</time>
              <h1>{hero.title}</h1>
              <p>{hero.excerpt.slice(0, 180)}</p>
            </div>
          </Link>
        ) : (
          <p>Belum ada berita. Tambahkan lewat <Link href="/admin">panel admin</Link>.</p>
        )}
      </section>

      <section className="container">
        <div className="section-head">
          <h2>Berita Terbaru</h2>
          <Link href="/berita">Lihat semua →</Link>
        </div>
        <div className="grid">
          {rest.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>

      {cats.length > 0 && (
        <section className="container">
          <div className="section-head">
            <h2>Kategori</h2>
          </div>
          <div className="chips">
            {cats.map((c) => (
              <Link key={c.id} href={`/kategori/${encodeURIComponent(c.slug)}`} className="chip">
                {c.name} <small>{c.count}</small>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
