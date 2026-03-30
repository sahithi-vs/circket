import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, Shuffle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getTeams, createMatch } from '../lib/db'
import TopBar from '../components/shared/TopBar'
import toast from 'react-hot-toast'

const OVERS_OPTIONS = [5, 6, 10, 15, 20, 25, 30, 40, 50]

export default function NewMatchPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [teams,  setTeams]  = useState([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    team1: '', team2: '',
    totalOvers: 20,
    tossWon: '',     // team name
    elected: 'bat', // bat | field
    venue: '',
  })

  useEffect(() => {
    if (user) getTeams(user.uid).then(setTeams)
  }, [user])

  const randomToss = () => {
    if (!form.team1 || !form.team2) { toast.error('Select both teams first'); return }
    const winner = Math.random() < 0.5 ? form.team1 : form.team2
    setForm(f => ({ ...f, tossWon: winner }))
    toast(`${winner} won the toss!`, { icon: '🪙' })
  }

  const battingFirst = () => {
    if (!form.tossWon) return ''
    return form.elected === 'bat' ? form.tossWon
      : (form.tossWon === form.team1 ? form.team2 : form.team1)
  }

  const handleCreate = async () => {
    if (!form.team1 || !form.team2)  { toast.error('Select both teams'); return }
    if (form.team1 === form.team2)   { toast.error('Teams must be different'); return }
    if (!form.tossWon)               { toast.error('Select toss winner'); return }

    setSaving(true)
    try {
      const t1Data = teams.find(t => t.name === form.team1)
      const t2Data = teams.find(t => t.name === form.team2)
      const bf     = battingFirst()

      const matchData = {
        team1: form.team1, team2: form.team2,
        team1Players: t1Data?.players || Array.from({length:11},(_,i)=>`Player ${i+1}`),
        team2Players: t2Data?.players || Array.from({length:11},(_,i)=>`Player ${i+1}`),
        totalOvers: form.totalOvers,
        tossWon: form.tossWon,
        elected: form.elected,
        battingFirst: bf,
        venue: form.venue,
        innings: [null, null],
        status: 'live',
      }
      const ref = await createMatch(user.uid, matchData)
      nav(`/matches/${ref.id}/score`)
    } catch (e) {
      toast.error('Error creating match')
    } finally {
      setSaving(false)
    }
  }

  const teamOptions = teams.length > 0 ? teams.map(t => t.name)
    : ['Team A', 'Team B', 'Team C'] // fallback if no teams saved yet

  return (
    <div className="page">
      <TopBar title="New Match" back="/matches" />

      <div className="px-4 py-4 space-y-4">
        {/* Teams */}
        <div className="card-dark rounded-2xl p-4 space-y-3">
          <p className="font-display font-bold text-base text-gray-300">Teams</p>
          <div>
            <label className="label">Team 1</label>
            {teams.length > 0
              ? <select className="select-dark" value={form.team1} onChange={e => setForm(f => ({ ...f, team1: e.target.value, tossWon: '' }))}>
                  <option value="">Select team…</option>
                  {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              : <input className="input-dark" placeholder="Team 1 name" value={form.team1} onChange={e => setForm(f => ({ ...f, team1: e.target.value }))} />
            }
          </div>
          <div>
            <label className="label">Team 2</label>
            {teams.length > 0
              ? <select className="select-dark" value={form.team2} onChange={e => setForm(f => ({ ...f, team2: e.target.value, tossWon: '' }))}>
                  <option value="">Select team…</option>
                  {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              : <input className="input-dark" placeholder="Team 2 name" value={form.team2} onChange={e => setForm(f => ({ ...f, team2: e.target.value }))} />
            }
          </div>
        </div>

        {/* Match config */}
        <div className="card-dark rounded-2xl p-4 space-y-3">
          <p className="font-display font-bold text-base text-gray-300">Match Config</p>
          <div>
            <label className="label">Overs</label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {OVERS_OPTIONS.map(o => (
                <button key={o} onClick={() => setForm(f => ({ ...f, totalOvers: o }))}
                        className={`py-2 rounded-xl text-sm font-bold transition-all ${form.totalOvers === o ? 'bg-pitch-600 text-white' : 'text-gray-400'}`}
                        style={form.totalOvers !== o ? { background: '#1e2f40' } : {}}>
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Venue (optional)</label>
            <input className="input-dark" value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))} placeholder="e.g. Eden Gardens" />
          </div>
        </div>

        {/* Toss */}
        <div className="card-dark rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display font-bold text-base text-gray-300">Toss</p>
            <button onClick={randomToss}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-pitch-300"
                    style={{ background: 'rgba(40,156,107,0.15)' }}>
              <Shuffle size={12} /> Random
            </button>
          </div>
          <div>
            <label className="label">Toss Won By</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[form.team1 || 'Team 1', form.team2 || 'Team 2'].filter(Boolean).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, tossWon: t }))}
                        className={`py-2.5 rounded-xl text-sm font-medium transition-all ${form.tossWon === t ? 'bg-pitch-600 text-white' : 'text-gray-400'}`}
                        style={form.tossWon !== t ? { background: '#1e2f40' } : {}}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Elected To</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {['bat','field'].map(e => (
                <button key={e} onClick={() => setForm(f => ({ ...f, elected: e }))}
                        className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${form.elected === e ? 'bg-pitch-600 text-white' : 'text-gray-400'}`}
                        style={form.elected !== e ? { background: '#1e2f40' } : {}}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          {form.tossWon && (
            <p className="text-pitch-400 text-xs text-center py-1">
              🏏 {battingFirst()} will bat first
            </p>
          )}
        </div>

        <button onClick={handleCreate} disabled={saving}
                className="btn-primary flex items-center justify-center gap-2">
          {saving ? 'Creating…' : 'Start Match'}
          {!saving && <ChevronRight size={18} />}
        </button>
      </div>
    </div>
  )
}
