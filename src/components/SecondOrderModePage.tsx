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
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {secondOrderGroup.firstOrderOffenses.map((offense) => (
                <li key={offense.name}>{offense.name}</li>
              ))}
            </ul>
          </div>

          {/* Mode selection */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <Label className="text-base font-semibold mb-4 block">
              Do you want to aggregate decision for this offense group?
            </Label>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'aggregate' | 'individual')}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="aggregate" id="aggregate" />
                <Label htmlFor="aggregate" className="font-normal cursor-pointer">
                  Yes - Apply one decision to all offenses in this group
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="individual" id="individual" />
                <Label htmlFor="individual" className="font-normal cursor-pointer">
                  No - Make individual decisions for each offense
                </Label>
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
