import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/AuthContext'




export default function App() {
  const { user } = useAuth()
  return (
    <div className="app-shell">
      <Routes>
| Feature | Details |
|---|---|
| **Live Scoring** | Ball-by-ball: runs, wickets, wides, no-balls, leg byes, byes |
| **Team Management** | Create teams with 11 players, colours, and custom names |
| **Match Setup** | Toss, overs selector (5/10/20/50), venue, batting order |
| **Scorecard** | Full batting + bowling scorecard for both innings |
| **Analytics** | Wagon wheel, Manhattan (runs/over), Worm chart |
| **Player Stats** | Aggregated batting & bowling stats across all matches |
| **Match History** | All past matches with results |
| **Tournaments** | Create knockout/league tournaments with teams |
| **Auth** | Google Sign-in via Firebase Authentication |
| **Cloud Sync** | All data stored in Firestore, synced across devices |
      </Routes>
      {user && <TabBar />}
    </div>

    ## this is testing
  )
}
