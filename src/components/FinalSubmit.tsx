import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import type { OffenseResponse } from './OffensePage'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

export const FinalSubmit: React.FC<{ user: { username: string }; responses: OffenseResponse[] }> = ({ user, responses }) => {
  const [interestEmail, setInterestEmail] = useState('')
  const [status, setStatus] = useState<{ type: 'none' | 'loading' | 'error' | 'success'; message?: string }>({ type: 'none' })
  const [batchId, setBatchId] = useState<string | null>(null)

  const validateEmail = (email: string) => {
    const trimmed = email.trim()
    if (!trimmed) return null
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(trimmed) ? trimmed : null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setStatus({ type: 'loading' })

    // Prepare the payload that will go into Supabase
    const payload = {
      batch_id: crypto.randomUUID(), // Unique ID for this submission batch
      username: user.username,
      responses: responses.map(r => ({
        offense_name: r.offense,
        decision_level: r.decision,
        look_back_period: r.lookBackYears,
        notes: r.notes || null
      })),
      submitted_at: new Date().toISOString(),
    }

    try {
      // Submit the batch
      const { error: batchError } = await supabase
        .from('decisions_batch')
        .insert(payload)

      if (batchError) throw batchError

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

      setBatchId(payload.batch_id)
      setStatus({ type: 'success', message: 'Submission successful!' })
    } catch (err) {
      console.error('Submission error:', err)
      setStatus({ 
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to submit. Please try again.'
      })
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <p className="text-gray-600">Your {responses.length} offense assessments have been successfully recorded.</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label htmlFor="interestEmail">Email (optional)</label>
          <input
            id="interestEmail"
            type="email"
            value={interestEmail}
            onChange={(e) => setInterestEmail(e.target.value)}
            placeholder="your.email@example.com"
            disabled={status.type === 'loading' || status.type === 'success'}
          />
          <small style={{ display: 'block', marginTop: 4, color: '#666' }}>
          If you'd like to request a follow-up regarding this demo or wish to discuss the application further, please enter your email address.      </small>
        </div>
        <Button 
          type="submit" 
          disabled={status.type === 'loading' || status.type === 'success'}
          className="w-full"
        >
          {status.type === 'loading' ? 'Submitting...' : 'Submit Email'}
        </Button>
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
    </div>
  )
}

export default FinalSubmit
