import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Menu, Info, X } from 'lucide-react'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import { Button } from './components/ui/button'
import { supabase } from './supabaseClient'
import { UsernameConflictModal } from './components/UsernameConflictModal'
import logoImage from './assets/image (1).png'
import footerImage from './assets/c6e44e69-4cca-4741-b366-9f882b52ec8a.png'
import envoyLogo from './assets/08a0f5_fc930def25264a5795c1219c8cfd69ba~mv2.gif'
import { CategorySelectionPage } from './components/CategorySelectionPage'
import { SecondOrderModePage } from './components/SecondOrderModePage'
import { AggregateDecisionPage, AggregateDecisionData } from './components/AggregateDecisionPage'
import { IndividualDecisionPage, IndividualDecisionData } from './components/IndividualDecisionPage'
import { HierarchicalFinalSubmit } from './components/HierarchicalFinalSubmit'
import { OFFENSE_HIERARCHY, HierarchicalResponse, getCategoryByName } from './data/offenseHierarchy'

type User = {
  username: string
}

// Constant for "No time limit" lookback period
export const NO_TIME_LIMIT = 25

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

const InstructionsOverlay: React.FC<{ 
  isOpen: boolean
  onClose: () => void
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000, pointerEvents: isOpen ? 'auto' : 'none' }}>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 10001
        }}
        onClick={onClose}
      />
      
      {/* Instructions Panel */}
      <div 
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '800px',
          maxHeight: '90vh',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          zIndex: 10002,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Instructions</h1>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
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
      </div>
    </div>
  )
}

