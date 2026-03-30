import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Activity, Users, Trophy, TrendingUp, ChevronRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getMatches } from '../lib/db'
import { formatOvers } from '../lib/engine'

export default function HomePage() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getMatches(user.uid).then(m => { setMatches(m); setLoading(false) }).catch(() => setLoading(false))
  }, [user])

  const liveMatches = matches.filter(m => m.status === 'live')
  const recentMatches = matches.filter(m => m.status === 'completed').slice(0, 3)
  const firstName = user?.displayName?.split(' ')[0] || 'Scorer'

  return (
    <div className="page">
      {/* Header */}
      <div className="px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h1 className="font-display font-bold text-3xl">{firstName}</h1>
          </div>
          <button onClick={logout}
                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-cricket-border">
            {user?.photoURL
              ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full bg-pitch-700 flex items-center justify-center text-sm font-bold">{firstName[0]}</div>
            }
          </button>
        </div>
      </div>

      {/* Quick start */}
      <div className="px-4 mb-6">
        <button onClick={() => nav('/matches/new')}
                className="w-full py-4 rounded-3xl flex items-center justify-center gap-3 font-display font-bold text-xl tracking-wide transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg, #289c6b 0%, #166346 100%)' }}>
          <Plus size={22} strokeWidth={2.5} />
          Start New Match
        </button>
      </div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section className="px-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="font-display font-bold text-lg">Live</h2>
          </div>
          <div className="space-y-3">
            {liveMatches.map(m => (
              <button key={m.id} onClick={() => nav(`/matches/${m.id}/score`)}
                      className="card-dark w-full text-left p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-all">
                <div>
                  <p className="font-semibold text-sm">{m.team1} vs {m.team2}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{m.totalOvers} overs · In progress</p>
                </div>
                <div className="flex items-center gap-2 text-pitch-400">
                  <Activity size={16} />
                  <ChevronRight size={16} />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Stats grid */}
      <section className="px-4 mb-6">
        <h2 className="font-display font-bold text-lg mb-3">Overview</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Matches',     value: matches.length,                          icon: Activity, color: 'text-pitch-400' },
            { label: 'Completed',   value: matches.filter(m=>m.status==='completed').length, icon: Trophy,   color: 'text-yellow-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card-dark rounded-2xl p-4">
              <Icon size={18} className={`${color} mb-2`} />
              <p className="font-display font-bold text-3xl">{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent matches */}
      {recentMatches.length > 0 && (
        <section className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-lg">Recent Matches</h2>
            <button onClick={() => nav('/history')} className="text-pitch-400 text-sm">See all</button>
          </div>
          <div className="space-y-2">
            {recentMatches.map(m => (
              <button key={m.id} onClick={() => nav(`/matches/${m.id}/scorecard`)}
                      className="card-dark w-full text-left p-4 rounded-2xl flex items-center justify-between active:scale-95 transition-all">
                <div>
                  <p className="font-medium text-sm">{m.team1} vs {m.team2}</p>
                  {m.result && <p className="text-pitch-400 text-xs mt-0.5">{m.result}</p>}
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {!loading && matches.length === 0 && (
        <div className="px-4 py-12 text-center">
          <p className="text-6xl mb-4">🏏</p>
          <p className="font-display font-bold text-xl mb-2">No matches yet</p>
          <p className="text-gray-500 text-sm">Start scoring your first match above</p>
        </div>
      )}
    </div>
  )
}
