import { Tubi } from '../components/Brand.jsx'
import { Button } from '../components/ui/index.jsx'

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-paper px-4 text-center">
      <div>
        <Tubi className="mx-auto size-24" mood="wow" />
        <h1 className="mt-3 text-3xl font-black text-navy">Wah, jalannya buntu!</h1>
        <p className="mt-1 text-slate-600">Halaman yang kamu cari tidak ditemukan.</p>
        <Button to="/" className="mt-5">Kembali ke Beranda</Button>
      </div>
    </div>
  )
}