const MainApp: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [showInstructionsOverlay, setShowInstructionsOverlay] = useState(false)
  const [isPageTransitioning, setIsPageTransitioning] = useState(false)
  const [showMenuScreen, setShowMenuScreen] = useState(false)
  const [landingEmail, setLandingEmail] = useState('')
  const [emailStatus, setEmailStatus] = useState<{ type: 'none' | 'loading' | 'error' | 'success'; message?: string }>({ type: 'none' })
  const [showUsernameConflict, setShowUsernameConflict] = useState(false)
  const [existingBatchData, setExistingBatchData] = useState<any>(null)
  const [pendingUsername, setPendingUsername] = useState('')
  
  // Hierarchical workflow state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentSecondOrderIndex, setCurrentSecondOrderIndex] = useState(0)
  const [currentFirstOrderIndex, setCurrentFirstOrderIndex] = useState(0)
  const [secondOrderModeChoices, setSecondOrderModeChoices] = useState<Map<string, 'aggregate' | 'individual'>>(new Map())
  const [hierarchicalResponses, setHierarchicalResponses] = useState<HierarchicalResponse[]>([])
  const [showSecondOrderMode, setShowSecondOrderMode] = useState(false)
  const [showCategorySelection, setShowCategorySelection] = useState(false)
  const [showHierarchicalFinalSubmit, setShowHierarchicalFinalSubmit] = useState(false)

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

  const start = async (username: string) => {
    // Check if username exists in database
    try {
      const { data: existingBatch, error } = await supabase
        .from('decisions_batch')
        .select('*')
        .eq('username', username)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is fine
        console.error('Error checking username:', error)
      }

      if (existingBatch) {
        // Username exists - show conflict modal
        setPendingUsername(username)
        setExistingBatchData(existingBatch)
        setShowUsernameConflict(true)
        return
      }

      // Username doesn't exist - create new batch record
      const newBatchId = crypto.randomUUID()
      const { error: insertError } = await supabase
        .from('decisions_batch')
        .insert({
          batch_id: newBatchId,
          username: username,
          submitted_by_name: username,
          recipient_emails: [],
          hierarchical_responses: [],
          completed: false,
          submitted_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('Error creating batch:', insertError)
        alert(`Failed to create user record: ${insertError.message}\nPlease check the database schema.`)
        return
      }

      // Proceed to hierarchical workflow
      setIsPageTransitioning(true)
      setTimeout(() => {
        setUser({ username })
        setIsTransitioning(false)
        setIsPageTransitioning(false)
        // Show instructions first
        setTimeout(() => {
          setShowInstructions(true)
        }, 10)
      }, 400)
    } catch (err) {
      console.error('Error in start:', err)
      // If there's an error, proceed normally
      setIsPageTransitioning(true)
      setTimeout(() => {
        setUser({ username })
        setIsTransitioning(false)
        setIsPageTransitioning(false)
        setTimeout(() => {
          setShowInstructions(true)
        }, 10)
      }, 400)
    }
  }

  const proceedFromInstructions = () => {
    setIsPageTransitioning(true)
    setTimeout(() => {
      setShowInstructions(false)
      setTimeout(() => {
        setShowCategorySelection(true)
        setIsPageTransitioning(false)
      }, 50)
    }, 400)
  }

  const handleSignOut = () => {
    setUser(null)
    setHierarchicalResponses([])
    setSelectedCategory(null)
    setCurrentSecondOrderIndex(0)
    setCurrentFirstOrderIndex(0)
    setSecondOrderModeChoices(new Map())
    setShowCategorySelection(false)
    setShowSecondOrderMode(false)
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
    // If user is logged in and in the workflow, show as overlay
    if (user) {
      setShowInstructionsOverlay(true)
      return
    }

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

  // Handler for when user confirms identity (completed response)
  const handleConfirmIdentity = () => {
    if (!existingBatchData) return

    setShowUsernameConflict(false)
    setIsPageTransitioning(true)

    setTimeout(() => {
      // Load hierarchical responses
      const hierarchicalData = existingBatchData.hierarchical_responses || []

      if (hierarchicalData.length > 0) {
        const convertedHierarchicalResponses: HierarchicalResponse[] = hierarchicalData.map((r: any) => ({
          category: r.category,
          secondOrder: r.second_order,
          firstOrder: r.first_order,
          isAggregate: r.is_aggregate,
          decision: r.decision_level,
          lookBackYears: r.look_back_period,
          notes: r.notes,
        }))

        setUser({ username: pendingUsername })
        setHierarchicalResponses(convertedHierarchicalResponses)
        setShowCategorySelection(true)
      } else {
        // No hierarchical data, start fresh
        setUser({ username: pendingUsername })
        setShowInstructions(true)
      }
      
      setIsPageTransitioning(false)
    }, 400)
  }

  // Handler for when user denies identity (completed response)
  const handleDenyIdentity = () => {
    setShowUsernameConflict(false)
    setPendingUsername('')
    setExistingBatchData(null)
    // User stays on login screen to choose different username
  }

  // Handler for continuing incomplete response
  const handleContinueProgress = () => {
    if (!existingBatchData) return

    setShowUsernameConflict(false)
    setIsPageTransitioning(true)

    setTimeout(() => {
      const hierarchicalData = existingBatchData.hierarchical_responses || []

      if (hierarchicalData.length > 0) {
        // Restore hierarchical workflow state
        const convertedHierarchicalResponses: HierarchicalResponse[] = hierarchicalData.map((r: any) => ({
          category: r.category,
          secondOrder: r.second_order,
          firstOrder: r.first_order,
          isAggregate: r.is_aggregate,
          decision: r.decision_level,
          lookBackYears: r.look_back_period,
          notes: r.notes,
        }))

        setUser({ username: pendingUsername })
        setHierarchicalResponses(convertedHierarchicalResponses)
        setShowInstructions(true) // Show instructions first
        setIsPageTransitioning(false)
      } else {
        // No data yet, start from beginning
        setUser({ username: pendingUsername })
        setShowInstructions(true)
        setIsPageTransitioning(false)
      }
    }, 400)
  }

  // Handler for starting over (delete existing and restart)
  const handleStartOverFromConflict = async () => {
    if (!existingBatchData) return

    try {
      // Delete existing batch
      await supabase
        .from('decisions_batch')
        .delete()
        .eq('batch_id', existingBatchData.batch_id)

      setShowUsernameConflict(false)
      setIsPageTransitioning(true)

      setTimeout(() => {
        setUser({ username: pendingUsername })
        setHierarchicalResponses([])
        setIsTransitioning(false)
        setIsPageTransitioning(false)
        setTimeout(() => {
          setShowInstructions(true)
        }, 10)
      }, 400)
    } catch (err) {
      console.error('Error deleting batch:', err)
      alert('Failed to delete previous responses. Please try again.')
    }
  }

  // Handler for changing username
  const handleChangeUsername = () => {
    setShowUsernameConflict(false)
    setPendingUsername('')
    setExistingBatchData(null)
    // User stays on login screen
  }

  // Hierarchical workflow handlers
  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category)
    setCurrentSecondOrderIndex(0)
    setShowCategorySelection(false)
    setShowSecondOrderMode(true)
    setIsTransitioning(true)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 300)
  }

  const handleSecondOrderModeSelection = async (mode: 'aggregate' | 'individual') => {
    if (!selectedCategory || !user) return
    
    const category = getCategoryByName(selectedCategory)
    if (!category) return
    
    const secondOrderGroup = category.secondOrderGroups[currentSecondOrderIndex]
    const key = `${selectedCategory}-${secondOrderGroup.name}`
    
    // Update mode choice
    setSecondOrderModeChoices(prev => new Map(prev).set(key, mode))
    
    // If switching from aggregate to individual, we need to handle prefilling
    if (mode === 'individual') {
      // Check if there are existing aggregate responses
      const existingAggregateResponses = hierarchicalResponses.filter(
        r => r.category === selectedCategory && 
             r.secondOrder === secondOrderGroup.name && 
             r.isAggregate
      )
      
      // If there were aggregate responses, convert them to individual responses with isAggregate: false
      if (existingAggregateResponses.length > 0) {
        const aggregateTemplate = existingAggregateResponses[0]
        const convertedResponses = secondOrderGroup.firstOrderOffenses.map(offense => ({
          category: selectedCategory,
          secondOrder: secondOrderGroup.name,
          firstOrder: offense.name,
          isAggregate: false,
          decision: aggregateTemplate.decision,
          lookBackYears: aggregateTemplate.lookBackYears,
          notes: aggregateTemplate.notes,
        }))
        
        // Remove old aggregate responses and add converted individual responses
        const filteredResponses = hierarchicalResponses.filter(
          r => !(r.category === selectedCategory && r.secondOrder === secondOrderGroup.name)
        )
        setHierarchicalResponses([...filteredResponses, ...convertedResponses])
      }
    }
    
    setShowSecondOrderMode(false)
    setIsTransitioning(true)
    
    setTimeout(() => {
      if (mode === 'aggregate') {
        // Will render AggregateDecisionPage
      } else {
        // Will render IndividualDecisionPage
        setCurrentFirstOrderIndex(0)
      }
      setIsTransitioning(false)
    }, 300)
  }

  const handleAggregateDecision = async (decisionData: AggregateDecisionData) => {
    if (!selectedCategory || !user) return
    
    const category = getCategoryByName(selectedCategory)
    if (!category) return
    
    const secondOrderGroup = category.secondOrderGroups[currentSecondOrderIndex]
    
    // Save aggregate decision for all first-order offenses in this group
    const newResponses: HierarchicalResponse[] = secondOrderGroup.firstOrderOffenses.map(offense => ({
      category: selectedCategory,
      secondOrder: secondOrderGroup.name,
      firstOrder: offense.name,
      isAggregate: true,
      decision: decisionData.decision,
      lookBackYears: decisionData.lookBackYears,
      notes: decisionData.notes,
    }))
    
    // Remove any existing responses for this second-order group
    const filteredResponses = hierarchicalResponses.filter(
      r => !(r.category === selectedCategory && r.secondOrder === secondOrderGroup.name)
    )
    
    setHierarchicalResponses([...filteredResponses, ...newResponses])
    
    // Save to database
    try {
      await saveHierarchicalResponses([...filteredResponses, ...newResponses])
    } catch (err) {
      console.error('Error saving aggregate decision:', err)
      alert('Failed to save decision. Please check the database migration and try again. See MIGRATION_INSTRUCTIONS.md')
      return
    }
    
    // Move to next second-order group or back to category selection
    moveToNextSecondOrderGroup()
  }

  const handleIndividualDecision = async (decisionData: IndividualDecisionData) => {
    if (!selectedCategory || !user) return
    
    const category = getCategoryByName(selectedCategory)
    if (!category) return
    
    const secondOrderGroup = category.secondOrderGroups[currentSecondOrderIndex]
    
    const newResponse: HierarchicalResponse = {
      category: selectedCategory,
      secondOrder: secondOrderGroup.name,
      firstOrder: decisionData.offense,
      isAggregate: false,
      decision: decisionData.decision,
      lookBackYears: decisionData.lookBackYears,
      notes: decisionData.notes,
    }
    
    // Update or add response
    const updatedResponses = [...hierarchicalResponses]
    const existingIndex = updatedResponses.findIndex(
      r => r.category === selectedCategory && 
           r.secondOrder === secondOrderGroup.name && 
           r.firstOrder === decisionData.offense
    )
    
    if (existingIndex >= 0) {
      updatedResponses[existingIndex] = newResponse
    } else {
      updatedResponses.push(newResponse)
    }
    
    setHierarchicalResponses(updatedResponses)
    
    // Save to database
    try {
      await saveHierarchicalResponses(updatedResponses)
    } catch (err) {
      console.error('Error saving individual decision:', err)
      alert('Failed to save decision. Please check the database migration and try again. See MIGRATION_INSTRUCTIONS.md')
      return
    }
    
    // Move to next offense or next second-order group
    setIsTransitioning(true)
    setTimeout(() => {
      if (currentFirstOrderIndex < secondOrderGroup.firstOrderOffenses.length - 1) {
        setCurrentFirstOrderIndex(prev => prev + 1)
      } else {
        // Finished all offenses in this group
        moveToNextSecondOrderGroup()
      }
      setIsTransitioning(false)
    }, 300)
  }

  const areAllCategoriesComplete = () => {
    // Check if all categories have been completed
    return OFFENSE_HIERARCHY.every(category => {
      return category.secondOrderGroups.every(secondOrderGroup => {
        // Check if this second-order group has a response (either aggregate or individual for all offenses)
        const hasAggregateResponse = hierarchicalResponses.some(
          r => r.category === category.name && 
               r.secondOrder === secondOrderGroup.name && 
               r.isAggregate
        )
        
        if (hasAggregateResponse) return true
        
        // If no aggregate, check if all individual offenses have responses
        return secondOrderGroup.firstOrderOffenses.every(offense => 
          hierarchicalResponses.some(
            r => r.category === category.name && 
                 r.secondOrder === secondOrderGroup.name && 
                 r.firstOrder === offense.name
          )
        )
      })
    })
  }

  const moveToNextSecondOrderGroup = () => {
    if (!selectedCategory) return
    
    const category = getCategoryByName(selectedCategory)
    if (!category) return
    
    setIsTransitioning(true)
    setTimeout(() => {
      if (currentSecondOrderIndex < category.secondOrderGroups.length - 1) {
        // Move to next second-order group
        setCurrentSecondOrderIndex(prev => prev + 1)
        setCurrentFirstOrderIndex(0)
        setShowSecondOrderMode(true)
      } else {
        // Finished all second-order groups in this category
        setSelectedCategory(null)
        setCurrentSecondOrderIndex(0)
        setCurrentFirstOrderIndex(0)
        
        // Check if all categories are complete
        if (areAllCategoriesComplete()) {
          setShowHierarchicalFinalSubmit(true)
        } else {
          setShowCategorySelection(true)
        }
      }
      setIsTransitioning(false)
    }, 300)
  }

  const saveHierarchicalResponses = async (responses: HierarchicalResponse[]) => {
    if (!user) return
    
    try {
      const { data: existingBatch, error: fetchError } = await supabase
        .from('decisions_batch')
        .select('batch_id')
        .eq('username', user.username)
        .single()

      const hierarchicalData = responses.map(r => ({
        category: r.category,
        second_order: r.secondOrder,
        first_order: r.firstOrder,
        is_aggregate: r.isAggregate,
        decision_level: r.decision,
        look_back_period: r.lookBackYears,
        notes: r.notes || null,
      }))

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Fetch error:', fetchError)
        throw fetchError
      }

      if (existingBatch) {
        const { error: updateError } = await supabase
          .from('decisions_batch')
          .update({
            hierarchical_responses: hierarchicalData,
            submitted_at: new Date().toISOString()
          })
          .eq('batch_id', existingBatch.batch_id)
        
        if (updateError) {
          console.error('Update error:', updateError)
          throw updateError
        }
        console.log('Successfully updated hierarchical responses')
      } else {
        const newBatchId = crypto.randomUUID()
        const { error: insertError } = await supabase
          .from('decisions_batch')
          .insert({
            batch_id: newBatchId,
            username: user.username,
            submitted_by_name: user.username,
            recipient_emails: [],
            hierarchical_responses: hierarchicalData,
            completed: false,
            submitted_at: new Date().toISOString()
          })
        
        if (insertError) {
          console.error('Insert error:', insertError)
          throw insertError
        }
        console.log('Successfully inserted new batch with hierarchical responses')
      }
    } catch (err) {
      console.error('Error saving hierarchical responses:', err)
      throw err
    }
  }

  const handleBackFromHierarchical = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      // Determine what to show based on current state
      if (showSecondOrderMode) {
        // Go back to category selection
        setShowSecondOrderMode(false)
        setShowCategorySelection(true)
      } else if (currentFirstOrderIndex > 0) {
        // Go back to previous offense
        setCurrentFirstOrderIndex(prev => prev - 1)
      } else {
        // Go back to category selection (skip mode selection)
        setShowSecondOrderMode(false)
        setSelectedCategory(null)
        setCurrentSecondOrderIndex(0)
        setShowCategorySelection(true)
      }
      setIsTransitioning(false)
    }, 300)
  }
  
  const handleBackToInstructions = () => {
    setShowCategorySelection(false)
    setSelectedCategory(null)
    setCurrentSecondOrderIndex(0)
    setCurrentFirstOrderIndex(0)
    setShowInstructions(true)
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
        <UsernameConflictModal
          isOpen={showUsernameConflict}
          username={pendingUsername}
          isCompleted={existingBatchData?.completed || false}
          onConfirmIdentity={handleConfirmIdentity}
          onDenyIdentity={handleDenyIdentity}
          onContinue={handleContinueProgress}
          onStartOver={handleStartOverFromConflict}
          onChangeUsername={handleChangeUsername}
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
              <div className="bg-purple-50 border border-purple-200 rounded-md px-4 py-2 inline-block mb-4">
                <p className="text-gray-800 font-bold text-sm">Lookback Period: Required (1-10+ years)</p>
              </div>
              
              {/* Risk Tag Definitions */}
              <div className="mt-4 pt-4 border-t border-gray-300">
                <h3 className="text-base font-semibold mb-2 text-gray-900">Job-Specific Risk Categories:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li><span className="font-normal text-gray-900">Access to company assets and/or financial documents:</span> Access to a company credit card, confidential financial information systems, or oversight of financial processes</li>
                  <li><span className="font-normal text-gray-900">Access to employee information:</span> Social Security numbers, banking/routing numbers</li>
                  <li><span className="font-normal text-gray-900">Operating Machinery/Driving:</span> Operate machinery or drive as an essential component of the role</li>
                  <li><span className="font-normal text-gray-900">Access to vulnerable populations:</span> Working with individuals classified as vulnerable populations, such as the elderly, children, or those with disabilities</li>
                  <li><span className="font-normal text-gray-900">Access to Materials with a Concern of Theft:</span> Materials with a significant cash value that would impact the employer, or access to materials that are at a high risk of theft</li>
                  <li><span className="font-normal text-gray-900">Off-Site Work:</span> Working at a location that is not company-owned</li>
                  <li><span className="font-normal text-gray-900">Direct Reports:</span> Contractors or employees</li>
                  <li><span className="font-normal text-gray-900">Interfacing with Customers/Clients:</span> Selling to, managing, or communicating with external customers and clients</li>
                  <li><span className="font-normal text-gray-900">Senior Management Position:</span> Uniquely positioned and/or high profile role</li>
                </ul>
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

  // Hierarchical Final Submit Screen
  if (showHierarchicalFinalSubmit && user) {
    return (
      <>
        <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} />
        <HierarchicalFinalSubmit
          user={user}
          responses={hierarchicalResponses}
          onBackToCategories={() => {
            setShowHierarchicalFinalSubmit(false)
            setShowCategorySelection(true)
          }}
        />
        <MenuScreen 
          user={user}
          onBack={handleBackFromMenu}
          onSignOut={handleSignOut}
          onAboutClick={handleAboutClick}
          isOpen={showMenuScreen}
        />
        <InstructionsOverlay 
          isOpen={showInstructionsOverlay}
          onClose={() => setShowInstructionsOverlay(false)}
        />
      </>
    )
  }

  // Hierarchical workflow rendering
  // Category selection
  if (showCategorySelection) {
    return (
      <div className="bg-white min-h-screen flex flex-col">
        <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} />
        <div className={`flex-1 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <CategorySelectionPage
            onSelectCategory={handleCategorySelection}
            onBack={handleBackToInstructions}
          />
        </div>
        <Footer />
        <MenuScreen 
          user={user}
          onBack={handleBackFromMenu}
          onSignOut={handleSignOut}
          onAboutClick={handleAboutClick}
          isOpen={showMenuScreen}
        />
        <InstructionsOverlay 
          isOpen={showInstructionsOverlay}
          onClose={() => setShowInstructionsOverlay(false)}
        />
      </div>
    )
  }

  if (selectedCategory) {
    const category = getCategoryByName(selectedCategory)
    if (!category) return null

    const secondOrderGroup = category.secondOrderGroups[currentSecondOrderIndex]
    const key = `${selectedCategory}-${secondOrderGroup.name}`
    const mode = secondOrderModeChoices.get(key)

    // Second-order mode selection
    if (showSecondOrderMode) {
      return (
        <div className="bg-white min-h-screen flex flex-col">
          <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} />
          <div className={`flex-1 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <SecondOrderModePage
              category={selectedCategory}
              secondOrderGroup={secondOrderGroup}
              groupIndex={currentSecondOrderIndex}
              totalGroups={category.secondOrderGroups.length}
              existingChoice={mode}
              onNext={handleSecondOrderModeSelection}
              onBack={() => {
                setShowSecondOrderMode(false)
                setSelectedCategory(null)
                setShowCategorySelection(true)
              }}
            />
          </div>
          <Footer />
          <MenuScreen 
            user={user}
            onBack={handleBackFromMenu}
            onSignOut={handleSignOut}
            onAboutClick={handleAboutClick}
            isOpen={showMenuScreen}
          />
          <InstructionsOverlay 
            isOpen={showInstructionsOverlay} 
            onClose={() => setShowInstructionsOverlay(false)} 
          />
        </div>
      )
    }

    // Aggregate decision
    if (mode === 'aggregate') {
      // Find existing aggregate decision if any
      const existingDecision = hierarchicalResponses.find(
        r => r.category === selectedCategory && 
             r.secondOrder === secondOrderGroup.name && 
             r.isAggregate
      )

      return (
        <div className="bg-white min-h-screen flex flex-col">
          <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} />
          <div className={`flex-1 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <AggregateDecisionPage
              category={selectedCategory}
              secondOrderName={secondOrderGroup.name}
              groupIndex={currentSecondOrderIndex}
              totalGroups={category.secondOrderGroups.length}
              offenseCount={secondOrderGroup.firstOrderOffenses.length}
              existingDecision={existingDecision ? {
                decision: existingDecision.decision,
                lookBackYears: existingDecision.lookBackYears,
                notes: existingDecision.notes,
              } : undefined}
              onBack={() => {
                setShowSecondOrderMode(false)
                setSelectedCategory(null)
                setCurrentSecondOrderIndex(0)
                setShowCategorySelection(true)
              }}
              onNext={handleAggregateDecision}
            />
          </div>
          <Footer />
          <MenuScreen 
            user={user}
            onBack={handleBackFromMenu}
            onSignOut={handleSignOut}
            onAboutClick={handleAboutClick}
            isOpen={showMenuScreen}
          />
          <InstructionsOverlay 
            isOpen={showInstructionsOverlay} 
            onClose={() => setShowInstructionsOverlay(false)} 
          />
        </div>
      )
    }

    // Individual decisions
    if (mode === 'individual') {
      const offense = secondOrderGroup.firstOrderOffenses[currentFirstOrderIndex]
      const existingDecision = hierarchicalResponses.find(
        r => r.category === selectedCategory && 
             r.secondOrder === secondOrderGroup.name && 
             r.firstOrder === offense.name
      )

      return (
        <div className="bg-white min-h-screen flex flex-col">
          <Header onMenuClick={handleMenuClick} onInfoClick={handleInfoClick} />
          <div className={`flex-1 transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <IndividualDecisionPage
              key={`${selectedCategory}-${secondOrderGroup.name}-${currentFirstOrderIndex}`}
              category={selectedCategory}
              secondOrderName={secondOrderGroup.name}
              offense={offense.name}
              groupIndex={currentSecondOrderIndex}
              totalGroups={category.secondOrderGroups.length}
              offenseIndex={currentFirstOrderIndex}
              totalOffenses={secondOrderGroup.firstOrderOffenses.length}
              existingDecision={existingDecision ? {
                offense: existingDecision.firstOrder,
                decision: existingDecision.decision,
                lookBackYears: existingDecision.lookBackYears,
                notes: existingDecision.notes,
              } : undefined}
              onBack={handleBackFromHierarchical}
              onNext={handleIndividualDecision}
            />
          </div>
          <Footer />
          <MenuScreen 
            user={user}
            onBack={handleBackFromMenu}
            onSignOut={handleSignOut}
            onAboutClick={handleAboutClick}
            isOpen={showMenuScreen}
          />
          <InstructionsOverlay 
            isOpen={showInstructionsOverlay}
            onClose={() => setShowInstructionsOverlay(false)}
          />
        </div>
      )
    }
  }

  return null
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
