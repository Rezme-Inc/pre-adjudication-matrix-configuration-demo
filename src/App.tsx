import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu, Info, X } from 'lucide-react'
import './App.css'
import { OffensePage } from './components/OffensePage'
import { FinalSubmit } from './components/FinalSubmit'
import AdminDashboard from './pages/AdminDashboard'
import { Button } from './components/ui/button'
import { supabase } from './supabaseClient'
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
  "Assault",
  "Disorderly Conduct",
  "Forgery/Fraud",
  "Distribution of a Controlled Substance",
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
    <footer className="bg-white pt-4 pb-4 px-6 flex items-center justify-center gap-2 w-full">
      <span className="text-sm text-gray-600 whitespace-nowrap">Powered by</span>
      <img src={footerImage} alt="Powered by" className="h-10 align-middle flex-shrink-0" />
    </footer>
  )
}

const MenuScreen: React.FC<{ 
  user: User | null
  onBack: () => void
  onSignOut: () => void
  onAboutClick: () => void
  isOpen: boolean
}> = ({ user, onBack, onSignOut, onAboutClick, isOpen }) => {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, pointerEvents: isOpen ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }}
        onClick={onBack}
      />
      
      {/* Menu Panel */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: '320px',
          backgroundColor: 'white',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          zIndex: 9999,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 300ms ease-in-out'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* User Section */}
            <div>
              <label className="text-sm text-gray-500 block mb-2">User</label>
              <p className="text-base text-gray-900">
                {user ? user.username : 'Guest'}
              </p>
            </div>

            {/* Instructions Section */}
            <div>
              <Button
                onClick={onAboutClick}
                className="w-full bg-[#0F206C] hover:bg-[#0a1855] text-white"
              >
                Instructions
              </Button>
            </div>
          </div>

          {/* Footer with Sign Out */}
          <div className="p-6 border-t border-gray-200">
            <Button
              onClick={onSignOut}
              variant="outline"
              className="w-full"
            >
              Sign Out
            </Button>
          </div>
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
  const [showMenuScreen, setShowMenuScreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [landingEmail, setLandingEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<{ type: 'none' | 'loading' | 'error' | 'success'; message?: string }>({ type: 'none' })

  const handleLandingEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const trimmed = landingEmail.trim()
    if (!trimmed) return
    
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!re.test(trimmed)) {
      setEmailStatus({ type: 'error', message: 'Please enter a valid email address' })
      return
    }
    
    setEmailStatus({ type: 'loading' })
    
    try {
      const { error } = await supabase
        .from('interest_emails')
        .insert({
          email: trimmed,
          submitted_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      setEmailStatus({ type: 'success', message: 'Email submitted successfully!' })
    } catch (err) {
      console.error('Email submission error:', err)
      setEmailStatus({ 
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to submit. Please try again.'
      })
    }
  }

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
    setShowMenuScreen(true)
  }

  const handleBackFromMenu = () => {
    setShowMenuScreen(false)
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
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Flipping the Switch: Consensus Building Tool</h1>
            <p className="text-gray-600 mb-10">Please enter a username to begin. No login required.</p>
            <SimpleNameForm onStart={start} />
            
            {/* Email Collection Section */}
            <form onSubmit={handleLandingEmailSubmit} style={{ marginTop: '75px' }} className="mt-[75px]">
              <div style={{
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
              }}>
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label htmlFor="landingEmail" style={{ fontWeight: 500, fontSize: '15px' }}>Email (optional)</label>
                  <small style={{ display: 'block', marginTop: 4, marginBottom: 12, color: '#666', lineHeight: '1.5' }}>
                    If you would like to receive the results and resources from this session and access to a customized tool for HPS participants please enter your email address.
                  </small>
                  <input
                    id="landingEmail"
                    type="email"
                    value={landingEmail}
                    onChange={(e) => setLandingEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    disabled={emailStatus.type === 'loading' || emailStatus.type === 'success'}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                    onFocus={(e) => e.target.style.border = '2px solid #0F206C'}
                    onBlur={(e) => e.target.style.border = '1px solid #d1d5db'}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={emailStatus.type === 'loading' || emailStatus.type === 'success'}
                  className="w-full"
                >
                  {emailStatus.type === 'loading' 
                    ? 'Submitting...' 
                    : emailStatus.type === 'success' 
                    ? 'Email Submitted ✓' 
                    : 'Submit Email'}
                </Button>
                {emailStatus.message && (
                  <p className={`mt-3 text-sm ${
                    emailStatus.type === 'error' 
                      ? 'text-red-600' 
                      : emailStatus.type === 'success' 
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}>
                    {emailStatus.message}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
        <MenuScreen 
          user={user}
          onBack={handleBackFromMenu}
          onSignOut={handleSignOut}
          onAboutClick={handleAboutClick}
          isOpen={showMenuScreen}
        />
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
                The conviction is unrelated to positions at our company. Candidates with this conviction will not be flagged for further review.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-2 inline-block">
                <p className="text-gray-800 font-bold text-sm">Lookback Period: Not required</p>
              </div>
            </div>

            {/* Job Dependent */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Job Dependent</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                This conviction may be relevant to some jobs at our company, but would not be relevant to others. The conviction will be subject to further review if the candidate is applying for a position with duties or risks relevant to the conviction.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-md px-4 py-2 inline-block">
                <p className="text-gray-800 font-bold text-sm">Lookback Period: Required (1-10+ years)</p>
              </div>
            </div>

            {/* Always Review */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Always Review</h2>
              <p className="text-gray-700 mb-4 leading-relaxed">
                The conviction may be relevant to all job categories and requires a full review and individualized assessment before a hiring decision is made.
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
        <MenuScreen 
          user={user}
          onBack={handleBackFromMenu}
          onSignOut={handleSignOut}
          onAboutClick={handleAboutClick}
          isOpen={showMenuScreen}
        />
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
              <h1 className="text-2xl font-bold mb-6 text-gray-900">Assessment Submitted</h1>
              <FinalSubmit user={user} responses={responses} />
            </div>
          )}
        </div>
        <Footer />
        <MenuScreen 
          user={user}
          onBack={handleBackFromMenu}
          onSignOut={handleSignOut}
          onAboutClick={handleAboutClick}
          isOpen={showMenuScreen}
        />
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
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Conviction {currentIndex + 1} of {FIRST_N_OFFENSES}</h1>
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
        <MenuScreen 
          user={user}
          onBack={handleBackFromMenu}
          onSignOut={handleSignOut}
          onAboutClick={handleAboutClick}
          isOpen={showMenuScreen}
        />
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
  const [error, setError] = useState('')

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setUsername(value)
    
    // Clear error when user starts typing
    if (error && value.length >= 5) {
      setError('')
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUsername = username.trim()
    
    if (!trimmedUsername) {
      setError('Username is required')
      return
    }
    
    if (trimmedUsername.length < 5) {
      setError('Username must be at least 5 characters')
      return
    }
    
    setError('')
    onStart(trimmedUsername)
  }

  const isValid = username.trim().length >= 5

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-900 mb-2">Username</label>
        <input 
          id="username" 
          value={username} 
          onChange={handleUsernameChange} 
          required 
          minLength={5}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300 focus:ring-primary'
          }`}
          placeholder="Enter at least 5 characters"
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {username.length > 0 && username.length < 5 && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {5 - username.length} more character{5 - username.length !== 1 ? 's' : ''} required
          </p>
        )}
      </div>
      <Button 
        type="submit" 
        disabled={!isValid}
        className="w-full bg-[#0F206C] hover:bg-[#0a1855] text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Start
      </Button>
    </form>
  )
}

export default App
