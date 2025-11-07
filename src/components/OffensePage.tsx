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
  const [showSlider, setShowSlider] = useState(false)
  const [notes, setNotes] = useState('')

  // Map decision to radio value
  const decisionValue = decision === 'Always Eligible' ? 'display' : decision === 'Job Dependent' ? 'dispute' : 'review'

  // Reset look-back period when switching decisions
  const handleDecisionChange = (value: string) => {
    const newDecision = value === 'display' ? 'Always Eligible' : value === 'dispute' ? 'Job Dependent' : 'Always Review'
    setDecision(newDecision)
    if (newDecision === 'Always Eligible') {
      // Fade out slider first, then checkbox
      setShowSlider(false)
      setTimeout(() => {
        setLookbackEnabled(false)
        setLookBackYears(null)
      }, 200)
    } else {
      // Fade in checkbox first, then slider
      if (lookBackYears === null) {
        setLookBackYears(1)
      }
      setLookbackEnabled(true)
      setTimeout(() => {
        setShowSlider(true)
      }, 200)
    }
  }

  // Handle slider change - round to nearest integer for smooth movement but integer locking
  const handleSliderChange = (values: number[]) => {
    const rounded = Math.round(values[0])
    setLookBackYears(rounded)
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
      <div className="text-center mb-10">
        <p className="text-gray-400 text-sm mb-3">Matrix Configuration, Step {index + 1} of {total}</p>
        <div className="flex justify-center">
          <div className="bg-[#0F206C] text-white rounded-md px-3 py-2 inline-block">
            <h2 className="text-xl tracking-wide">
              {offense}
            </h2>
          </div>
        </div>
      </div>

      {/* Options Section */}
      <div className="mb-10">
        <h3 className="text-gray-500 mb-8 uppercase tracking-wide text-center text-sm">
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
          ].map((option) => {
            const isSelected = decisionValue === option.id
            const selectedStyles = {
              'display': 'border-gray-900 bg-blue-50',
              'dispute': 'border-gray-900 bg-purple-50',
              'review': 'border-gray-900 bg-orange-50'
            }
            return (
            <label
              key={option.id}
              htmlFor={option.id}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isSelected 
                  ? selectedStyles[option.id as keyof typeof selectedStyles]
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <RadioGroupItem value={option.id} id={option.id} className="mt-0.5" />
              <div className="flex-1">
                <span className="text-gray-900 cursor-pointer">
                  {option.label}
                </span>
                <p className="text-gray-500 mt-0.5 text-sm">{option.description}</p>
              </div>
            </label>
            )
          })}
        </RadioGroup>
      </div>

      {/* Lookback Period Section */}
      <div className={`space-y-2 mb-10 transition-all duration-300 ease-in-out ${
        decision === 'Always Eligible' 
          ? 'opacity-40 pointer-events-none' 
          : 'opacity-100'
      }`}>
        <div className="flex items-center space-x-3">
          <Checkbox 
            id="lookback" 
            checked={lookbackEnabled}
            onCheckedChange={(checked) => {
              if (checked) {
                setLookbackEnabled(true)
                if (lookBackYears === null) {
                  setLookBackYears(1)
                }
                setTimeout(() => {
                  setShowSlider(true)
                }, 200)
              } else {
                setShowSlider(false)
                setTimeout(() => {
                  setLookbackEnabled(false)
                }, 200)
              }
            }}
            disabled={decision === 'Always Eligible'}
          />
          <Label 
            htmlFor="lookback" 
            className={`transition-colors duration-300 ${
              decision === 'Always Eligible' 
                ? "text-gray-900 cursor-not-allowed" 
                : "text-gray-900 cursor-pointer"
            }`}
          >
            Enable Lookback Period
          </Label>
        </div>

        {/* Note when greyed out */}
        <div 
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            decision === 'Always Eligible' 
              ? 'opacity-100 max-h-20' 
              : 'opacity-0 max-h-0'
          }`}
        >
          <p className="text-gray-400 text-sm pl-7">
            If you choose 'Always Eligible' the lookback period is not necessary
          </p>
        </div>

        {/* Year Slider */}
        <div 
          className={`space-y-3 transition-all duration-300 ease-in-out overflow-hidden mt-2 ${
            showSlider && lookbackEnabled
              ? 'opacity-100 max-h-96' 
              : 'opacity-0 max-h-0'
          }`}
        >
          <div className="flex items-center justify-center">
            <span className="text-[#0F206C] tabular-nums text-lg font-bold">
              {lookBackYears ?? 1} {lookBackYears === 1 ? 'year' : 'years'}
            </span>
          </div>
          <Slider
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            min={1}
            max={10}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-gray-400 text-xs">
            <span>1</span>
            <span>10</span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="space-y-3 mb-6">
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
      <div className="flex gap-3 pt-6">
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
