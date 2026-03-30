import { useEffect, useState } from 'react'
import { Plus, Users, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getTeams, createTeam, updateTeam, deleteTeam } from '../lib/db'
import TopBar from '../components/shared/TopBar'
import Modal from '../components/shared/Modal'
import EmptyState from '../components/shared/EmptyState'
import toast from 'react-hot-toast'

const DEFAULT_PLAYERS = Array.from({ length: 11 }, (_, i) => `Player ${i + 1}`)

function TeamCard({ team, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card-dark rounded-2xl overflow-hidden">
      <button className="w-full flex items-center justify-between p-4" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-lg"
               style={{ background: team.color || '#1a7d55', color: '#fff' }}>
            {team.name[0]}
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">{team.name}</p>
            <p className="text-gray-500 text-xs">{(team.players || []).length} players</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); onEdit(team) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white"
                  style={{ background: '#1e2f40' }}>
            <Edit2 size={13} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(team.id) }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500"
                  style={{ background: 'rgba(192,57,43,0.15)' }}>
            <Trash2 size={13} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-cricket-border px-4 pb-3 pt-2">
          <div className="grid grid-cols-2 gap-1">
            {(team.players || []).map((p, i) => (
              <p key={i} className="text-gray-400 text-xs py-1">
                <span className="text-gray-600 mr-1">{i + 1}.</span>{p}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TeamsPage() {
  const { user } = useAuth()
  const [teams,   setTeams]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({ name: '', color: '#289c6b', players: [...DEFAULT_PLAYERS] })

  const load = () => getTeams(user.uid).then(setTeams).finally(() => setLoading(false))
  useEffect(() => { if (user) load() }, [user])

  const openNew = () => {
    setEditing(null)
    setForm({ name: '', color: '#289c6b', players: [...DEFAULT_PLAYERS] })
    setModal(true)
  }

  const openEdit = (team) => {
    setEditing(team)
    setForm({ name: team.name, color: team.color || '#289c6b', players: [...(team.players || DEFAULT_PLAYERS)] })
    setModal(true)
  }

  const save = async () => {
    if (!form.name.trim()) { toast.error('Team name required'); return }
    try {
      if (editing) {
        await updateTeam(editing.id, form)
        toast.success('Team updated')
      } else {
        await createTeam(user.uid, form)
        toast.success('Team created')
      }
      setModal(false)
      load()
    } catch (e) { toast.error('Error saving team') }
  }

  const del = async (id) => {
    if (!confirm('Delete this team?')) return
    await deleteTeam(id); toast.success('Deleted'); load()
  }

  const updatePlayer = (i, val) => {
    const p = [...form.players]; p[i] = val; setForm(f => ({ ...f, players: p }))
  }

  const COLORS = ['#289c6b','#c0392b','#e67e22','#2980b9','#8e44ad','#16a085','#d35400','#1a252f']

  return (
    <div className="page">
      <TopBar title="Teams" right={
        <button onClick={openNew}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-pitch-600 text-white">
          <Plus size={18} strokeWidth={2.5} />
        </button>
      } />

      <div className="px-4 py-2 space-y-3">
        {loading && <div className="text-center py-12 text-gray-500 text-sm">Loading...</div>}
        {!loading && teams.length === 0 && (
          <EmptyState icon={Users} title="No teams yet" sub="Create your first team to get started"
            action={<button onClick={openNew} className="btn-primary max-w-xs">Create Team</button>} />
        )}
        {teams.map(t => <TeamCard key={t.id} team={t} onEdit={openEdit} onDelete={del} />)}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Team' : 'New Team'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="label">Team Name</label>
            <input className="input-dark" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Royal Strikers" />
          </div>
          <div>
            <label className="label">Team Color</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                        className="w-8 h-8 rounded-full transition-all"
                        style={{ background: c, outline: form.color === c ? `3px solid white` : 'none', outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div>
            <label className="label">Players (11)</label>
            <div className="space-y-2 mt-1">
              {form.players.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-gray-600 text-xs w-5 text-right">{i + 1}</span>
                  <input className="input-dark flex-1 py-2" value={p} onChange={e => updatePlayer(i, e.target.value)} placeholder={`Player ${i + 1}`} />
                </div>
              ))}
            </div>
          </div>
          <button onClick={save} className="btn-primary mt-2">{editing ? 'Save Changes' : 'Create Team'}</button>
        </div>
      </Modal>
    </div>
  )
}
