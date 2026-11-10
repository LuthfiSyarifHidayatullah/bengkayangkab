import Link from 'next/link'
import { Post, beritaHref, formatDate } from '@/lib/data'

export default function PostCard({ post }: { post: Post }) {
  const cat = post.categories[0]
  return (
    <article className="card">
      <Link href={beritaHref(post.slug)} className="card-img">
        {post.image ? <img src={post.image} alt="" loading="lazy" /> : <div className="noimg">Tanpa gambar</div>}
      </Link>
      <div className="card-body">
        <div className="meta">
          {cat && <span className="badge">{cat.name}</span>}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h3>
          <Link href={beritaHref(post.slug)}>{post.title}</Link>
        </h3>
        <p>{post.excerpt.slice(0, 140)}</p>
      </div>
    </article>
  )
}
