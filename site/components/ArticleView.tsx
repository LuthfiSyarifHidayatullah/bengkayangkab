import Link from 'next/link'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Page, Post, formatDate } from '@/lib/data'

function Body({ html, richText }: { html?: string; richText?: any }) {
  if (richText) return <div className="content"><RichText data={richText} /></div>
  return <div className="content" dangerouslySetInnerHTML={{ __html: html || '' }} />
}

export function PageView({ page }: { page: Page }) {
  return (
    <article className="container article">
      <h1>{page.title}</h1>
      <Body html={page.html} richText={page.richText} />
    </article>
  )
}

export default function ArticleView({ post }: { post: Post }) {
  return (
    <article className="container article">
      <div className="meta">
        {post.categories.map((c) => (
          <Link key={c.id} href={`/kategori/${encodeURIComponent(c.slug)}`} className="badge">
            {c.name}
          </Link>
        ))}
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </div>
      <h1>{post.title}</h1>
      {post.image && <img className="hero" src={post.image} alt="" />}
      <Body html={post.html} richText={post.richText} />
    </article>
  )
}
