// src/hooks/useMatch.js — Central scoring state hook

import { useState, useCallback } from 'react'
import {
  createInnings, createBatsman, createBowler,
  applyBall, getStriker, getNonStriker, getActiveBowler,
  getResult, resultText, getPlayerOfMatch,
} from '../lib/engine'

export default function useMatch(matchConfig) {
  const [innings,     setInnings]     = useState([null, null])
  const [innIdx,      setInnIdx]      = useState(0)
  const [undoStack,   setUndoStack]   = useState([])
  const [phase,       setPhase]       = useState('setup')   // setup | innings_init | scoring | new_batsman | new_bowler | result
  const [pendingBowlerChange, setPendingBowlerChange] = useState(false)

  const cur = innings[innIdx]

  // ── Start innings ──────────────────────────────────────────────────────────
  const startInnings = useCallback((bat1, bat2, bowler) => {
    const { teams, players, totalOvers } = matchConfig
    const batTeam  = innIdx === 0 ? matchConfig.battingFirst      : 1 - matchConfig.battingFirst
    const bowlTeam = 1 - batTeam

    const inn = createInnings(teams[batTeam], teams[bowlTeam], totalOvers)
    inn.batsmen      = [createBatsman(players[batTeam][bat1]), createBatsman(players[batTeam][bat2])]
    inn.bowlers      = [createBowler(players[bowlTeam][bowler])]
    inn.activeBat    = [0, 1]
    inn.striker      = 0
    inn.activeBowler = 0

    setInnings(prev => { const n = [...prev]; n[innIdx] = inn; return n })
    setUndoStack([])
    setPhase('scoring')
  }, [innIdx, matchConfig])

  // ── Add new batsman after wicket ──────────────────────────────────────────
  const addNewBatsman = useCallback((playerIdx) => {
    setInnings(prev => {
      const n   = [...prev]
      const inn = { ...n[innIdx] }
      const used = inn.batsmen.map(b => b.name)
      const { players } = matchConfig
      const batTeam = innIdx === 0 ? matchConfig.battingFirst : 1 - matchConfig.battingFirst
      const name = matchConfig.players[batTeam][playerIdx]
      inn.batsmen = [...inn.batsmen, createBatsman(name)]
      const newSlot = inn.batsmen.length - 1
      const outSlot = inn.activeBat.findIndex(s => inn.batsmen[s]?.out)
      inn.activeBat = [...inn.activeBat]
      inn.activeBat[outSlot >= 0 ? outSlot : inn.striker] = newSlot
      n[innIdx] = inn
      return n
    })
    setPhase('scoring')
  }, [innIdx, matchConfig])

  // ── Change bowler ─────────────────────────────────────────────────────────
  const changeBowler = useCallback((playerIdx) => {
    setInnings(prev => {
      const n   = [...prev]
      const inn = { ...n[innIdx] }
      const bowlTeam = innIdx === 0 ? 1 - matchConfig.battingFirst : matchConfig.battingFirst
      const name = matchConfig.players[bowlTeam][playerIdx]
      let bowlerSlot = inn.bowlers.findIndex(b => b.name === name)
      if (bowlerSlot === -1) {
        inn.bowlers = [...inn.bowlers, createBowler(name)]
        bowlerSlot  = inn.bowlers.length - 1
      }
      inn.activeBowler = bowlerSlot
      n[innIdx] = inn
      return n
    })
    setPendingBowlerChange(false)
    setPhase('scoring')
  }, [innIdx, matchConfig])

  // ── Record a ball ─────────────────────────────────────────────────────────
  const recordBall = useCallback((event) => {
    setUndoStack(prev => [...prev.slice(-29), innings[innIdx]])  // keep 30
    const { innings: newInn, events } = applyBall(innings[innIdx], event)
    setInnings(prev => { const n = [...prev]; n[innIdx] = newInn; return n })

    if (events.includes('inningsEnd')) {
      if (innIdx === 0) {
        setInnIdx(1)
        setPhase('innings_init')
      } else {
        setPhase('result')
      }
      return
    }
    if (events.includes('wicket')) { setPhase('new_batsman'); return }
    if (events.includes('overEnd')) { setPhase('new_bowler');  return }
  }, [innings, innIdx])

  // ── Undo ──────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    if (!undoStack.length) return
    const prev = undoStack[undoStack.length - 1]
    setUndoStack(s => s.slice(0, -1))
    setInnings(all => { const n = [...all]; n[innIdx] = prev; return n })
    setPhase('scoring')
  }, [undoStack, innIdx])

  // ── Derived ───────────────────────────────────────────────────────────────
  const inn1   = innings[0]
  const inn2   = innings[1]
  const result = phase === 'result' ? getResult(inn1, inn2) : null
  const target = inn1 ? inn1.runs + 1 : null

  return {
    innings, innIdx, cur, phase, setPhase,
    result, target,
    undoStack,
    startInnings, addNewBatsman, changeBowler, recordBall, undo,
    striker:    cur ? getStriker(cur)      : null,
    nonStriker: cur ? getNonStriker(cur)   : null,
    bowler:     cur ? getActiveBowler(cur) : null,
    playerOfMatch: phase === 'result' ? getPlayerOfMatch(inn1, inn2) : null,
  }
}
