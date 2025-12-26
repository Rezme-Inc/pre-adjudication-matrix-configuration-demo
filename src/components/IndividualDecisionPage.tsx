import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { NO_TIME_LIMIT } from '../App';
import { DecisionLevel } from '../data/offenseHierarchy';

export interface IndividualDecisionData {
  offense: string;
  decision: DecisionLevel;
  lookBackYears: number;
  notes?: string;
}

interface IndividualDecisionPageProps {
  category: string;
  secondOrderName: string;
  offense: string;
  groupIndex: number;
  totalGroups: number;
  offenseIndex: number;
  totalOffenses: number;
  existingDecision?: IndividualDecisionData;
  onBack: () => void;
  onNext: (decision: IndividualDecisionData) => void;
}

export function IndividualDecisionPage({
  category,
  secondOrderName,
  offense,
  groupIndex,
  totalGroups,
  offenseIndex,
  totalOffenses,
  existingDecision,
  onBack,
  onNext,
}: IndividualDecisionPageProps) {
  const [decision, setDecision] = useState<DecisionLevel>(
    existingDecision?.decision || 'Always Eligible'
  );
  const [lookBackYears, setLookBackYears] = useState<number>(
    existingDecision?.lookBackYears ?? 0
  );
  const [lookbackEnabled, setLookbackEnabled] = useState(
    existingDecision?.decision !== 'Always Eligible' && 
    existingDecision?.lookBackYears !== NO_TIME_LIMIT && 
    existingDecision?.lookBackYears !== 0
  );
  const [showSlider, setShowSlider] = useState(
    existingDecision?.decision !== 'Always Eligible' && 
    existingDecision?.lookBackYears !== NO_TIME_LIMIT && 
    existingDecision?.lookBackYears !== 0
  );
  const [notes, setNotes] = useState(existingDecision?.notes || '');

  const decisionValue = decision === 'Always Eligible' ? 'display' : decision === 'Job Dependent' ? 'dispute' : 'review';

  const handleDecisionChange = (value: string) => {
    const newDecision = value === 'display' ? 'Always Eligible' : value === 'dispute' ? 'Job Dependent' : 'Always Review';
    setDecision(newDecision);
    if (newDecision === 'Always Eligible') {
      setShowSlider(false);
      setTimeout(() => {
        setLookbackEnabled(false);
        setLookBackYears(0);
      }, 200);
    } else {
      if (lookBackYears === 0 || lookBackYears === NO_TIME_LIMIT) {
        setLookBackYears(1);
      }
      setLookbackEnabled(true);
      setTimeout(() => {
        setShowSlider(true);
      }, 200);
    }
  };

  const handleSliderChange = (values: number[]) => {
    const rounded = Math.round(values[0]);
    setLookBackYears(Math.max(1, rounded));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const response: IndividualDecisionData = {
      offense,
      decision,
      lookBackYears,
      notes: notes.trim() || undefined
    };

    onNext(response);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Breadcrumb and progress */}
          <div className="text-center text-sm text-gray-500 mb-2">
            {category} → {secondOrderName}
          </div>
          <div className="text-center text-sm text-gray-500 mb-6">
            Group {groupIndex + 1} of {totalGroups} · Offense {offenseIndex + 1} of {totalOffenses}
          </div>

          {/* Offense name */}
          <div 
            className="p-6 rounded-lg mb-6 text-center"
            style={{ backgroundColor: '#0F206C', color: 'white' }}
          >
            <h2 className="text-2xl font-bold">
              {offense}
            </h2>
          </div>

          {/* Decision Level */}
          <div className="mb-8">
            <Label className="text-lg font-semibold mb-4 block">Decision Level</Label>
            <RadioGroup value={decisionValue} onValueChange={handleDecisionChange}>
              <div className="flex items-start space-x-3 mb-4 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                <RadioGroupItem value="display" id="display" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="display" className="font-semibold text-blue-900 cursor-pointer block mb-1">
                    Always Eligible
                  </Label>
                  <p className="text-sm text-blue-800">
                    Display on Fair Chance Application
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 mb-4 p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
                <RadioGroupItem value="dispute" id="dispute" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="dispute" className="font-semibold text-purple-900 cursor-pointer block mb-1">
                    Job Dependent
                  </Label>
                  <p className="text-sm text-purple-800">
                    Disputes/conflicts with essential job functions
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 mb-4 p-4 rounded-lg bg-amber-50 border-2 border-amber-200">
                <RadioGroupItem value="review" id="review" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="review" className="font-semibold text-amber-900 cursor-pointer block mb-1">
                    Always Review
                  </Label>
                  <p className="text-sm text-amber-800">
                    Always send to individualized assessment
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Look-Back Period */}
          <div 
            className={`mb-8 transition-opacity duration-300 ${decision === 'Always Eligible' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          >
            <Label className="text-lg font-semibold mb-4 block">Look-Back Period</Label>
            
            <div className="flex items-center space-x-3 mb-4">
              <Checkbox
                id="enable-lookback"
                checked={!lookbackEnabled}
                onCheckedChange={(checked) => {
                  setLookbackEnabled(!checked);
                  if (checked) {
                    setLookBackYears(NO_TIME_LIMIT);
                    setShowSlider(false);
                  } else {
                    setLookBackYears(1);
                    setShowSlider(true);
                  }
                }}
              />
              <Label htmlFor="enable-lookback" className="cursor-pointer font-normal">
                No time limit (consider all convictions regardless of age)
              </Label>
            </div>

            <div 
              className={`transition-all duration-300 ${showSlider ? 'opacity-100 max-h-32' : 'opacity-0 max-h-0 overflow-hidden'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Consider convictions from the last:</span>
                <span className="text-lg font-semibold" style={{ color: '#0F206C' }}>
                  {lookBackYears >= 10 ? '10+ years' : `${lookBackYears} ${lookBackYears === 1 ? 'year' : 'years'}`}
                </span>
              </div>
              <Slider
                value={[lookBackYears]}
                onValueChange={handleSliderChange}
                min={1}
                max={10}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 year</span>
                <span>10+ years</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <Label htmlFor="notes" className="text-lg font-semibold mb-2 block">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional context or reasoning for this decision..."
              className="min-h-[100px]"
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="px-6"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="px-6"
              style={{ backgroundColor: '#0F206C' }}
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
