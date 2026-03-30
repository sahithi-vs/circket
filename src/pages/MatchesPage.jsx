import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Activity, ChevronRight, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getMatches } from '../lib/db'
import TopBar from '../components/shared/TopBar'
import EmptyState from '../components/shared/EmptyState'
import { formatOvers } from '../lib/engine'

export default function MatchesPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    if (user) getMatches(user.uid).then(m => { setMatches(m); setLoading(false) })
  }, [user])

  const filtered = matches.filter(m => filter === 'all' || m.status === filter)

  return (
    <div className="page">
      <TopBar title="Matches"
        right={
          <button onClick={() => nav('/matches/new')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-pitch-600 text-white">
            <Plus size={18} strokeWidth={2.5} />
          </button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 mb-4">
        {['all','live','completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${filter===f ? 'bg-pitch-600 text-white' : 'text-gray-500'}`}
                  style={filter!==f ? { background:'#1e2f40' } : {}}>
            {f}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {loading && <div className="text-center py-12 text-gray-500 text-sm">Loading…</div>}

        {!loading && filtered.length === 0 && (
          <EmptyState icon={Activity} title="No matches" sub={filter==='all' ? 'Start your first match' : `No ${filter} matches`}
            action={filter==='all' && <button onClick={() => nav('/matches/new')} className="btn-primary max-w-xs">New Match</button>} />
        )}

        {filtered.map(m => {
          const inn1 = m.innings?.[0]
          const inn2 = m.innings?.[1]
          return (
            <button key={m.id}
                    onClick={() => nav(m.status==='live' ? `/matches/${m.id}/score` : `/matches/${m.id}/scorecard`)}
                    className="card-dark w-full text-left rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-all">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {m.status === 'live'
                    ? <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    : <CheckCircle size={12} className="text-pitch-400" />
                  }
                  <p className="font-semibold text-sm truncate">{m.team1} vs {m.team2}</p>
                </div>
                <p className="text-gray-500 text-xs">{m.totalOvers} ov · {m.venue || 'No venue'}</p>
                {inn1 && (
                  <p className="text-gray-400 text-xs mt-1">
                    {inn1.battingTeam}: {inn1.runs}/{inn1.wickets} ({formatOvers(inn1.balls)})
                    {inn2 && ` · ${inn2.battingTeam}: ${inn2.runs}/${inn2.wickets} (${formatOvers(inn2.balls)})`}
                  </p>
                )}
                {m.result && <p className="text-pitch-400 text-xs mt-0.5">{m.result}</p>}
              </div>
              <ChevronRight size={16} className="text-gray-600 ml-2 flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
