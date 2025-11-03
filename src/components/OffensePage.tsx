import React, { useState } from 'react'

export type OffenseResponse = {
  offense: string
  decision: 'Always Eligible' | 'Job Dependent' | 'Always Review'
  lookBackYears: number | null
  notes?: string
}

export const OffensePage: React.FC<{
  offense: string
  index: number
  total: number
  onBack: () => void
  onNext: (resp: OffenseResponse) => void
}> = ({ offense, index, total, onBack, onNext }) => {
  const [decision, setDecision] = useState<'Always Eligible' | 'Job Dependent' | 'Always Review'>('Always Eligible')
  const [lookBackYears, setLookBackYears] = useState<number | null>(null)
  const [notes, setNotes] = useState('')

  // Reset look-back period when switching decisions
  const handleDecisionChange = (newDecision: 'Always Eligible' | 'Job Dependent' | 'Always Review') => {
    setDecision(newDecision)
    if (newDecision === 'Always Eligible') {
      setLookBackYears(null)
    } else if (lookBackYears === null) {
      // Set a default value when switching from Always Eligible to other options
      setLookBackYears(1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ offense, decision, lookBackYears, notes: notes.trim() || undefined })
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 800 }}>
      <h2>{offense}</h2>

      <section style={{ marginBottom: 12 }}>
        <strong>Voting Options</strong>
        <p>
          Please classify the offense above. Choose the most appropriate decision:
          <ul>
            <li><strong>Always Eligible</strong> — candidate should always be eligible.</li>
            <li><strong>Job Dependent</strong> — eligibility depends on the role/context.</li>
            <li><strong>Always Review</strong> — this should always be reviewed by a human.</li>
          </ul>
          Provide a short look-back period in years and an optional one-sentence rationale.
        </p>
      </section>

      <div className="form-group">
        <label>Decisions</label>
        <div>
          <label style={{ marginRight: 12 }}>
            <input 
              type="radio" 
              name="decision" 
              value="Always Eligible" 
              checked={decision === 'Always Eligible'} 
              onChange={() => handleDecisionChange('Always Eligible')} 
            /> Always Eligible
          </label>
          <label style={{ marginRight: 12 }}>
            <input 
              type="radio" 
              name="decision" 
              value="Job Dependent" 
              checked={decision === 'Job Dependent'} 
              onChange={() => handleDecisionChange('Job Dependent')} 
            /> Job Dependent
          </label>
          <label>
            <input 
              type="radio" 
              name="decision" 
              value="Always Review" 
              checked={decision === 'Always Review'} 
              onChange={() => handleDecisionChange('Always Review')} 
            /> Always Review
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="lookback">
          Look-back period (years)
          {decision === 'Always Eligible' && (
            <span style={{ marginLeft: '8px', color: '#666', fontSize: '0.9em' }}>
              (Not applicable for Always Eligible)
            </span>
          )}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            id="lookback"
            type="range"
            min={1}
            max={10}
            value={lookBackYears ?? 1}
            onChange={(e) => setLookBackYears(Number(e.target.value))}
            disabled={decision === 'Always Eligible'}
            style={{ flex: 1 }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>
            {decision === 'Always Eligible' ? '—' : `${lookBackYears ?? 1} yr${(lookBackYears ?? 1) !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">Notes (optional, one sentence)</label>
        <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" onClick={onBack} disabled={index === 0}>Back</button>
        <button type="submit">Submit & Next</button>
      </div>
    </form>
  )
}

export default OffensePage
