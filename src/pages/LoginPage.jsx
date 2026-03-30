import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { user, login, error } = useAuth()
  const nav = useNavigate()

  useEffect(() => { if (user) nav('/', { replace: true }) }, [user])

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6"
         style={{ background: 'linear-gradient(160deg, #0f1923 0%, #091420 60%, #0a1f18 100%)' }}>

      {/* Logo area */}
      <div className="mb-12 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5"
             style={{ background: 'linear-gradient(135deg, #289c6b, #166346)' }}>
          <span style={{ fontSize: 38 }}>🏏</span>
        </div>
        <h1 className="font-display font-bold text-5xl tracking-tight text-white mb-2">CricScore</h1>
        <p className="text-gray-400 text-base">Ball-by-ball scoring. Anywhere.</p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {['Live Scoring','Team Management','Match History','Tournaments'].map(f => (
          <span key={f} className="text-xs px-3 py-1 rounded-full text-pitch-300"
                style={{ background: 'rgba(40,156,107,0.15)', border: '1px solid rgba(40,156,107,0.25)' }}>
            {f}
          </span>
        ))}
      </div>

      {/* Login */}
      <div className="w-full max-w-xs space-y-3">
        <button onClick={login}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-white transition-all active:scale-95"
                style={{ background: '#131f2b', border: '1px solid #1e2f40' }}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {error && <p className="text-red-400 text-xs text-center">{error}</p>}

        <p className="text-center text-gray-600 text-xs mt-6">
          Your data is stored securely in Firebase
        </p>
      </div>
    </div>
  )
}
