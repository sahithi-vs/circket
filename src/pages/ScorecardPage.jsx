import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMatch } from '../lib/db'
import { formatOvers, strikeRate, economy } from '../lib/engine'
import TopBar from '../components/shared/TopBar'
import Loader from '../components/shared/Loader'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ScorecardPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [match,  setMatch]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('batting')

  useEffect(() => {
    getMatch(id).then(m => { setMatch(m); setLoading(false) })
  }, [id])

  if (loading) return <Loader />
  if (!match)  return <div className="p-8 text-center text-gray-500">Match not found</div>

  const { innings } = match
  const inn1 = innings?.[0]
  const inn2 = innings?.[1]

  const TABS = ['batting', 'bowling', 'chart']

  return (
    <div className="page">
      <TopBar title="Scorecard" back={-1}
        right={match.status === 'live'
          ? <button onClick={() => nav(`/matches/${id}/score`)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-pitch-600 text-white font-medium">Live</button>
          : null} />

      {/* Innings summaries */}
      {[inn1, inn2].filter(Boolean).map((inn, i) => (
        <div key={i} className="mx-4 mb-3 rounded-2xl px-4 py-3"
             style={{ background: i === 0 ? '#1a3a2a' : '#1a2a3a' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs">{inn.battingTeam}</p>
              <p className="font-display font-bold text-2xl mt-0.5">{inn.runs}/{inn.wickets}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">{formatOvers(inn.balls)} overs</p>
              {inn.extras && (
                <p className="text-gray-500 text-xs mt-0.5">
                  Extras: {Object.values(inn.extras).reduce((a,b)=>a+b,0)}
                </p>
              )}
              {i===1 && inn1 && (
                <p className={`text-xs mt-0.5 font-semibold ${inn.runs > inn1.runs ? 'text-pitch-400' : 'text-red-400'}`}>
                  Target was {inn1.runs+1}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Match result */}
      {match.result && (
        <div className="mx-4 mb-4 py-3 rounded-2xl text-center font-display font-bold text-pitch-400"
             style={{ background: 'rgba(40,156,107,0.1)', border: '1px solid rgba(40,156,107,0.2)' }}>
          {match.result}
        </div>
      )}

      {/* Tab nav */}
      <div className="flex mx-4 mb-4 rounded-xl overflow-hidden" style={{ background: '#131f2b', border: '1px solid #1e2f40' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 text-sm font-medium capitalize transition-all ${tab===t ? 'text-white' : 'text-gray-500'}`}
                  style={{ background: tab===t ? '#289c6b' : 'transparent' }}>
            {t === 'chart' ? 'Charts' : t.charAt(0).toUpperCase()+t.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-4 pb-8">
        {tab === 'batting' && [inn1, inn2].filter(Boolean).map((inn, i) => (
          <div key={i} className="mb-6">
            <p className="font-display font-bold text-base mb-2 text-gray-300">{inn.battingTeam} Batting</p>
            <div className="card-dark rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e2f40' }}>
                    <th className="text-left text-gray-500 font-medium py-2 px-3">Batsman</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">R</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">B</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">4s</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">6s</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-3">SR</th>
                  </tr>
                </thead>
                <tbody>
                  {(inn.batsmen||[]).map((b, j) => (
                    <tr key={j} style={{ borderBottom: '1px solid #1e2f40' }}>
                      <td className="py-2.5 px-3">
                        <p className="font-medium text-white text-xs">{b.name}</p>
                        <p className="text-gray-500 text-[10px]">{b.out ? (b.dismissal || 'out') : 'not out'}{b.bowler && b.out ? ` b ${b.bowler}` : ''}</p>
                      </td>
                      <td className="text-right px-2 font-bold text-pitch-300">{b.runs}</td>
                      <td className="text-right px-2 text-gray-400">{b.balls}</td>
                      <td className="text-right px-2 text-gray-400">{b.fours}</td>
                      <td className="text-right px-2 text-gray-400">{b.sixes}</td>
                      <td className="text-right px-3 text-gray-400">{strikeRate(b.runs,b.balls)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {inn.extras && (
                <div className="px-3 py-2 text-xs text-gray-500" style={{ borderTop: '1px solid #1e2f40' }}>
                  Extras: {Object.values(inn.extras).reduce((a,b)=>a+b,0)}
                  {' '}(Wd {inn.extras.wide} · Nb {inn.extras.noBall} · Lb {inn.extras.legBye} · B {inn.extras.bye})
                </div>
              )}
            </div>
          </div>
        ))}

        {tab === 'bowling' && [inn1, inn2].filter(Boolean).map((inn, i) => (
          <div key={i} className="mb-6">
            <p className="font-display font-bold text-base mb-2 text-gray-300">{inn.bowlingTeam} Bowling</p>
            <div className="card-dark rounded-2xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e2f40' }}>
                    <th className="text-left text-gray-500 font-medium py-2 px-3">Bowler</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">O</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">R</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">W</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-2">Md</th>
                    <th className="text-right text-gray-500 font-medium py-2 px-3">ER</th>
                  </tr>
                </thead>
                <tbody>
                  {(inn.bowlers||[]).map((b, j) => (
                    <tr key={j} style={{ borderBottom: '1px solid #1e2f40' }}>
                      <td className="py-2.5 px-3 font-medium text-white text-xs">{b.name}</td>
                      <td className="text-right px-2 text-gray-400">{b.overs}.{b.balls%6}</td>
                      <td className="text-right px-2 text-gray-300">{b.runs}</td>
                      <td className="text-right px-2 font-bold text-pitch-300">{b.wickets}</td>
                      <td className="text-right px-2 text-gray-400">{b.maidens}</td>
                      <td className="text-right px-3 text-gray-400">{economy(b.runs,b.balls)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {tab === 'chart' && <ChartsTab inn1={inn1} inn2={inn2} match={match} />}
      </div>
    </div>
  )
}

function ChartsTab({ inn1, inn2, match }) {
  const wagonRef = useRef(null)

  // Manhattan data
  const manhattanData = (inn1?.overHistory || []).map((ov, i) => ({
    over: `${i+1}`,
    [match.team1]: ov.runs,
  }))
  const mann2 = (inn2?.overHistory || []).map((ov, i) => ({
    over: `${i+1}`,
    [match.team2]: ov.runs,
  }))

  // Worm data
  const buildWorm = (inn) => {
    if (!inn?.ballLog) return []
    const pts = [{ over: 0, runs: 0 }]
    let total = 0
    inn.ballLog.forEach((b, i) => {
      total += b.runs || 0
      if ((i+1) % 6 === 0) pts.push({ over: Math.floor((i+1)/6), runs: total })
    })
    return pts
  }
  const worm1 = buildWorm(inn1)
  const worm2 = buildWorm(inn2)
  const wormData = Array.from({ length: Math.max(worm1.length, worm2.length) }, (_, i) => ({
    over: i,
    [match.team1]: worm1[i]?.runs ?? null,
    [match.team2]: worm2[i]?.runs ?? null,
  }))

  // Wagon wheel canvas
  useEffect(() => {
    if (!wagonRef.current) return
    const canvas = wagonRef.current
    const ctx = canvas.getContext('2d')
    const W = 200, cx = 100, cy = 100, R = 90
    ctx.clearRect(0,0,W,W)
    // Field
    ctx.fillStyle = '#1a3a1a'; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill()
    ctx.fillStyle = '#1d4422'; ctx.beginPath(); ctx.arc(cx,cy,R*.65,0,Math.PI*2); ctx.fill()
    ctx.fillStyle = '#1f4f26'; ctx.beginPath(); ctx.arc(cx,cy,R*.35,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle='rgba(255,255,255,.08)'; ctx.lineWidth=0.5
    for(let a=0;a<Math.PI*2;a+=Math.PI/4){ ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R); ctx.stroke() }
    ;[R*.35,R*.65,R].forEach(r=>{ ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke() })
    // Shots
    const colMap = { 1:'#5dbb8a', 2:'#5dbb8a', 3:'#3da870', 4:'#5aaef0', 6:'#ffffff' }
    const shots = [...(inn1?.shotData||[]), ...(inn2?.shotData||[])]
    shots.forEach(s => {
      const x = cx+Math.cos(s.angle)*s.dist*R, y=cy+Math.sin(s.angle)*s.dist*R
      ctx.strokeStyle=colMap[s.runs]||'#888'; ctx.lineWidth=1.5
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y); ctx.stroke()
      ctx.fillStyle=colMap[s.runs]||'#888'; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill()
    })
    ctx.fillStyle='rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(cx,cy,4,0,Math.PI*2); ctx.fill()
  }, [inn1, inn2])

  const tooltip = { contentStyle: { background:'#131f2b', border:'1px solid #1e2f40', borderRadius:8, fontSize:12 }, labelStyle:{color:'#888'} }

  return (
    <div className="space-y-6">
      {/* Wagon wheel */}
      <div>
        <p className="font-display font-bold text-base text-gray-300 mb-3">Wagon Wheel</p>
        <div className="flex justify-center">
          <canvas ref={wagonRef} width={200} height={200} className="rounded-full" />
        </div>
        <div className="flex justify-center gap-4 mt-3">
          {[['1-3','#5dbb8a'],['4','#5aaef0'],['6','#fff']].map(([l,c])=>(
            <span key={l} className="flex items-center gap-1 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full inline-block" style={{background:c}} />{l}
            </span>
          ))}
        </div>
      </div>

      {/* Manhattan */}
      {manhattanData.length > 0 && (
        <div>
          <p className="font-display font-bold text-base text-gray-300 mb-3">Manhattan — Runs per Over</p>
          <div className="card-dark rounded-2xl p-4">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={manhattanData} margin={{top:4,right:4,bottom:0,left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2f40" vertical={false} />
                <XAxis dataKey="over" tick={{ fontSize:10, fill:'#666' }} />
                <YAxis tick={{ fontSize:10, fill:'#666' }} />
                <Tooltip {...tooltip} />
                <Bar dataKey={match.team1} fill="#289c6b" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Worm */}
      {worm1.length > 1 && (
        <div>
          <p className="font-display font-bold text-base text-gray-300 mb-3">Worm — Cumulative Runs</p>
          <div className="card-dark rounded-2xl p-4">
            <div className="flex gap-4 mb-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-6 h-0.5 inline-block bg-pitch-500" />{match.team1}</span>
              {worm2.length > 1 && <span className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-6 h-0.5 inline-block bg-blue-400" />{match.team2}</span>}
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={wormData} margin={{top:4,right:4,bottom:0,left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2f40" vertical={false} />
                <XAxis dataKey="over" tick={{ fontSize:10, fill:'#666' }} label={{ value:'Overs', position:'insideBottom', offset:-2, fill:'#444', fontSize:10 }} />
                <YAxis tick={{ fontSize:10, fill:'#666' }} />
                <Tooltip {...tooltip} />
                <Line type="monotone" dataKey={match.team1} stroke="#289c6b" strokeWidth={2} dot={false} connectNulls />
                {worm2.length > 1 && <Line type="monotone" dataKey={match.team2} stroke="#5aaef0" strokeWidth={2} dot={false} connectNulls />}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
