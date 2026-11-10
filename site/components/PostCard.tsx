import Link from 'next/link'
import { WPPost, beritaHref, decode, formatDate, plain, postCategories, postImage } from '@/lib/wp'

export default function PostCard({ post }: { post: WPPost }) {
  const img = postImage(post)
  const cat = postCategories(post)[0]
  return (
    <article className="card">
      <Link href={beritaHref(post.slug)} className="card-img">
        {img ? <img src={img} alt="" loading="lazy" /> : <div className="noimg">Tanpa gambar</div>}
      </Link>
      <div className="card-body">
        <div className="meta">
          {cat && <span className="badge">{decode(cat.name)}</span>}
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </div>
        <h3>
          <Link href={beritaHref(post.slug)}>{decode(post.title.rendered)}</Link>
        </h3>
        <p>{plain(post.excerpt.rendered).slice(0, 140)}</p>
      </div>
    </article>
  )
}
