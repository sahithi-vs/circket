import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { RotateCcw, FileText, ChevronRight } from 'lucide-react'
import { getMatch, updateMatch } from '../lib/db'
import { formatOvers, currentRunRate, requiredRunRate, resultText, DISMISSALS } from '../lib/engine'
import useMatch from '../hooks/useMatch'
import Loader from '../components/shared/Loader'
import Modal from '../components/shared/Modal'
import toast from 'react-hot-toast'

// ── Ball chip colours ─────────────────────────────────────────────────────────
function ballStyle(b) {
  if (b === 'W')  return { bg: '#c0392b',               text: '#fff' }
  if (b === 'Wd' || b === 'Nb') return { bg: '#e67e22', text: '#fff' }
  if (b === 'Lb' || b === 'By') return { bg: '#2c3e50', text: '#aaa' }
  if (b === '4')  return { bg: '#2980b9',               text: '#fff' }
  if (b === '6')  return { bg: '#289c6b',               text: '#fff' }
  if (b === '•')  return { bg: '#1e2f40',               text: '#888' }
  return { bg: '#1e2f40', text: '#ccc' }
}

// ── Score button config ───────────────────────────────────────────────────────
const SCORE_BTNS = [
  { label: '0',  event: { type: 'runs', runs: 0 },  bg: '#1e2f40', text: '#888' },
  { label: '1',  event: { type: 'runs', runs: 1 },  bg: '#243b2f', text: '#5dbb8a' },
  { label: '2',  event: { type: 'runs', runs: 2 },  bg: '#243b2f', text: '#5dbb8a' },
  { label: '3',  event: { type: 'runs', runs: 3 },  bg: '#243b2f', text: '#5dbb8a' },
  { label: '4',  event: { type: 'runs', runs: 4 },  bg: '#1a3050', text: '#5aaef0' },
  { label: '6',  event: { type: 'runs', runs: 6 },  bg: '#1a3a2a', text: '#289c6b' },
  { label: 'W',  event: null,                        bg: '#3a1a1a', text: '#e74c3c' },
  { label: 'Wd', event: { type: 'wide' },            bg: '#3a2e1a', text: '#e67e22' },
  { label: 'Nb', event: { type: 'noBall' },          bg: '#3a2e1a', text: '#e67e22' },
  { label: 'Lb', event: { type: 'legBye', runs: 1 }, bg: '#1e2f40', text: '#888' },
  { label: 'B',  event: { type: 'bye', runs: 1 },    bg: '#1e2f40', text: '#888' },
  { label: '↩',  event: 'undo',                      bg: '#1e2f40', text: '#e74c3c' },
]

