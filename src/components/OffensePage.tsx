import React, { useState } from 'react'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { Label } from './ui/label'
import { Slider } from './ui/slider'
import { Checkbox } from './ui/checkbox'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'

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
  const [lookbackEnabled, setLookbackEnabled] = useState(false)
  const [notes, setNotes] = useState('')

  // Map decision to radio value
  const decisionValue = decision === 'Always Eligible' ? 'display' : decision === 'Job Dependent' ? 'dispute' : 'review'

  // Reset look-back period when switching decisions
  const handleDecisionChange = (value: string) => {
    const newDecision = value === 'display' ? 'Always Eligible' : value === 'dispute' ? 'Job Dependent' : 'Always Review'
    setDecision(newDecision)
    if (newDecision === 'Always Eligible') {
      setLookBackYears(null)
      setLookbackEnabled(false)
    } else {
      if (lookBackYears === null) {
        setLookBackYears(1)
      }
      setLookbackEnabled(true)
    }
  }

  // Handle slider change
  const handleSliderChange = (values: number[]) => {
    setLookBackYears(values[0])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ offense, decision, lookBackYears, notes: notes.trim() || undefined })
  }

  // Convert years to slider value
  const sliderValue = lookBackYears !== null ? lookBackYears : 1

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category Section */}
      <div className="text-center mb-8">
        <p className="text-gray-400 text-sm mb-3">Matrix Configuration, Step {index + 1} of {total}</p>
        <h2 className="text-[32px] font-bold uppercase tracking-wide text-gray-900 mb-4">
          {offense}
        </h2>
      </div>

      {/* Options Section */}
      <div className="mb-8">
        <h3 className="text-gray-500 mb-4 uppercase tracking-wide text-center text-sm">
          Review option
        </h3>
        <RadioGroup 
          value={decisionValue} 
          onValueChange={handleDecisionChange} 
          className="space-y-4"
        >
          {[
            { id: 'display', label: 'Always Eligible', description: 'Approve in all cases', color: 'blue' },
            { id: 'dispute', label: 'Job Dependent', description: 'Review individual context', color: 'purple' },
            { id: 'review', label: 'Always Review', description: 'Requires manual decision', color: 'orange' }
          ].map((option) => (
            <div 
              key={option.id} 
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                decisionValue === option.id 
                  ? option.color === 'blue' 
                    ? 'border-blue-500 bg-blue-50' 
                    : option.color === 'purple'
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-[#F0D283] bg-[#F0D283]/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
              <div className="flex-1">
                <Label htmlFor={option.id} className="text-gray-900 cursor-pointer">
                  {option.label}
                </Label>
                <p className="text-gray-500 mt-0.5 text-sm">{option.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Lookback Period Section */}
      <div className={`space-y-4 mb-8 ${decision === 'Always Eligible' ? 'opacity-40 pointer-events-none' : ''}`}>
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="lookback" 
            checked={lookbackEnabled}
            onCheckedChange={(checked) => {
              setLookbackEnabled(checked as boolean)
              if (checked && lookBackYears === null) {
                setLookBackYears(1)
              }
            }}
            disabled={decision === 'Always Eligible'}
          />
          <Label 
            htmlFor="lookback" 
            className={decision === 'Always Eligible' ? "text-gray-900 cursor-not-allowed" : "text-gray-900 cursor-pointer"}
          >
            Enable Lookback Period
          </Label>
        </div>

        {/* Note when greyed out */}
        {decision === 'Always Eligible' && (
          <p className="text-gray-400 text-sm pl-7">
            If you choose 'Always Eligible' the lookback period is not necessary
          </p>
        )}

        {/* Year Slider */}
        {lookbackEnabled && (
          <div className="pl-7 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Years</span>
              <span className="text-pink-600 tabular-nums">
                {lookBackYears ?? 1} {lookBackYears === 1 ? 'year' : 'years'}
              </span>
            </div>
            <Slider
              value={[sliderValue]}
              onValueChange={handleSliderChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-gray-400 text-xs">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional, one sentence)</Label>
        <Textarea 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)} 
          rows={3}
          className="w-full"
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        <Button 
          type="button" 
          onClick={onBack} 
          disabled={index === 0}
          variant="outline"
          className="flex-1"
        >
          Back
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
        >
          Submit & Next
        </Button>
      </div>
    </form>
  )
}

export default OffensePage
