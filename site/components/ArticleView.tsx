import Link from 'next/link'
import { WPPost, decode, formatDate, postCategories, postImage } from '@/lib/wp'

export default function ArticleView({ post }: { post: WPPost }) {
  const img = postImage(post)
  return (
    <article className="container article">
      <div className="meta">
        {postCategories(post).map((c) => (
          <Link key={c.id} href={`/kategori/${encodeURIComponent(c.slug)}`} className="badge">
            {decode(c.name)}
          </Link>
        ))}
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </div>
      <h1>{decode(post.title.rendered)}</h1>
      {img && <img className="hero" src={img} alt="" />}
      <div className="content" dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
    </article>
  )
}
