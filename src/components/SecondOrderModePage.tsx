import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useState } from 'react';
import { SecondOrderGroup } from '../data/offenseHierarchy';

interface SecondOrderModePageProps {
  category: string;
  secondOrderGroup: SecondOrderGroup;
  groupIndex: number;
  totalGroups: number;
  existingChoice?: 'aggregate' | 'individual';
  onNext: (mode: 'aggregate' | 'individual') => void;
  onBack: () => void;
}

export function SecondOrderModePage({
  category,
  secondOrderGroup,
  groupIndex,
  totalGroups,
  existingChoice,
  onNext,
  onBack,
}: SecondOrderModePageProps) {
  const [mode, setMode] = useState<'aggregate' | 'individual'>(existingChoice || 'aggregate');

  const handleNext = () => {
    onNext(mode);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress indicator */}
          <div className="text-center text-sm text-gray-500 mb-6">
            {category} · Group {groupIndex + 1} of {totalGroups}
          </div>

          {/* Second-order group name */}
          <div 
            className="p-6 rounded-lg mb-6 text-center"
            style={{ backgroundColor: '#0F206C', color: 'white' }}
          >
            <h2 className="text-2xl font-bold">
              {secondOrderGroup.name}
            </h2>
          </div>

          {/* First-order offenses list */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">
              This group includes the following offenses:
            </h3>
            <ul className="list-disc list-inside space-y-2">
              {secondOrderGroup.firstOrderOffenses.map((offense) => (
                <li key={offense.name} className="text-gray-700">{offense.name}</li>
              ))}
            </ul>
          </div>

          {/* Mode selection */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-4 block text-gray-700">
              Do you want to aggregate decision for this offense group?
            </Label>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'aggregate' | 'individual')}>
              <div 
                className={`p-4 rounded-lg border-2 mb-3 transition-all duration-200 cursor-pointer ${
                  mode === 'aggregate' 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setMode('aggregate')}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="aggregate" id="aggregate" />
                  <Label htmlFor="aggregate" className="font-normal cursor-pointer flex-1">
                    <div className="font-semibold" style={{ color: '#0F206C' }}>Yes - Aggregate Decision</div>
                    <div className="text-sm text-gray-600">Apply one decision to all offenses in this group</div>
                  </Label>
                </div>
              </div>
              <div 
                className={`p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                  mode === 'individual' 
                    ? 'border-purple-500 bg-purple-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setMode('individual')}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="font-normal cursor-pointer flex-1">
                    <div className="font-semibold" style={{ color: '#0F206C' }}>No - Individual Decisions</div>
                    <div className="text-sm text-gray-600">Make individual decisions for each offense</div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <Button
              onClick={onBack}
              variant="outline"
              className="px-6"
            >
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="px-6"
              style={{ backgroundColor: '#0F206C' }}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
