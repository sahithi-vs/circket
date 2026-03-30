// src/lib/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth'
import { auth, provider } from './firebase'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(undefined) // undefined = loading
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u ?? null))
    return unsub
  }, [])

  const login  = async () => { try { setError(null); await signInWithPopup(auth, provider) } catch(e) { setError(e.message) } }
  const logout = () => signOut(auth)

  return <Ctx.Provider value={{ user, login, logout, error }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
