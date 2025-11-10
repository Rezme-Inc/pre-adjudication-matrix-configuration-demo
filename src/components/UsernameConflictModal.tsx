import React from 'react'
import { Button } from './ui/button'

export interface UsernameConflictModalProps {
  isOpen: boolean
  username: string
  isCompleted: boolean
  onConfirmIdentity: () => void
  onDenyIdentity: () => void
  onContinue?: () => void
  onStartOver?: () => void
  onChangeUsername?: () => void
}

export const UsernameConflictModal: React.FC<UsernameConflictModalProps> = ({
  isOpen,
  username,
  isCompleted,
  onConfirmIdentity,
  onDenyIdentity,
  onContinue,
  onStartOver,
  onChangeUsername
}) => {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
      pointerEvents: 'auto'
    }}>
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
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          zIndex: 9999,
          maxWidth: '500px',
          width: '90%',
          padding: '24px'
        }}
      >
        {isCompleted ? (
          // Scenario 1: Completed response exists
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Username Already Exists</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              A completed response already exists for the username <strong>"{username}"</strong>.
              Are you the person who submitted this response?
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={onConfirmIdentity}
                className="w-full bg-[#0F206C] hover:bg-[#0a1855]"
              >
                Yes, show my results
              </Button>
              <Button
                onClick={onDenyIdentity}
                variant="outline"
                className="w-full"
              >
                No, let me choose a different username
              </Button>
            </div>
          </>
        ) : (
          // Scenario 2: Incomplete response exists
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Resume Your Progress?</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              An incomplete response was found for <strong>"{username}"</strong>.
              Would you like to continue where you left off or start over?
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={onContinue}
                className="w-full bg-[#0F206C] hover:bg-[#0a1855]"
              >
                Continue where I left off
              </Button>
              <Button
                onClick={onStartOver}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50"
              >
                Start over (will delete previous responses)
              </Button>
              <Button
                onClick={onChangeUsername}
                variant="outline"
                className="w-full"
              >
                Change username
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UsernameConflictModal
