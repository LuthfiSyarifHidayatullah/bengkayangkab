import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container article">
      <h1>Halaman tidak ditemukan</h1>
      <p>
        Halaman yang Anda cari tidak ada atau sudah dipindahkan. <Link href="/">Kembali ke beranda</Link>.
      </p>
    </div>
  )
}
