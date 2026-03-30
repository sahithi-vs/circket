import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'




export default function App() {
  const { user } = useAuth()
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/login"                     element={<LoginPage />} />
        <Route path="/"                          element={<Guard><HomePage /></Guard>} />
        <Route path="/teams"                     element={<Guard><TeamsPage /></Guard>} />
        <Route path="/matches"                   element={<Guard><MatchesPage /></Guard>} />
        <Route path="/matches/new"               element={<Guard><NewMatchPage /></Guard>} />
        <Route path="/matches/:id/score"         element={<Guard><ScoringPage /></Guard>} />
        <Route path="/matches/:id/scorecard"     element={<Guard><ScorecardPage /></Guard>} />
        <Route path="/tournaments"               element={<Guard><TournamentsPage /></Guard>} />
        <Route path="/history"                   element={<Guard><HistoryPage /></Guard>} />
        <Route path="*"                          element={<Navigate to="/" replace />} />
      </Routes>
      {user && <TabBar />}
    </div>
  )
}
