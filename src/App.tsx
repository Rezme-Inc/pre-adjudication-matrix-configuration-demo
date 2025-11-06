import React, { useState } from 'react'
import './App.css'
import { OffensePage } from './components/OffensePage'
import { FinalSubmit } from './components/FinalSubmit'
import AdminDashboard from './pages/AdminDashboard'

type User = {
  firstName: string
  lastName: string
}

type OffenseResponse = {
  offense: string
  decision: 'Always Eligible' | 'Job Dependent' | 'Always Review'
  lookBackYears: number | null
  notes?: string
}

const OFFENSES = [
  // 'Possession of Marijuana (Drug)',
  // 'Possession of Opioids (Drug)',
  // 'Destruction of Property (Property)',
  // 'Driving While Intoxicated/DUI (Driving)',
  // 'Distribution of Amphetamines (Drug)',
  // 'Taxation Offense (Property)',
  // 'Theft/Larceny (Property)',
  // 'Robbery (Violent)',
  // 'Resisting Arrest (Public Order)',
  // 'Aggravated Assault (Violent)',
  // 'Motor Vehicle Theft (Property)',
  // 'Vehicular Manslaughter (Driving/Violent)'
  "Driving While Intoxicated (DWI)",
  "Simple Assault",
  "Disorderly Conduct",
  "Forgery/Fraud",
  "Distribution of Amphetamines",
  "Burglary",
  "Possession of Marijuana",
  "Parole Violation",
  "Voluntary Manslaughter",
]

// We'll run the user through the FIRST_N_OFFENSES (user asked for 12 offenses)
const FIRST_N_OFFENSES = 9

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<OffenseResponse[]>([])
  const [showAdmin, setShowAdmin] = useState(false)

  const start = (firstName: string, lastName: string) => {
    setUser({ firstName, lastName })
    setCurrentIndex(0)
    setResponses([])
  }

  const handleNext = (resp: OffenseResponse) => {
    setResponses((r) => [...r, resp])
    const next = currentIndex + 1
    setCurrentIndex(next)
  }

  const handleBack = () => {
    if (currentIndex === 0) return
    setResponses((r) => r.slice(0, -1))
    setCurrentIndex((i) => i - 1)
  }

  if (!user) {
    return (
      <div className="container">
        <h1>Pre-Adjudication - Quick Entry</h1>
        <p>Please enter your name to begin. No login required.</p>
        <SimpleNameForm onStart={start} />
      </div>
    )
  }

  // If we've collected FIRST_N_OFFENSES responses, show final submit
  if (responses.length >= FIRST_N_OFFENSES) {
    return (
      <div className="container">
        <header>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>User: {user.firstName} {user.lastName}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowAdmin(true)}>Admin</button>
              <button onClick={() => { setUser(null); setResponses([]); setCurrentIndex(0) }}>Restart</button>
            </div>
          </div>
        </header>
        {showAdmin ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1>Admin Dashboard</h1>
              <button onClick={() => setShowAdmin(false)}>Back</button>
            </div>
            <AdminDashboard />
          </div>
        ) : (
          <>
            <h1>Final Submission</h1>
            <FinalSubmit user={user} responses={responses} />
          </>
        )}
      </div>
    )
  }

  const offense = OFFENSES[currentIndex]
  return (
    <div className="container">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>User: {user.firstName} {user.lastName}</div>
          <button onClick={() => { setUser(null); setResponses([]); setCurrentIndex(0) }}>Logout</button>
        </div>
      </header>

      <h1>Offense {currentIndex + 1} of {FIRST_N_OFFENSES}</h1>
      <p>Please follow the prompt to classify the offense below. Short, factual notes help downstream reviewers.</p>

      <OffensePage
        offense={offense}
        index={currentIndex}
        total={FIRST_N_OFFENSES}
        onBack={handleBack}
        onNext={handleNext}
      />
    </div>
  )
}

const SimpleNameForm: React.FC<{ onStart: (first: string, last: string) => void }> = ({ onStart }) => {
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!first.trim() || !last.trim()) return
    onStart(first.trim(), last.trim())
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 520 }}>
      <div className="form-group">
        <label htmlFor="first">First name</label>
        <input id="first" value={first} onChange={(e) => setFirst(e.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="last">Last name</label>
        <input id="last" value={last} onChange={(e) => setLast(e.target.value)} required />
      </div>
      <button type="submit">Start</button>
    </form>
  )
}

export default App
