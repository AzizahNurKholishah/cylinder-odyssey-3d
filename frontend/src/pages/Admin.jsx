import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import { Button, Card, ErrorBox, Feedback, PageHeader, Spinner } from '../components/ui/index.jsx'
import { API, IS_STANDALONE } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'

export default function Admin() {
  const { data, loading, error, reload } = useApi(() => API.adminStudents())
  const [form, setForm] = useState({ student_code: '', full_name: '', class_name: 'VIII' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [query, setQuery] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setMsg(null)
    const code = form.student_code.trim().toUpperCase()
    if (!/^[A-Z0-9]{2,8}-[A-Z0-9]{1,6}$/.test(code)) { setMsg({ ok: false, text: 'Format kode tidak valid. Contoh: SMP8-31.' }); return }
    setSaving(true)
    try {
      const res = await API.adminCreateStudent({ ...form, student_code: code })
      setMsg({ ok: true, text: `Kode ${res.student.student_code} berhasil ditambahkan.` })
      setForm({ student_code: '', full_name: '', class_name: form.class_name })
      reload()
    } catch (err) {
      setMsg({ ok: false, text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const students = (data?.students || []).filter((s) => `${s.student_code} ${s.full_name}`.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="space-y-5">
      <PageHeader icon={Users} eyebrow="Panel Guru" title="Pengelolaan Data Siswa" subtitle="Tambah kode siswa dan pantau progres belajar serta skor literasi." />
      {IS_STANDALONE && (
        <Feedback ok>Mode tanpa server: data progres tersimpan di masing-masing perangkat. Daftar di bawah hanya menampilkan progres siswa yang belajar di perangkat ini, dan kode baru hanya berlaku di perangkat ini.</Feedback>
      )}
      <Card>
        <h2 className="mb-3 font-extrabold text-navy">Tambah Kode Siswa</h2>
        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-4" noValidate>
          <label className="text-sm font-semibold">Kode siswa
            <input value={form.student_code} onChange={(e) => setForm({ ...form, student_code: e.target.value.toUpperCase() })} placeholder="SMP8-31" className="formula mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" required />
          </label>
          <label className="text-sm font-semibold">Nama (opsional)
            <input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="Siswa 31" maxLength={80} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
          <label className="text-sm font-semibold">Kelas
            <input value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} maxLength={20} className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3" />
          </label>
          <div className="flex items-end"><Button type="submit" icon={Plus} loading={saving} className="w-full">Tambah</Button></div>
        </form>
        {msg && <div className="mt-3"><Feedback ok={msg.ok}>{msg.text}</Feedback></div>}
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-extrabold text-navy">Daftar Siswa ({data?.students.length ?? 0})</h2>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kode/nama..." className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm" aria-label="Cari siswa" />
        </div>
        {loading ? <Spinner /> : error ? <ErrorBox message={error} onRetry={reload} /> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr><th className="py-2">Kode</th><th>Nama</th><th>Kelas</th><th className="text-right">XP</th><th className="text-right">Misi</th><th className="text-right">Literasi</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="formula py-2 font-bold">{s.student_code}</td>
                    <td>{s.full_name}</td>
                    <td>{s.class_name}</td>
                    <td className="text-right">{s.total_xp}</td>
                    <td className="text-right">{s.missions_completed}/8</td>
                    <td className="text-right font-semibold">{s.latest_literacy_total !== null ? `${s.latest_literacy_total}/24` : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
