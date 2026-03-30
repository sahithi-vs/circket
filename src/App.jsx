import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'
import LoginPage       from './pages/LoginPage'
import HomePage        from './pages/HomePage'
import TeamsPage       from './pages/TeamsPage'
import MatchesPage     from './pages/MatchesPage'
import NewMatchPage    from './pages/NewMatchPage'
import ScoringPage     from './pages/ScoringPage'
import ScorecardPage   from './pages/ScorecardPage'
import TournamentsPage from './pages/TournamentsPage'
import HistoryPage     from './pages/HistoryPage'
import TabBar          from './components/shared/TabBar'
import Loader          from './components/shared/Loader'

##cooments
function Guard({ children }) {
  const { user } = useAuth()
  if (user === undefined) return <Loader />
  return user ? children : <Navigate to="/login" replace />
}

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
