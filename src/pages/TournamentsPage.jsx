import { useEffect, useState } from 'react'
import { Trophy, Plus, ChevronRight, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getTournaments, createTournament, updateTournament, deleteTournament } from '../lib/db'
import { getTeams } from '../lib/db'
import TopBar from '../components/shared/TopBar'
import Modal from '../components/shared/Modal'
import EmptyState from '../components/shared/EmptyState'
import toast from 'react-hot-toast'

const FORMATS = ['Knockout','Round Robin','League + Knockout']

export default function TournamentsPage() {
  const { user } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [teams,  setTeams]  = useState([])
  const [modal,  setModal]  = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', format: 'Knockout', teams: [], startDate: '' })

  const load = async () => {
    const [ts, tms] = await Promise.all([getTournaments(user.uid), getTeams(user.uid)])
    setTournaments(ts); setTeams(tms); setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  const toggleTeam = (name) => {
    setForm(f => ({
      ...f,
      teams: f.teams.includes(name) ? f.teams.filter(t=>t!==name) : [...f.teams, name]
    }))
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Tournament name required'); return }
    if (form.teams.length < 2) { toast.error('Select at least 2 teams'); return }
    try {
      await createTournament(user.uid, { ...form, status: 'upcoming', matches: [] })
      toast.success('Tournament created!')
      setModal(false)
      setForm({ name: '', format: 'Knockout', teams: [], startDate: '' })
      load()
    } catch { toast.error('Error creating tournament') }
  }

  const del = async (id) => {
    if (!confirm('Delete tournament?')) return
    await deleteTournament(id); toast.success('Deleted'); load()
  }

  return (
    <div className="page">
      <TopBar title="Tournaments"
        right={
          <button onClick={() => setModal(true)}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-pitch-600 text-white">
            <Plus size={18} strokeWidth={2.5} />
          </button>
        }
      />

      <div className="px-4 space-y-3">
        {loading && <div className="text-center py-12 text-gray-500 text-sm">Loading…</div>}
        {!loading && tournaments.length === 0 && (
          <EmptyState icon={Trophy} title="No tournaments" sub="Create your first tournament"
            action={<button onClick={() => setModal(true)} className="btn-primary max-w-xs">Create Tournament</button>} />
        )}
        {tournaments.map(t => (
          <div key={t.id} className="card-dark rounded-2xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={14} className="text-yellow-400" />
                  <p className="font-semibold text-sm">{t.name}</p>
                </div>
                <p className="text-gray-500 text-xs">{t.format} · {t.teams?.length || 0} teams</p>
                {t.startDate && <p className="text-gray-600 text-xs mt-0.5">Starts {t.startDate}</p>}
                <div className="flex flex-wrap gap-1 mt-2">
                  {(t.teams||[]).map(tm => (
                    <span key={tm} className="text-[10px] px-2 py-0.5 rounded-full text-pitch-300"
                          style={{ background: 'rgba(40,156,107,0.15)' }}>{tm}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => del(t.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500"
                      style={{ background: 'rgba(192,57,43,0.15)' }}>
                <Trash2 size={13} />
              </button>
            </div>
            <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid #1e2f40' }}>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                t.status==='live' ? 'bg-red-900/40 text-red-400' :
                t.status==='completed' ? 'bg-pitch-900/40 text-pitch-400' : 'bg-gray-800 text-gray-400'
              }`}>{t.status}</span>
              <p className="text-gray-600 text-xs">{(t.matches||[]).length} matches played</p>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Tournament">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div>
            <label className="label">Tournament Name</label>
            <input className="input-dark" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Summer Cup 2025" />
          </div>
          <div>
            <label className="label">Format</label>
            <div className="space-y-2 mt-1">
              {FORMATS.map(fmt => (
                <button key={fmt} onClick={() => setForm(f=>({...f,format:fmt}))}
                        className={`w-full text-left py-2.5 px-4 rounded-xl text-sm transition-all ${form.format===fmt ? 'bg-pitch-600 text-white' : 'text-gray-400'}`}
                        style={form.format!==fmt ? { background:'#1e2f40' } : {}}>
                  {fmt}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Start Date (optional)</label>
            <input type="date" className="input-dark" value={form.startDate} onChange={e=>setForm(f=>({...f,startDate:e.target.value}))} />
          </div>
          {teams.length > 0 && (
            <div>
              <label className="label">Teams ({form.teams.length} selected)</label>
              <div className="space-y-2 mt-1">
                {teams.map(t => (
                  <button key={t.id} onClick={() => toggleTeam(t.name)}
                          className={`w-full text-left py-2.5 px-4 rounded-xl text-sm flex items-center justify-between transition-all ${form.teams.includes(t.name) ? 'bg-pitch-900/60 text-pitch-300' : 'text-gray-400'}`}
                          style={{ background: form.teams.includes(t.name) ? 'rgba(22,99,70,0.4)' : '#1e2f40', border: `1px solid ${form.teams.includes(t.name) ? '#289c6b55' : 'transparent'}` }}>
                    {t.name}
                    {form.teams.includes(t.name) && <span className="text-pitch-400">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button onClick={save} className="btn-primary">Create Tournament</button>
        </div>
      </Modal>
    </div>
  )
}
