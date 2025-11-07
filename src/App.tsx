import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu, Info, X } from 'lucide-react'
import './App.css'
import { OffensePage } from './components/OffensePage'
import { FinalSubmit } from './components/FinalSubmit'
import AdminDashboard from './pages/AdminDashboard'
import { Button } from './components/ui/button'
import logoImage from './assets/image (1).png'

type User = {
  username: string
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

const Header: React.FC<{ onMenuClick: () => void; onInfoClick: () => void }> = ({ onMenuClick, onInfoClick }) => {
  return (
    <header className="bg-white px-6 py-8 flex justify-between items-center sticky top-0 z-50 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Menu"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
      <button
        onClick={onInfoClick}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Info"
      >
        <Info className="w-6 h-6 text-gray-700" />
      </button>
    </header>
  )
}

const MenuPanel: React.FC<{ 
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSignOut: () => void
}> = ({ isOpen, onClose, user, onSignOut }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Full Screen Modal */}
      <div className="relative bg-white w-full max-w-md mx-4 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto">
          {/* User Section */}
          <div className="mb-6">
            <label className="text-sm text-gray-500 block mb-2">User</label>
            <p className="text-base text-gray-900">
              {user ? user.username : 'Guest'}
            </p>
          </div>

          {/* Email Section */}
          <div className="mb-6">
            <label className="text-sm text-gray-500 block mb-2">E-mail</label>
            <p className="text-base text-gray-900 break-all">
              {user ? `${user.username.toLowerCase()}@example.com` : 'guest@example.com'}
            </p>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <label className="text-sm text-gray-500 block mb-2">About</label>
            <button className="text-base text-gray-900 hover:text-gray-700 transition-colors">
              About
            </button>
          </div>
        </div>

        {/* Footer with Sign Out */}
        <div className="px-6 py-6 border-t border-gray-200">
          <button
            onClick={onSignOut}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-900 hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<OffenseResponse[]>([])
  const [showAdmin, setShowAdmin] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const start = (username: string) => {
    setIsPageTransitioning(true)
    setTimeout(() => {
      setUser({ username })
      setCurrentIndex(0)
      setResponses([])
      setIsTransitioning(false)
      setIsPageTransitioning(false)
      // Small delay to ensure state is reset before showing instructions
      setTimeout(() => {
        setShowInstructions(true)
      }, 10)
    }, 400)
  }

  const proceedFromInstructions = () => {
    setIsPageTransitioning(true)
    setTimeout(() => {
      setShowInstructions(false)
      setTimeout(() => {
        setIsPageTransitioning(false)
      }, 50)
    }, 400)
  }

  const handleNext = (resp: OffenseResponse) => {
    setResponses((r) => [...r, resp])
    // Start fade out animation
    setIsTransitioning(true)
    // After fade out, move to next offense and fade in
    setTimeout(() => {
      const next = currentIndex + 1
      setCurrentIndex(next)
      // Small delay before fade in
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300) // Match the fade-out duration
  }

  const handleBack = () => {
    if (currentIndex === 0) return
    // Start fade out animation
    setIsTransitioning(true)
    // After fade out, move to previous offense and fade in
    setTimeout(() => {
      setResponses((r) => r.slice(0, -1))
      setCurrentIndex((i) => i - 1)
      // Small delay before fade in
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 300) // Match the fade-out duration
  }

  const handleSignOut = () => {
    setUser(null)
    setResponses([])
    setCurrentIndex(0)
    setIsTransitioning(false)
    setShowMenu(false)
  }

  if (!user) {
    return (
      <div className="bg-white min-h-screen">
        <Header onMenuClick={() => setShowMenu(!showMenu)} onInfoClick={() => setShowInfo(!showInfo)} />
        <MenuPanel 
          isOpen={showMenu} 
          onClose={() => setShowMenu(false)} 
          user={null}
          onSignOut={handleSignOut}
        />
        <div className="flex items-center justify-center p-6">
          <div className={`bg-white p-8 w-full max-w-md transition-all duration-[400ms] ease-in-out ${
            isPageTransitioning 
              ? 'opacity-0 -translate-x-8' 
              : 'opacity-100 translate-x-0'
          }`}>
            <img src={logoImage} alt="Human Potential SUMMIT" className="mb-8" />
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Flipping the Switch: User Demo</h1>
            <p className="text-gray-600 mb-10">Please enter a username to begin. No login required.</p>
            <SimpleNameForm onStart={start} />
          </div>
        </div>
      </div>
    )
  }

  if (showInstructions) {
    return (
      <div className="bg-white min-h-screen">
        <Header onMenuClick={() => setShowMenu(!showMenu)} onInfoClick={() => setShowInfo(!showInfo)} />
        <MenuPanel 
          isOpen={showMenu} 
          onClose={() => setShowMenu(false)} 
          user={user}
          onSignOut={handleSignOut}
        />
        <div className="flex items-center justify-center p-6">
          <div className={`bg-white w-full max-w-3xl p-8 transition-all duration-[400ms] ease-in-out ${
            isPageTransitioning 
              ? 'opacity-0 -translate-x-8' 
              : 'opacity-100 translate-x-0'
          }`}>
            <h1 className="text-3xl font-bold mb-10 text-gray-900 text-center">Instructions</h1>
            
            <div className="space-y-6 mb-10">
            {/* Always Eligible */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Always Eligible</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                The conviction is unrelated to positions at our company. Candidates with this conviction will not be flagged for further review. When to use: The offense has no connection to job duties or compliance requirements.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-2 inline-block">
                <p className="text-gray-800 font-bold text-sm">Lookback Period: Not required</p>
              </div>
            </div>

            {/* Job Dependent */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Job Dependent</h2>
              <p className="text-gray-700 mb-3 leading-relaxed">
                This conviction may be relevant to some jobs at our company, but would not be relevant to others. The conviction will be subject to further review if the candidate is applying for a position with duties or risks relevant to the conviction.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                When to use: If the relevance of the conviction depends on the job and you have (or plan to) pre-assess which job categories at your organization are specifically relevant to which conviction categories.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-md px-4 py-2 inline-block">
                <p className="text-gray-800 font-bold text-sm">Lookback Period: Required (1-10+ years)</p>
              </div>
            </div>

            {/* Always Review */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Always Review</h2>
              <p className="text-gray-700 mb-3 leading-relaxed">
                The conviction may be relevant to all job categories and requires a full review and individualized assessment before a hiring decision is made.
              </p>
              <p className="text-gray-700 mb-4 leading-relaxed">
                When to use: The conviction may be broadly job relevant or your company has not developed a more nuanced process to assess the conviction based on specific job categories.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-md px-4 py-2 inline-block">
                <p className="text-gray-800 font-bold text-sm">Lookback Period: Required (1-10+ years)</p>
              </div>
            </div>

            {/* Setting Lookback Periods */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Setting Lookback Periods</h2>
              <p className="text-gray-700 mb-3 leading-relaxed">
                Choose 1-10+ years based on:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Known regulations or industry standards</li>
                <li>Assessment of the conviction's potential risk or relevance to your company</li>
                <li>Overlay of internal or external research and past experience</li>
              </ul>
            </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <Button 
                onClick={proceedFromInstructions}
                className="bg-[#0F206C] hover:bg-[#0a1855] text-white shadow-md hover:shadow-lg transition-shadow"
                style={{ padding: '24px 80px', fontSize: '20px', fontWeight: '600' }}
              >
                Continue
              </Button>
              <div className="text-center text-gray-500 text-sm">
                Powered by Rezme
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If we've collected FIRST_N_OFFENSES responses, show final submit
  if (responses.length >= FIRST_N_OFFENSES) {
    return (
      <div className="bg-white min-h-screen">
        <Header onMenuClick={() => setShowMenu(!showMenu)} onInfoClick={() => setShowInfo(!showInfo)} />
        <MenuPanel 
          isOpen={showMenu} 
          onClose={() => setShowMenu(false)} 
          user={user}
          onSignOut={handleSignOut}
        />
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white p-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-gray-900 font-medium">User: {user.username}</div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setUser(null); setResponses([]); setCurrentIndex(0) }}>Restart</Button>
              </div>
            </div>
          </div>
          {showAdmin ? (
            <div className="bg-white p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <Button variant="outline" onClick={() => setShowAdmin(false)}>Back</Button>
              </div>
              <AdminDashboard />
            </div>
          ) : (
            <div className="bg-white p-6">
              <h1 className="text-2xl font-bold mb-6 text-gray-900">Final Submission</h1>
              <FinalSubmit user={user} responses={responses} />
            </div>
          )}
        </div>
      </div>
    )
  }

  const offense = OFFENSES[currentIndex]
  return (
    <div className="bg-white min-h-screen">
      <Header onMenuClick={() => setShowMenu(!showMenu)} onInfoClick={() => setShowInfo(!showInfo)} />
      <MenuPanel 
        isOpen={showMenu} 
        onClose={() => setShowMenu(false)} 
        user={user}
        onSignOut={handleSignOut}
      />
      <div className="flex items-center justify-center p-6">
        <div className={`bg-white w-full max-w-2xl p-8 transition-all duration-300 ease-in-out ${
          isTransitioning 
            ? 'opacity-0 -translate-x-8' 
            : 'opacity-100 translate-x-0'
        }`}>
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div className="text-gray-900 font-medium">User: {user.username}</div>
              <Button variant="outline" onClick={() => { setUser(null); setResponses([]); setCurrentIndex(0); setIsTransitioning(false) }}>Logout</Button>
            </div>
          </div>

        <h1 className="text-2xl font-bold mb-6 text-gray-900">Offense {currentIndex + 1} of {FIRST_N_OFFENSES}</h1>
        <p className="text-gray-600 mb-10">Please follow the prompt to classify the offense below. Short, factual notes help downstream reviewers.</p>

        <OffensePage
          key={currentIndex} // Force remount to reset state to "Always Eligible"
          offense={offense}
          index={currentIndex}
          total={FIRST_N_OFFENSES}
          username={user.username}
          onBack={handleBack}
          onNext={handleNext}
        />
        </div>
      </div>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </BrowserRouter>
  )
}


const SimpleNameForm: React.FC<{ onStart: (username: string) => void }> = ({ onStart }) => {
  const [username, setUsername] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return
    onStart(username.trim())
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">Username</label>
        <input 
          id="username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          required 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <Button type="submit" className="w-full bg-[#0F206C] hover:bg-[#0a1855] text-white">Start</Button>
    </form>
  )
}

export default App
