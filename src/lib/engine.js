// src/lib/engine.js — Pure cricket scoring logic (no React, no Firebase deps)

export const DISMISSALS = ['Bowled','Caught','LBW','Run Out','Stumped','Hit Wicket','Retired Hurt']

export function createInnings(battingTeam, bowlingTeam, totalOvers) {
  return {
    battingTeam, bowlingTeam, totalOvers,
    runs: 0, wickets: 0, balls: 0,
    extras: { wide: 0, noBall: 0, legBye: 0, bye: 0 },
    batsmen: [], bowlers: [],
    activeBat: [-1, -1], striker: 0,
    activeBowler: -1,
    thisOver: [], overHistory: [], ballLog: [], shotData: [],
    complete: false, completedReason: '',
  }
}

export const createBatsman = (name) =>
  ({ name, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, dismissal: '', bowler: '' })

export const createBowler = (name) =>
  ({ name, overs: 0, balls: 0, runs: 0, wickets: 0, maidens: 0, wides: 0, noBalls: 0 })

export const cloneInnings    = (inn) => JSON.parse(JSON.stringify(inn))
export const getStriker      = (inn) => inn.batsmen[inn.activeBat[inn.striker]]
export const getNonStriker   = (inn) => inn.batsmen[inn.activeBat[1 - inn.striker]]
export const getActiveBowler = (inn) => inn.bowlers[inn.activeBowler]

export const strikeRate     = (r, b) => b === 0 ? 0 : +((r / b) * 100).toFixed(1)
export const economy        = (r, b) => b === 0 ? 0 : +((r / (b / 6))).toFixed(2)
export const formatOvers    = (b)    => `${Math.floor(b / 6)}.${b % 6}`
export const currentRunRate = (r, b) => b === 0 ? 0 : +((r / (b / 6))).toFixed(2)
export const requiredRunRate= (n, b) => b <= 0  ? 999 : +((n / (b / 6))).toFixed(2)

export function applyBall(inn, event) {
  const i = cloneInnings(inn)
  const events = []
  const bowler  = getActiveBowler(i)
  const batsman = getStriker(i)
  const { type, runs = 0, dismissal = '' } = event
  let isLegal = true

  switch (type) {
    case 'runs':
      batsman.runs += runs; batsman.balls++
      if (runs === 4) batsman.fours++
      if (runs === 6) batsman.sixes++
      bowler.runs += runs; i.runs += runs
      i.thisOver.push(runs === 0 ? '•' : String(runs))
      i.ballLog.push({ type: 'runs', runs, over: Math.floor(i.balls / 6) })
      recordShot(i, runs)
      if (runs % 2 === 1) i.striker = 1 - i.striker
      break
    case 'wide':
      isLegal = false
      bowler.runs++; bowler.wides++; i.extras.wide++; i.runs++
      i.thisOver.push('Wd')
      i.ballLog.push({ type: 'wide', runs: 1, over: Math.floor(i.balls / 6) })
      break
    case 'noBall':
      isLegal = false
      bowler.runs++; bowler.noBalls++; i.extras.noBall++
      if (runs > 0) { batsman.runs += runs; if (runs===4) batsman.fours++; if (runs===6) batsman.sixes++ }
      i.runs += 1 + runs
      i.thisOver.push('Nb')
      i.ballLog.push({ type: 'noBall', runs: 1 + runs, over: Math.floor(i.balls / 6) })
      break
    case 'legBye':
      batsman.balls++; bowler.runs += runs; i.extras.legBye += runs; i.runs += runs
      i.thisOver.push('Lb'); i.ballLog.push({ type: 'legBye', runs, over: Math.floor(i.balls / 6) })
      if (runs % 2 === 1) i.striker = 1 - i.striker
      break
    case 'bye':
      batsman.balls++; i.extras.bye += runs; i.runs += runs
      i.thisOver.push('By'); i.ballLog.push({ type: 'bye', runs, over: Math.floor(i.balls / 6) })
      if (runs % 2 === 1) i.striker = 1 - i.striker
      break
    case 'wicket':
      batsman.out = true; batsman.balls++; batsman.dismissal = dismissal; batsman.bowler = bowler.name
      if (!['Run Out','Retired Hurt'].includes(dismissal)) bowler.wickets++
      i.wickets++
      i.thisOver.push('W'); i.ballLog.push({ type: 'wicket', dismissal, over: Math.floor(i.balls / 6) })
      events.push('wicket')
      break
    default: break
  }

  if (isLegal) { bowler.balls++; i.balls++ }

  // Over complete
  if (isLegal && i.balls > 0 && i.balls % 6 === 0) {
    const overIdx  = Math.floor(i.balls / 6) - 1
    const overRuns = i.ballLog.filter(b => b.over === overIdx).reduce((a, b) => a + (b.runs || 0), 0)
    if (overRuns === 0 && !i.thisOver.includes('W')) bowler.maidens++
    bowler.overs++
    i.overHistory.push({ runs: overRuns, balls: [...i.thisOver], bowler: bowler.name })
    i.thisOver = []
    if (type !== 'wicket') i.striker = 1 - i.striker
    events.push('overEnd')
  }

  const maxBalls = i.totalOvers * 6
  if (i.wickets >= 10)                   { i.complete = true; i.completedReason = 'allOut';  events.push('inningsEnd') }
  if (i.balls >= maxBalls && !i.complete){ i.complete = true; i.completedReason = 'oversUp'; events.push('inningsEnd') }

  return { innings: i, events }
}

function recordShot(inn, runs) {
  if (runs === 0) return
  inn.shotData.push({ runs, angle: Math.random() * Math.PI * 2, dist: runs >= 6 ? 0.85 : runs === 4 ? 0.75 : 0.25 + Math.random() * 0.4 })
}

export function getResult(inn1, inn2) {
  if (!inn2?.complete) return null
  if (inn2.runs > inn1.runs) return { winner: inn2.battingTeam, margin: 10 - inn2.wickets, type: 'wickets' }
  if (inn2.runs < inn1.runs) return { winner: inn1.battingTeam, margin: inn1.runs - inn2.runs, type: 'runs' }
  return { winner: null, margin: 0, type: 'tie' }
}

export function resultText(result) {
  if (!result) return ''
  if (result.type === 'tie') return 'Match Tied!'
  return `${result.winner} won by ${result.margin} ${result.type}`
}

export function getPlayerOfMatch(inn1, inn2) {
  const allBat  = [...(inn1?.batsmen || []), ...(inn2?.batsmen || [])]
  const allBowl = [...(inn1?.bowlers || []), ...(inn2?.bowlers || [])]
  const topBat  = allBat.reduce((a, b)  => b.runs > a.runs ? b : a,         { runs: -1, name: '' })
  const topBowl = allBowl.reduce((a, b) => b.wickets > a.wickets ? b : a,   { wickets: -1, name: '' })
  return { bat: topBat, bowl: topBowl }
}
