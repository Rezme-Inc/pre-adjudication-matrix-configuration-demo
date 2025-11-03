import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import type { OffenseResponse } from './OffensePage'

export const FinalSubmit: React.FC<{ user: { firstName: string; lastName: string }; responses: OffenseResponse[] }> = ({ user, responses }) => {
  const [emails, setEmails] = useState('')
  const [status, setStatus] = useState<{ type: 'none' | 'loading' | 'error' | 'success'; message?: string }>({ type: 'none' })
  const [batchId, setBatchId] = useState<string | null>(null)

  const validateEmails = (raw: string) => {
    const arr = raw.split(',').map((s) => s.trim()).filter(Boolean)
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return arr.every((e) => re.test(e)) ? arr : null
  }

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const list = validateEmails(emails)
    if (!list || list.length === 0) {
        setStatus({ type: 'error', message: 'Please provide at least one valid email (comma-separated if multiple).' })
      return
    }

      setStatus({ type: 'loading' })

      // Prepare the payload that will go into Supabase
    const payload = {
        batch_id: crypto.randomUUID(), // Unique ID for this submission batch
        submitted_by_name: `${user.firstName} ${user.lastName}`,
        recipient_emails: list,
        responses: responses.map(r => ({
          offense_name: r.offense,
          decision_level: r.decision,
          look_back_period: r.lookBackYears,
          notes: r.notes || null
        })),
        submitted_at: new Date().toISOString(),
    }

      try {
        const { error } = await supabase
          .from('decisions_batch')
          .insert(payload)

        if (error) throw error

        setBatchId(payload.batch_id)
        setStatus({ type: 'success', message: 'Submission successful! The recipients will be notified.' })
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
      <p>You're about to submit the following {responses.length} offense assessments. Please provide one or more recipient emails to receive the summary.</p>

      <div style={{ marginBottom: 12 }}>
        <h3>Summary</h3>
        <ol>
          {responses.map((r, i) => (
            <li key={i}><strong>{r.offense}</strong> — {r.decision} (look-back: {r.lookBackYears} yrs){r.notes ? ` — ${r.notes}` : ''}</li>
          ))}
        </ol>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emails">Recipient email(s) (comma-separated)</label>
            <input
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="reviewer@example.com,ops@example.com"
              disabled={status.type === 'loading' || status.type === 'success'}
            />
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
