import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, ChevronRight, TrendingUp, Award } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { getMatches } from '../lib/db'
import TopBar from '../components/shared/TopBar'
import EmptyState from '../components/shared/EmptyState'
import { formatOvers, strikeRate, economy } from '../lib/engine'

export default function HistoryPage() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('matches')

  useEffect(() => {
    if (user) getMatches(user.uid).then(m => { setMatches(m); setLoading(false) })
  }, [user])

  const completed = matches.filter(m => m.status === 'completed')

  // Aggregate player stats
  const playerStats = {}
  completed.forEach(m => {
    ;[m.innings?.[0], m.innings?.[1]].filter(Boolean).forEach(inn => {
      ;(inn.batsmen||[]).forEach(b => {
        if (!playerStats[b.name]) playerStats[b.name] = { runs:0, balls:0, fours:0, sixes:0, hs:0, inns:0, wickets:0, overs:0, bowlRuns:0 }
        const p = playerStats[b.name]
        p.runs += b.runs; p.balls += b.balls; p.fours += b.fours; p.sixes += b.sixes
        p.hs = Math.max(p.hs, b.runs); p.inns++
      })
      ;(inn.bowlers||[]).forEach(b => {
        if (!playerStats[b.name]) playerStats[b.name] = { runs:0, balls:0, fours:0, sixes:0, hs:0, inns:0, wickets:0, overs:0, bowlRuns:0 }
        const p = playerStats[b.name]
        p.wickets += b.wickets; p.overs += b.overs; p.bowlRuns += b.runs
      })
    })
  })

  const topBatsmen = Object.entries(playerStats)
    .sort(([,a],[,b]) => b.runs - a.runs).slice(0,10)
  const topBowlers = Object.entries(playerStats)
    .filter(([,p]) => p.wickets > 0)
    .sort(([,a],[,b]) => b.wickets - a.wickets).slice(0,10)

  return (
    <div className="page">
      <TopBar title="History" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 px-4 mb-5">
        {[
          { label: 'Matches', value: matches.length },
          { label: 'Completed', value: completed.length },
          { label: 'Live', value: matches.filter(m=>m.status==='live').length },
        ].map(({ label, value }) => (
          <div key={label} className="card-dark rounded-2xl p-3 text-center">
            <p className="font-display font-bold text-2xl text-pitch-300">{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tab nav */}
      <div className="flex mx-4 mb-4 rounded-xl overflow-hidden" style={{ background:'#131f2b', border:'1px solid #1e2f40' }}>
        {['matches','batting','bowling'].map(t => (
          <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-xs font-medium capitalize transition-all ${tab===t?'text-white':'text-gray-500'}`}
                  style={{ background: tab===t ? '#289c6b' : 'transparent' }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-4">
        {loading && <div className="text-center py-12 text-gray-500 text-sm">Loading…</div>}

        {/* Matches tab */}
        {tab === 'matches' && !loading && (
          <div className="space-y-3">
            {matches.length === 0 && <EmptyState icon={Clock} title="No matches yet" sub="Your match history will appear here" />}
            {matches.map(m => {
              const inn1 = m.innings?.[0]; const inn2 = m.innings?.[1]
              return (
                <button key={m.id} onClick={() => nav(`/matches/${m.id}/scorecard`)}
                        className="card-dark w-full text-left rounded-2xl p-4 flex items-center justify-between active:scale-95 transition-all">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${m.status==='live'?'bg-red-900/40 text-red-400':'bg-gray-800 text-gray-400'}`}>
                        {m.status}
                      </span>
                      <p className="font-semibold text-sm truncate">{m.team1} vs {m.team2}</p>
                    </div>
                    <p className="text-gray-500 text-xs">{m.totalOvers} ov · {m.venue || 'Unknown venue'}</p>
                    {inn1 && <p className="text-gray-400 text-xs mt-1">{inn1.battingTeam}: {inn1.runs}/{inn1.wickets}</p>}
                    {inn2 && <p className="text-gray-400 text-xs">{inn2.battingTeam}: {inn2.runs}/{inn2.wickets}</p>}
                    {m.result && <p className="text-pitch-400 text-xs mt-1 font-medium">{m.result}</p>}
                  </div>
                  <ChevronRight size={16} className="text-gray-600 ml-2 flex-shrink-0" />
                </button>
              )
            })}
          </div>
        )}

        {/* Batting tab */}
        {tab === 'batting' && (
          <div>
            {topBatsmen.length === 0
              ? <EmptyState icon={TrendingUp} title="No batting stats" sub="Complete some matches first" />
              : <div className="card-dark rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom:'1px solid #1e2f40' }}>
                        <th className="text-left text-gray-500 font-medium py-2.5 px-3">Player</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-2">Inn</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-2">Runs</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-2">HS</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-2">4s</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-2">6s</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-3">SR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBatsmen.map(([name, p], i) => (
                        <tr key={name} style={{ borderBottom:'1px solid #1e2f40' }}>
                          <td className="py-2.5 px-3">
                            <span className="text-gray-600 mr-1">{i+1}.</span>
                            <span className="font-medium text-white">{name}</span>
                          </td>
                          <td className="text-right px-2 text-gray-400">{p.inns}</td>
                          <td className="text-right px-2 font-bold text-pitch-300">{p.runs}</td>
                          <td className="text-right px-2 text-gray-300">{p.hs}</td>
                          <td className="text-right px-2 text-gray-400">{p.fours}</td>
                          <td className="text-right px-2 text-gray-400">{p.sixes}</td>
                          <td className="text-right px-3 text-gray-400">{strikeRate(p.runs,p.balls)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}

        {/* Bowling tab */}
        {tab === 'bowling' && (
          <div>
            {topBowlers.length === 0
              ? <EmptyState icon={Award} title="No bowling stats" sub="Complete some matches first" />
              : <div className="card-dark rounded-2xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ borderBottom:'1px solid #1e2f40' }}>
                        <th className="text-left text-gray-500 font-medium py-2.5 px-3">Player</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-2">W</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-2">Ov</th>
                        <th className="text-right text-gray-500 font-medium py-2 px-3">ER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topBowlers.map(([name, p], i) => (
                        <tr key={name} style={{ borderBottom:'1px solid #1e2f40' }}>
                          <td className="py-2.5 px-3">
                            <span className="text-gray-600 mr-1">{i+1}.</span>
                            <span className="font-medium text-white">{name}</span>
                          </td>
                          <td className="text-right px-2 font-bold text-pitch-300">{p.wickets}</td>
                          <td className="text-right px-2 text-gray-400">{p.overs}</td>
                          <td className="text-right px-3 text-gray-400">{p.overs > 0 ? (p.bowlRuns/p.overs).toFixed(1) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
          </div>
        )}
      </div>
    </div>
  )
}
