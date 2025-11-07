import React, { useState } from 'react'
import { supabase } from '../supabaseClient'
import type { OffenseResponse } from './OffensePage'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'

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
    <div className="max-w-3xl space-y-6">
      <p className="text-gray-600">You're about to submit the following {responses.length} offense assessments. Please provide one or more recipient emails to receive the summary.</p>

      <div className="bg-gray-50 rounded-lg -mx-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 px-6 pt-4">Summary</h3>
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
              {responses.map((r, i) => (
                <tr key={i} className="border-b border-gray-200 hover:bg-gray-100">
                  <td className="text-center py-2 pl-6 pr-3 text-sm text-gray-900">{r.offense}</td>
                  <td className="text-center py-2 px-3 text-sm text-gray-700">{r.decision}</td>
                  <td className="text-center py-2 px-3 text-sm text-gray-700">
                    {r.lookBackYears !== null ? `${r.lookBackYears} ${r.lookBackYears === 1 ? 'year' : 'years'}` : 'N/A'}
                  </td>
                  <td className="text-center py-2 px-3 pr-6 text-sm text-gray-600">{r.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pb-4"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="emails">Recipient email(s) (comma-separated)</Label>
          <Input
            id="emails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="reviewer@example.com,ops@example.com"
            disabled={status.type === 'loading' || status.type === 'success'}
          />
        </div>
        <Button 
          type="submit" 
          disabled={status.type === 'loading' || status.type === 'success'}
          className="w-full"
        >
          {status.type === 'loading' ? 'Submitting...' : 'Submit All'}
        </Button>
      </form>

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
