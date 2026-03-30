// src/lib/db.js — Firestore CRUD helpers

import {
  collection, doc, addDoc, updateDoc, getDoc, getDocs,
  query, where, orderBy, serverTimestamp, deleteDoc,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Teams ────────────────────────────────────────────────────────────────────
export const createTeam  = (uid, data) =>
  addDoc(collection(db, 'teams'), { ...data, uid, createdAt: serverTimestamp() })

export const getTeams = async (uid) => {
  const q = query(collection(db, 'teams'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateTeam = (id, data) => updateDoc(doc(db, 'teams', id), data)
export const deleteTeam = (id)       => deleteDoc(doc(db, 'teams', id))

// ── Matches ──────────────────────────────────────────────────────────────────
export const createMatch = (uid, data) =>
  addDoc(collection(db, 'matches'), { ...data, uid, status: 'live', createdAt: serverTimestamp() })

export const getMatches = async (uid) => {
  const q = query(collection(db, 'matches'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const getMatch  = async (id) => {
  const snap = await getDoc(doc(db, 'matches', id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export const updateMatch = (id, data) => updateDoc(doc(db, 'matches', id), data)

// ── Tournaments ──────────────────────────────────────────────────────────────
export const createTournament = (uid, data) =>
  addDoc(collection(db, 'tournaments'), { ...data, uid, createdAt: serverTimestamp() })

export const getTournaments = async (uid) => {
  const q = query(collection(db, 'tournaments'), where('uid', '==', uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const updateTournament = (id, data) => updateDoc(doc(db, 'tournaments', id), data)
export const deleteTournament = (id)       => deleteDoc(doc(db, 'tournaments', id))
