import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import type { OffenseResponse } from './OffensePage'

export const FinalSubmit: React.FC<{ user: { firstName: string; lastName: string }; responses: OffenseResponse[] }> = ({ user, responses }) => {
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
      submitted_by_name: `${user.firstName} ${user.lastName}`,
      recipient_emails: [], // Empty array since email is no longer required
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
    <div style={{ maxWidth: 900 }}>
      <p>You're about to submit the following {responses.length} offense assessments.</p>

      <div style={{ marginBottom: 12 }}>
        <h3>Summary</h3>
        <ol>
          {responses.map((r, i) => (
            <li key={i}><strong>{r.offense}</strong> — {r.decision} (look-back: {r.lookBackYears} yrs){r.notes ? ` — ${r.notes}` : ''}</li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: 16 }}>
          <label htmlFor="interestEmail">Email (optional - if you're interested in seeing more)</label>
          <input
            id="interestEmail"
            type="email"
            value={interestEmail}
            onChange={(e) => setInterestEmail(e.target.value)}
            placeholder="your.email@example.com"
            disabled={status.type === 'loading' || status.type === 'success'}
          />
          <small style={{ display: 'block', marginTop: 4, color: '#666' }}>
            Optional: Enter your email if you'd like to receive updates or see more information.
          </small>
        </div>
        <button 
          type="submit" 
          disabled={status.type === 'loading' || status.type === 'success'}
        >
          {status.type === 'loading' ? 'Submitting...' : 'Submit All'}
        </button>
      </form>

        {status.message && (
          <p style={{ 
            marginTop: 12,
            color: status.type === 'error' ? '#dc2626' : status.type === 'success' ? '#16a34a' : 'inherit'
          }}>
            {status.message}
          </p>
        )}

        {batchId && (
          <p style={{ marginTop: 12, fontSize: '0.875em', color: '#666' }}>
            Reference ID: {batchId}
          </p>
        )}
    </div>
  )
}

export default FinalSubmit