export default function ScoringPage() {
  const { id } = useParams()
  const nav = useNavigate()
  const [matchData, setMatchData]   = useState(null)
  const [loading,   setLoading]     = useState(true)
  const [dismissal, setDismissal]   = useState(DISMISSALS[0])
  const [wktModal,  setWktModal]    = useState(false)
  const saveTimer = useRef(null)

  // Load match config from Firestore once
  useEffect(() => {
    getMatch(id).then(m => { setMatchData(m); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  const matchConfig = matchData ? {
    teams:        [matchData.team1, matchData.team2],
    players:      [matchData.team1Players || [], matchData.team2Players || []],
    totalOvers:   matchData.totalOvers,
    battingFirst: matchData.battingFirst === matchData.team1 ? 0 : 1,
  } : null

  const {
    innings, innIdx, cur, phase, setPhase,
    result, target,
    startInnings, addNewBatsman, changeBowler, recordBall, undo,
    striker, nonStriker, bowler, playerOfMatch,
    undoStack,
  } = useMatch(matchConfig || { teams: ['',''], players: [[],[]], totalOvers: 20, battingFirst: 0 })

  // Auto-save to Firestore debounced
  useEffect(() => {
    if (!matchData || !cur) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const isComplete = phase === 'result'
      updateMatch(id, {
        innings,
        status: isComplete ? 'completed' : 'live',
        result: isComplete && result ? resultText(result) : null,
      }).catch(() => {})
    }, 1500)
    return () => clearTimeout(saveTimer.current)
  }, [innings, phase])

  if (loading || !matchConfig) return <Loader />

  const batTeam  = innIdx === 0 ? matchConfig.battingFirst : 1 - matchConfig.battingFirst
  const bowlTeam = 1 - batTeam

  // ── Phase: innings init ──────────────────────────────────────────────────
  if (phase === 'setup' || phase === 'innings_init') {
    return <InningsInitModal matchConfig={matchConfig} innIdx={innIdx} batTeam={batTeam} bowlTeam={bowlTeam}
                             onStart={startInnings} innings={innings} />
  }

  // ── Phase: result ────────────────────────────────────────────────────────
  if (phase === 'result') {
    return <ResultScreen result={result} innings={innings} matchConfig={matchConfig}
                         playerOfMatch={playerOfMatch}
                         onScorecard={() => nav(`/matches/${id}/scorecard`)}
                         onHome={() => nav('/')} />
  }

  const inn  = cur
  const overs = formatOvers(inn.balls)
  const crr   = currentRunRate(inn.runs, inn.balls)
  const ballsLeft = inn.totalOvers * 6 - inn.balls
  const needed  = target ? target - inn.runs : null
  const rrr     = (innIdx === 1 && needed !== null) ? requiredRunRate(needed, ballsLeft) : null

  return (
    <div className="page" style={{ paddingBottom: 100 }}>

      {/* ── Scoreboard header ── */}
      <div className="px-4 pt-10 pb-4" style={{ background: '#0d1820' }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-gray-500 text-xs mb-0.5">{inn.battingTeam} · Innings {innIdx + 1}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display font-bold text-5xl">{inn.runs}/{inn.wickets}</span>
            </div>
            <p className="text-gray-400 text-sm mt-0.5">({overs} ov) · CRR {crr}</p>
          </div>
          <div className="text-right">
            {innIdx === 1 && needed !== null && (
              <>
                <p className="text-yellow-400 text-sm font-semibold">Need {needed} off {ballsLeft}b</p>
                <p className="text-gray-500 text-xs">RRR: {rrr}</p>
                <p className="text-gray-600 text-xs">Target: {target}</p>
              </>
            )}
            <div className="flex gap-2 mt-2 justify-end">
              <button onClick={() => nav(`/matches/${id}/scorecard`)}
                      className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-gray-400"
                      style={{ background: '#1e2f40' }}>
                <FileText size={12} /> Card
              </button>
            </div>
          </div>
        </div>

        {/* This over balls */}
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {inn.thisOver.map((b, i) => {
            const s = ballStyle(b)
            return <span key={i} className="ball-chip text-[11px] font-bold" style={{ background: s.bg, color: s.text }}>{b}</span>
          })}
          {inn.thisOver.length === 0 && <span className="text-gray-600 text-xs">Start of over</span>}
        </div>
      </div>

      {/* ── Batsmen ── */}
      <div className="px-4 py-3">
        <div className="card-dark rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2f40' }}>
                <th className="text-left text-xs text-gray-500 font-medium py-2 px-3">Batsman</th>
                <th className="text-right text-xs text-gray-500 font-medium py-2 px-2">R</th>
                <th className="text-right text-xs text-gray-500 font-medium py-2 px-2">B</th>
                <th className="text-right text-xs text-gray-500 font-medium py-2 px-2">4s</th>
                <th className="text-right text-xs text-gray-500 font-medium py-2 px-2">6s</th>
                <th className="text-right text-xs text-gray-500 font-medium py-2 px-3">SR</th>
              </tr>
            </thead>
            <tbody>
              {striker && (
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-sm">
                    {striker.name} <span className="text-pitch-400 text-xs">*</span>
                  </td>
                  <td className="text-right px-2 font-bold text-pitch-300">{striker.runs}</td>
                  <td className="text-right px-2 text-gray-400 text-xs">{striker.balls}</td>
                  <td className="text-right px-2 text-gray-400 text-xs">{striker.fours}</td>
                  <td className="text-right px-2 text-gray-400 text-xs">{striker.sixes}</td>
                  <td className="text-right px-3 text-gray-400 text-xs">{((striker.runs/(striker.balls||1))*100).toFixed(0)}</td>
                </tr>
              )}
              {nonStriker && (
                <tr>
                  <td className="py-2 px-3 text-gray-400 text-sm">{nonStriker.name}</td>
                  <td className="text-right px-2 text-gray-300">{nonStriker.runs}</td>
                  <td className="text-right px-2 text-gray-500 text-xs">{nonStriker.balls}</td>
                  <td className="text-right px-2 text-gray-500 text-xs">{nonStriker.fours}</td>
                  <td className="text-right px-2 text-gray-500 text-xs">{nonStriker.sixes}</td>
                  <td className="text-right px-3 text-gray-500 text-xs">{((nonStriker.runs/(nonStriker.balls||1))*100).toFixed(0)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bowler */}
        {bowler && (
          <div className="card-dark rounded-2xl overflow-hidden mt-2">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e2f40' }}>
                  <th className="text-left text-xs text-gray-500 font-medium py-2 px-3">Bowler</th>
                  <th className="text-right text-xs text-gray-500 font-medium py-2 px-2">O</th>
                  <th className="text-right text-xs text-gray-500 font-medium py-2 px-2">R</th>
                  <th className="text-right text-xs text-gray-500 font-medium py-2 px-2">W</th>
                  <th className="text-right text-xs text-gray-500 font-medium py-2 px-3">ER</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-sm text-pitch-300">{bowler.name}</td>
                  <td className="text-right px-2 text-gray-400 text-xs">{bowler.overs}.{bowler.balls%6}</td>
                  <td className="text-right px-2 text-gray-300">{bowler.runs}</td>
                  <td className="text-right px-2 text-gray-300 font-bold">{bowler.wickets}</td>
                  <td className="text-right px-3 text-gray-400 text-xs">{bowler.balls > 0 ? (bowler.runs/(bowler.balls/6)).toFixed(1) : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Scoring buttons ── */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2.5">
          {SCORE_BTNS.map(({ label, event, bg, text }) => (
            <button key={label}
                    onClick={() => {
                      if (event === 'undo') { undo(); return }
                      if (label === 'W') { setWktModal(true); return }
                      recordBall(event)
                    }}
                    className="score-btn"
                    style={{ background: bg, color: text, fontSize: label === '↩' ? '1.2rem' : '1.5rem' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Wicket modal ── */}
      <Modal open={wktModal} onClose={() => setWktModal(false)} title="Wicket">
        <div className="space-y-4">
          <div>
            <label className="label">Dismissal Type</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {DISMISSALS.map(d => (
                <button key={d} onClick={() => setDismissal(d)}
                        className={`py-2 px-3 rounded-xl text-sm transition-all ${dismissal === d ? 'bg-pitch-600 text-white' : 'text-gray-400'}`}
                        style={dismissal !== d ? { background: '#1e2f40' } : {}}>
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => { recordBall({ type: 'wicket', dismissal }); setWktModal(false) }}
                  className="w-full py-3 rounded-2xl font-bold text-white transition-all active:scale-95"
                  style={{ background: '#c0392b' }}>
            Confirm Wicket
          </button>
        </div>
      </Modal>

      {/* ── New batsman modal ── */}
      {phase === 'new_batsman' && <SelectPlayerModal
        title="New Batsman"
        players={matchConfig.players[batTeam]}
        exclude={inn.batsmen.map(b => b.name)}
        onSelect={addNewBatsman}
      />}

      {/* ── New bowler modal ── */}
      {phase === 'new_bowler' && <SelectPlayerModal
        title="Bowler for Next Over"
        players={matchConfig.players[bowlTeam]}
        exclude={bowler ? [bowler.name] : []}
        bowlers={inn.bowlers}
        onSelect={changeBowler}
      />}
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function InningsInitModal({ matchConfig, innIdx, batTeam, bowlTeam, onStart, innings }) {
  const [bat1,   setBat1]   = useState(0)
  const [bat2,   setBat2]   = useState(1)
  const [bowler, setBowler] = useState(0)

  const batPlayers  = matchConfig.players[batTeam]  || []
  const bowlPlayers = matchConfig.players[bowlTeam] || []

  const handleStart = () => {
    if (bat1 === bat2) { toast.error('Select two different batsmen'); return }
    onStart(bat1, bat2, bowler)
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12" style={{ background: '#0f1923' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm mb-1">Innings {innIdx + 1}</p>
          <h2 className="font-display font-bold text-3xl">{matchConfig.teams[batTeam]} bats</h2>
          {innIdx === 1 && innings[0] && (
            <p className="text-yellow-400 text-sm mt-2">
              Target: {innings[0].runs + 1} runs
            </p>
          )}
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Opening Batsman 1</label>
            <select className="select-dark" value={bat1} onChange={e => setBat1(+e.target.value)}>
              {batPlayers.map((p, i) => <option key={i} value={i}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Opening Batsman 2</label>
            <select className="select-dark" value={bat2} onChange={e => setBat2(+e.target.value)}>
              {batPlayers.map((p, i) => <option key={i} value={i}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Opening Bowler</label>
            <select className="select-dark" value={bowler} onChange={e => setBowler(+e.target.value)}>
              {bowlPlayers.map((p, i) => <option key={i} value={i}>{p}</option>)}
            </select>
          </div>
          <button onClick={handleStart} className="btn-primary mt-4 flex items-center justify-center gap-2">
            Start Innings <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function SelectPlayerModal({ title, players, exclude, bowlers, onSelect }) {
  const [selected, setSelected] = useState(-1)
  const available = players
    .map((name, i) => ({ name, i }))
    .filter(({ name }) => !exclude.includes(name))

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.7)' }}>
      <div className="rounded-t-3xl p-6 pb-10 w-full max-w-md mx-auto" style={{ background: '#131f2b', border: '1px solid #1e2f40' }}>
        <h3 className="font-display font-bold text-xl mb-5">{title}</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {available.map(({ name, i }) => {
            const bwStats = bowlers?.find(b => b.name === name)
            return (
              <button key={i} onClick={() => setSelected(i)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                      style={{ background: selected === i ? '#1a4a35' : '#1e2f40', border: `1px solid ${selected === i ? '#289c6b' : 'transparent'}` }}>
                <span className="font-medium text-sm">{name}</span>
                {bwStats && <span className="text-gray-500 text-xs">{bwStats.overs}ov {bwStats.runs}r {bwStats.wickets}w</span>}
              </button>
            )
          })}
          {available.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No players available</p>}
        </div>
        <button onClick={() => selected !== -1 && onSelect(selected)}
                disabled={selected === -1}
                className="btn-primary disabled:opacity-40">
          Confirm
        </button>
      </div>
    </div>
  )
}

function ResultScreen({ result, innings, matchConfig, playerOfMatch, onScorecard, onHome }) {
  const inn1 = innings[0]
  const inn2 = innings[1]

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#0f1923' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-6xl mb-4">🏆</p>
        <h1 className="font-display font-bold text-4xl mb-2">{resultText(result)}</h1>
        <p className="text-gray-400 text-sm mb-8">{matchConfig.teams[0]} vs {matchConfig.teams[1]}</p>

        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          {[inn1, inn2].filter(Boolean).map((inn, i) => (
            <div key={i} className="card-dark rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-xs mb-1">{inn.battingTeam}</p>
              <p className="font-display font-bold text-3xl">{inn.runs}/{inn.wickets}</p>
              <p className="text-gray-500 text-xs">{formatOvers(inn.balls)} ov</p>
            </div>
          ))}
        </div>

        {playerOfMatch?.bat?.runs > 0 && (
          <div className="card-dark rounded-2xl p-4 w-full mb-6 text-left">
            <p className="text-gray-400 text-xs mb-2">Player of the Match</p>
            <p className="font-semibold">{playerOfMatch.bat.name}</p>
            <p className="text-pitch-400 text-xs mt-1">{playerOfMatch.bat.runs} runs ({playerOfMatch.bat.balls}b)</p>
          </div>
        )}

        <div className="w-full space-y-3">
          <button onClick={onScorecard} className="btn-primary flex items-center justify-center gap-2">
            <FileText size={18} /> Full Scorecard
          </button>
          <button onClick={onHome} className="btn-secondary">Back to Home</button>
        </div>
      </div>
    </div>
  )
}
