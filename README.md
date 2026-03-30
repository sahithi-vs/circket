# 🏏 CricScore

A mobile-first cricket scoring app built with React + Firebase — inspired by CricHeroes.

---

## Features

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

---

## Tech Stack

- **React 18** + **React Router v6**
- **Tailwind CSS** (dark mobile-first design)
- **Firebase** (Auth + Firestore)
- **Recharts** (Manhattan + Worm charts)
- **Canvas API** (Wagon Wheel)
- **Framer Motion** (animations)
- **Vite** (build tool)

---

## Project Structure

```
src/
├── lib/
│   ├── firebase.js        ← Firebase config (fill in YOUR values)
│   ├── db.js              ← Firestore CRUD helpers
│   ├── engine.js          ← Pure cricket scoring logic (no React deps)
│   └── AuthContext.jsx    ← Auth provider + useAuth hook
│
├── hooks/
│   └── useMatch.js        ← Central scoring state (wraps engine.js)
│
├── pages/
│   ├── LoginPage.jsx
│   ├── HomePage.jsx
│   ├── TeamsPage.jsx
│   ├── MatchesPage.jsx
│   ├── NewMatchPage.jsx
│   ├── ScoringPage.jsx    ← Main live scoring screen
│   ├── ScorecardPage.jsx  ← Full scorecard + charts
│   ├── TournamentsPage.jsx
│   └── HistoryPage.jsx
│
├── components/
│   └── shared/
│       ├── TabBar.jsx
│       ├── TopBar.jsx
│       ├── Modal.jsx
│       ├── Loader.jsx
│       └── EmptyState.jsx
│
├── styles/
│   └── globals.css
│
├── App.jsx
└── main.jsx
```

---

## Setup — Step by Step

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → name it `cricscore` → create
3. In the project dashboard:
   - Click **"</> Web"** to add a web app
   - Register app (name: `cricscore`)
   - **Copy the `firebaseConfig` object**

### 3. Wire in your Firebase config

Open `src/lib/firebase.js` and replace the placeholder values:

```js
const firebaseConfig = {
  apiKey:            "AIzaSy...",
  authDomain:        "cricscore-abc.firebaseapp.com",
  projectId:         "cricscore-abc",
  storageBucket:     "cricscore-abc.appspot.com",
  messagingSenderId: "123456789",
  appId:             "1:123456789:web:abc123",
}
```

### 4. Enable Firebase services

In your Firebase console:

**Authentication:**
- Go to Authentication → Sign-in method
- Enable **Google**
- Add your domain to Authorized domains (for production)

**Firestore:**
- Go to Firestore Database → Create database
- Start in **Test mode** (you can tighten rules later)
- Choose a region close to you

### 5. Deploy Firestore security rules (optional but recommended)

```bash
npm install -g firebase-tools
firebase login
firebase init   # select Firestore + Hosting, link to your project
firebase deploy --only firestore:rules
```

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — sign in with Google and start scoring!

### 7. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at `https://YOUR_PROJECT.web.app`

---

## How to Score a Match

1. **Create teams** → Teams tab → add team name, colour, 11 players
2. **New match** → Matches tab → select teams, overs, toss
3. **Scoring screen** → select openers + bowler → tap score buttons
4. Wicket screen → choose dismissal type
5. Over end → select new bowler
6. Innings end → 2nd innings starts automatically
7. **Result** screen → view Player of Match + open full scorecard

---

## Scoring Buttons Reference

| Button | Meaning |
|---|---|
| `0–6` | Runs scored off bat |
| `W` | Wicket (choose dismissal type) |
| `Wd` | Wide (+1 run, no ball counted) |
| `Nb` | No ball (+1 run, no ball counted) |
| `Lb` | Leg bye (1 run, ball counted) |
| `B` | Bye (1 run, ball counted) |
| `↩` | Undo last ball (30 levels) |

---

## Firestore Data Model

```
/teams/{id}
  uid, name, color, players[], createdAt

/matches/{id}
  uid, team1, team2, team1Players[], team2Players[]
  totalOvers, tossWon, elected, battingFirst, venue
  status (live | completed)
  result (string)
  innings[0..1] (full innings object — see engine.js)
  createdAt

/tournaments/{id}
  uid, name, format, teams[], startDate
  status (upcoming | live | completed)
  matches[]
  createdAt
```

---

## Customisation Ideas

- Add **live share** — use Firebase Realtime Database to let others watch the score
- Add **photo upload** for team logos via Firebase Storage
- Add **push notifications** when a match is updated
- Add **more overs formats** (T10, The Hundred)
- Add **player profiles** with career stats

---

## License

MIT — use freely for personal or club use.
