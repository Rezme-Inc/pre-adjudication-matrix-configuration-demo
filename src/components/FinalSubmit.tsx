import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import type { OffenseResponse } from './OffensePage'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { ConfirmationModal } from './ConfirmationModal'

export const FinalSubmit: React.FC<{
  user: { username: string }
  responses: OffenseResponse[]
  onBackToHome: () => void
}> = ({ user, responses, onBackToHome }) => {
  const [interestEmail, setInterestEmail] = useState('')
  const [status, setStatus] = useState<{ type: 'none' | 'loading' | 'error' | 'success'; message?: string }>({ type: 'none' })
  const [batchId, setBatchId] = useState<string | null>(null)
  const [showStartOverModal, setShowStartOverModal] = useState(false)

  const validateEmail = (email: string) => {
    const trimmed = email.trim()
    if (!trimmed) return null
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(trimmed) ? trimmed : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setStatus({ type: 'loading' })

    // Prepare the responses
    const responsesData = responses.map(r => ({
      offense_name: r.offense,
      decision_level: r.decision,
      look_back_period: r.lookBackYears,
      notes: r.notes || null
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
        // Update existing batch
        const { error: updateError } = await supabase
          .from('decisions_batch')
          .update({
            responses: responsesData,
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
            responses: responsesData,
            completed: true,
            submitted_at: new Date().toISOString()
          })

        if (insertError) throw insertError
      }

      // If user provided an interest email, save it separately
      const validatedInterestEmail = validateEmail(interestEmail)
      if (validatedInterestEmail) {
        const { error: emailError } = await supabase
          .from('interest_emails')
          .insert({
            email: validatedInterestEmail,
            submitted_at: new Date().toISOString()
          })

        if (emailError) {
          console.error('Error saving interest email:', emailError)
          // Don't fail the whole submission if email save fails
        }
      }

      setBatchId(finalBatchId)
      setStatus({ type: 'success', message: 'Submission successful!' })
    } catch (err) {
      console.error('Submission error:', err)
      setStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to submit. Please try again.'
      })
    }
  }

  const handleStartOver = async () => {
    try {
      // Delete existing batch
      await supabase
        .from('decisions_batch')
        .delete()
        .eq('username', user.username)

      // Reload page to start fresh
      window.location.reload()
    } catch (err) {
      console.error('Error deleting batch:', err)
      alert('Failed to delete responses. Please try again.')
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex justify-between items-center mb-4">
        <p className="text-gray-600">Your {responses.length} offense assessments have been successfully recorded.</p>
        <div className="flex gap-3">
          <Button
            onClick={onBackToHome}
            variant="outline"
          >
            Back to Home
          </Button>
          <Button
            onClick={() => setShowStartOverModal(true)}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
          >
            Start Over
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          marginTop: '16px'
        }}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label htmlFor="interestEmail" style={{ fontWeight: 500, fontSize: '15px' }}>Email (optional)</label>
            <small style={{ display: 'block', marginTop: 4, marginBottom: 12, color: '#666', lineHeight: '1.5' }}>
            If you would like to receive the results and resources from this session and access to a customized tool for HPS participants please enter your email address.</small>
            <input
              id="interestEmail"
              type="email"
              value={interestEmail}
              onChange={(e) => setInterestEmail(e.target.value)}
              placeholder="your.email@example.com"
              disabled={status.type === 'loading' || status.type === 'success'}
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
            disabled={status.type === 'loading' || status.type === 'success'}
            className="w-full"
          >
            {status.type === 'loading' 
              ? 'Submitting...' 
              : status.type === 'success' 
              ? 'Email Submitted ✓' 
              : 'Submit Email'}
          </Button>
        </div>
      </form>

      <div className="bg-gray-50 rounded-lg -mx-6">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-center py-2 pl-6 pr-3 text-sm font-semibold text-gray-700">Criminal Offense</th>
                <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Review Option</th>
                <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Lookback Period</th>
                <th className="text-center py-2 px-3 pr-6 text-sm font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r, i) => {
                const getDecisionBgColor = (decision: string) => {
                  if (decision === 'Always Review') return 'bg-amber-50'
                  if (decision === 'Job Dependent') return 'bg-purple-50'
                  if (decision === 'Always Eligible') return 'bg-blue-50'
                  return ''
                }
                return (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="text-center py-2 pl-6 pr-3 text-sm text-gray-900">{r.offense}</td>
                    <td className={`text-center py-2 px-3 text-sm text-gray-700 ${getDecisionBgColor(r.decision)}`}>{r.decision}</td>
                    <td className="text-center py-2 px-3 text-sm text-gray-700">
                      {r.lookBackYears !== null ? `${r.lookBackYears} ${r.lookBackYears === 1 ? 'year' : 'years'}` : 'N/A'}
                    </td>
                    <td className="text-center py-2 px-3 pr-6 text-sm text-gray-600">{r.notes || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="pb-4"></div>
      </div>

      {status.message && (
        <p className={`mt-4 p-3 rounded-md ${
          status.type === 'error' 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : status.type === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-gray-50 text-gray-700'
        }`}>
          {status.message}
        </p>
      )}

      {batchId && (
        <p className="mt-4 text-sm text-gray-500">
          Reference ID: <span className="font-mono">{batchId}</span>
        </p>
      )}

      <ConfirmationModal
        isOpen={showStartOverModal}
        title="Start Over?"
        message="This will permanently delete all your responses and take you back to the beginning. Are you sure you want to continue?"
        confirmText="Yes, delete all responses"
        cancelText="Return to results"
        onConfirm={handleStartOver}
        onCancel={() => setShowStartOverModal(false)}
        variant="danger"
      />
    </div>
  )
}

export default FinalSubmit
