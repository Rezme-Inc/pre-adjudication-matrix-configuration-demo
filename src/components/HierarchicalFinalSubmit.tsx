import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import type { HierarchicalResponse } from '../data/offenseHierarchy'
import { Button } from './ui/button'
import { ConfirmationModal } from './ConfirmationModal'
import { NO_TIME_LIMIT } from '../App'

export const HierarchicalFinalSubmit: React.FC<{
  user: { username: string }
  responses: HierarchicalResponse[]
  onBackToCategories: () => void
}> = ({ user, responses, onBackToCategories }) => {
  const [status, setStatus] = useState<{ type: 'none' | 'loading' | 'error' | 'success'; message?: string }>({ type: 'none' })
  const [batchId, setBatchId] = useState<string | null>(null)
  const [showStartOverModal, setShowStartOverModal] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setStatus({ type: 'loading' })

    // Prepare the responses for database
    const hierarchicalData = responses.map(r => ({
      category: r.category,
      second_order: r.secondOrder,
      first_order: r.firstOrder,
      is_aggregate: r.isAggregate,
      decision_level: r.decision,
      look_back_period: r.lookBackYears,
      notes: r.notes || null,
    }))

    try {
      // Check if batch exists for this username
      const { data: existingBatch, error: fetchError } = await supabase
        .from('decisions_batch')
        .select('batch_id')
        .eq('username', user.username)
        .single()

      let finalBatchId: string

      if (existingBatch) {
        // Update existing batch and mark as completed
        const { error: updateError } = await supabase
          .from('decisions_batch')
          .update({
            hierarchical_responses: hierarchicalData,
            completed: true,
            submitted_at: new Date().toISOString()
          })
          .eq('batch_id', existingBatch.batch_id)

        if (updateError) throw updateError
        finalBatchId = existingBatch.batch_id
      } else {
        // Insert new batch (shouldn't happen with new flow, but keep as fallback)
        finalBatchId = crypto.randomUUID()
        const { error: insertError } = await supabase
          .from('decisions_batch')
          .insert({
            batch_id: finalBatchId,
            username: user.username,
            submitted_by_name: user.username,
            recipient_emails: [],
            hierarchical_responses: hierarchicalData,
            completed: true,
            submitted_at: new Date().toISOString()
          })

        if (insertError) throw insertError
      }

      setBatchId(finalBatchId)
      setStatus({ type: 'success', message: 'Submission successful!' })
    } catch (err) {
      console.error('Submission error:', err)
      setStatus({
        type: 'error',
        message: 'Failed to submit. Please try again.'
      })
    }
  }

  const handleStartOver = () => {
    setShowStartOverModal(false)
    onBackToCategories()
  }

  const formatLookBackPeriod = (years: number): string => {
    if (years === 0) return 'N/A (Always Eligible)'
    if (years >= NO_TIME_LIMIT) return 'No Time Limit'
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }

  // Group responses by category
  const responsesByCategory = responses.reduce((acc, response) => {
    if (!acc[response.category]) {
      acc[response.category] = []
    }
    acc[response.category].push(response)
    return acc
  }, {} as Record<string, HierarchicalResponse[]>)

  if (status.type === 'success') {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
            <p className="text-gray-600">Your decisions have been submitted.</p>
          </div>
          
          {batchId && (
            <div className="bg-gray-50 rounded p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Batch ID</p>
              <p className="font-mono text-sm text-gray-900 break-all">{batchId}</p>
            </div>
          )}

          <Button
            onClick={() => window.location.reload()}
            className="w-full bg-[#0F206C] hover:bg-[#0a1855] text-white"
          >
            Done
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-screen p-6 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-4xl w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Decisions</h2>

          <div className="space-y-6 mb-8">
            {Object.entries(responsesByCategory).map(([category, categoryResponses]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-3">
                  {categoryResponses.map((response, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{response.firstOrder}</p>
                          <p className="text-sm text-gray-600">{response.secondOrder}</p>
                        </div>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {response.isAggregate ? 'Aggregate' : 'Individual'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Decision: </span>
                          <span className="font-medium text-gray-900">{response.decision}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Look-back: </span>
                          <span className="font-medium text-gray-900">{formatLookBackPeriod(response.lookBackYears)}</span>
                        </div>
                      </div>
                      {response.notes && (
                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">Notes: </span>
                          <span className="text-gray-900">{response.notes}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {status.type === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <p className="text-red-800">{status.message}</p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowStartOverModal(true)}
              className="flex-1"
              disabled={status.type === 'loading'}
            >
              Back to Categories
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#0F206C] hover:bg-[#0a1855] text-white"
              disabled={status.type === 'loading'}
            >
              {status.type === 'loading' ? 'Submitting...' : 'Submit All Decisions'}
            </Button>
          </div>
        </form>
      </div>

      <ConfirmationModal
        isOpen={showStartOverModal}
        onClose={() => setShowStartOverModal(false)}
        onConfirm={handleStartOver}
        title="Go Back to Categories?"
        message="You can return to review or modify your decisions. Your progress is saved."
        confirmText="Go Back"
        cancelText="Stay Here"
      />
    </>
  )
}
