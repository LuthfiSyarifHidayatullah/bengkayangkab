import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'
import { getCategories } from '@/lib/wp'

const NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Kabupaten Bengkayang'

export const metadata: Metadata = {
  title: { default: `${NAME} – Situs Resmi Pemerintah`, template: `%s | ${NAME}` },
  description: `Situs resmi pemerintah ${NAME}: berita, informasi, dan layanan publik.`,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let cats: Awaited<ReturnType<typeof getCategories>> = []
  try {
    cats = (await getCategories()).slice(0, 6)
  } catch {
    /* menu tetap tampil walau WordPress sedang tidak bisa dijangkau */
  }
  return (
    <html lang="id">
      <body>
        <header className="site-header">
          <div className="container header-row">
            <Link href="/" className="brand">
              <span className="brand-small">Pemerintah</span>
              <span className="brand-name">{NAME}</span>
            </Link>
            <nav className="nav">
              <Link href="/">Beranda</Link>
              <Link href="/berita">Berita</Link>
              {cats.map((c) => (
                <Link key={c.id} href={`/kategori/${encodeURIComponent(c.slug)}`}>
                  {c.name.replace(/&amp;/g, '&')}
                </Link>
              ))}
            </nav>
            <form action="/berita" className="search">
              <input name="q" type="search" placeholder="Cari berita…" aria-label="Cari berita" />
            </form>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            © {new Date().getFullYear()} Pemerintah {NAME}. Seluruh hak dilindungi.
          </div>
        </footer>
      </body>
    </html>
  )
}
