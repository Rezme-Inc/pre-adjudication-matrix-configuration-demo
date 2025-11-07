import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu, Info, X } from 'lucide-react'
import './App.css'
import { OffensePage } from './components/OffensePage'
import { FinalSubmit } from './components/FinalSubmit'
import AdminDashboard from './pages/AdminDashboard'
import { Button } from './components/ui/button'
import logoImage from './assets/image (1).png'
import footerImage from './assets/c6e44e69-4cca-4741-b366-9f882b52ec8a.png'
import envoyLogo from './assets/08a0f5_fc930def25264a5795c1219c8cfd69ba~mv2.gif'

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

const Header: React.FC<{ onMenuClick: () => void; onInfoClick: () => void; showButtons?: boolean }> = ({ onMenuClick, onInfoClick, showButtons = true }) => {
  return (
    <header className="bg-white px-6 py-8 flex justify-between items-center sticky top-0 z-50 shadow-sm relative">
      {showButtons ? (
        <>
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <img src={envoyLogo} alt="Envoy Logo" className="h-8" />
          </div>
          <button
            onClick={onInfoClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            aria-label="Info"
          >
            <Info className="w-6 h-6 text-gray-700" />
          </button>
        </>
      ) : (
        <>
          <div className="flex-shrink-0 w-10"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
            <img src={envoyLogo} alt="Envoy Logo" className="h-8" />
          </div>
          <div className="flex-shrink-0 w-10"></div>
        </>
      )}
    </header>
  )
}

const Footer: React.FC = () => {
  return (
    <footer className="bg-white pt-4 pb-4 px-6 flex items-center justify-center gap-2">
      <span className="text-sm text-gray-600">Powered by</span>
      <img src={footerImage} alt="Powered by" className="h-10 align-middle" />
    </footer>
  )
}

const MenuScreen: React.FC<{ 
  user: User | null
  onBack: () => void
  onSignOut: () => void
  onAboutClick: () => void
}> = ({ user, onBack, onSignOut, onAboutClick }) => {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      <Header onMenuClick={() => {}} onInfoClick={() => {}} />
      <div className="flex items-center justify-center p-6 flex-1 mb-8">
        <div className="w-full max-w-md p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Menu</h2>
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 mb-8">
            {/* User Section */}
            <div>
              <label className="text-sm text-gray-500 block mb-2">User</label>
              <p className="text-base text-gray-900">
                {user ? user.username : 'Guest'}
              </p>
            </div>

            {/* About Section */}
            <div>
              <button 
                onClick={onAboutClick}
                className="text-base font-bold text-gray-900 hover:text-gray-700 transition-colors cursor-pointer underline hover:no-underline"
              >
                About
              </button>
            </div>
          </div>

          {/* Footer with Sign Out */}
          <div className="pt-6">
            <Button
              onClick={onSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
        </div>
        <Footer />
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
  const [showMenuScreen, setShowMenuScreen] = useState(false)
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
    setShowMenuScreen(false)
  }

  const handleMenuClick = () => {
    setIsPageTransitioning(true)
    setTimeout(() => {
      setShowMenuScreen(true)
      setTimeout(() => {
        setIsPageTransitioning(false)
      }, 50)
    }, 400)
  }

  const handleBackFromMenu = () => {
    setIsPageTransitioning(true)
    setTimeout(() => {
      setShowMenuScreen(false)
      setTimeout(() => {
        setIsPageTransitioning(false)
      }, 50)
    }, 400)
  }

  const handleAboutClick = () => {
    setIsPageTransitioning(true)
    setTimeout(() => {
      setShowMenuScreen(false)
      setTimeout(() => {
        setShowInstructions(true)
        // Small delay before fade in
        setTimeout(() => {
          setIsPageTransitioning(false)
        }, 50)
      }, 50)
    }, 400)
  }

  const handleInfoClick = () => {
    // If already on instructions screen, do nothing
    if (showInstructions) return
    
    setIsPageTransitioning(true)
    setTimeout(() => {
      if (showMenuScreen) {
        setShowMenuScreen(false)
      }
      setTimeout(() => {
        setShowInstructions(true)
        setTimeout(() => {
          setIsPageTransitioning(false)
        }, 50)
      }, 50)
    }, 400)
  }

  if (showMenuScreen) {
    return (
      <div className={`bg-white min-h-screen flex flex-col transition-all duration-[400ms] ease-in-out ${
        isPageTransitioning 
          ? 'opacity-0 -translate-x-8' 
          : 'opacity-100 translate-x-0'
      }`}>
        <MenuScreen 
          user={user}
          onBack={handleBackFromMenu}
          onSignOut={handleSignOut}
          onAboutClick={handleAboutClick}
        />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white min-h-screen">
        <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} showButtons={false} />
        <div className="flex items-center justify-center p-6 mb-8">
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
      <div className={`bg-white min-h-screen flex flex-col transition-all duration-[400ms] ease-in-out ${
        isPageTransitioning 
          ? 'opacity-0 -translate-x-8' 
          : 'opacity-100 translate-x-0'
      }`}>
        <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} showButtons={false} />
        <div className="flex items-center justify-center p-6 flex-1 mb-8">
          <div className="bg-white w-full max-w-3xl p-8">
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
              <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 inline-block">
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
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // If we've collected FIRST_N_OFFENSES responses, show final submit
  if (responses.length >= FIRST_N_OFFENSES) {
    return (
      <div className={`bg-white min-h-screen flex flex-col transition-all duration-[400ms] ease-in-out ${
        isPageTransitioning 
          ? 'opacity-0 -translate-x-8' 
          : 'opacity-100 translate-x-0'
      }`}>
        <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} />
        <div className="max-w-4xl mx-auto p-6 flex-1 mb-8">
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
        <Footer />
      </div>
    )
  }

  const offense = OFFENSES[currentIndex]
  return (
    <div className={`bg-white min-h-screen flex flex-col transition-all duration-[400ms] ease-in-out ${
      isPageTransitioning 
        ? 'opacity-0 -translate-x-8' 
        : 'opacity-100 translate-x-0'
    }`}>
      <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} />
      <div className="flex items-center justify-center p-6 flex-1 mb-8">
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
        <Footer />
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
