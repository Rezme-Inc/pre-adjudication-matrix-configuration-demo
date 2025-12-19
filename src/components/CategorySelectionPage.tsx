import { Button } from './ui/button';

interface CategorySelectionPageProps {
  onSelectCategory: (category: string) => void;
  onBack: () => void;
}

const CATEGORIES = [
  { name: 'Drug', description: 'Drug-related offenses' },
  { name: 'Driving', description: 'Driving-related offenses' },
  { name: 'Public Order', description: 'Public order offenses' },
  { name: 'Property', description: 'Property-related offenses' },
  { name: 'Violence', description: 'Violent offenses' },
];

export function CategorySelectionPage({ onSelectCategory, onBack }: CategorySelectionPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center mb-2" style={{ color: '#0F206C' }}>
              Select Offense Category
            </h1>
            <p className="text-center text-gray-600">
              Choose a category to begin making decisions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {CATEGORIES.map((category) => (
              <button
                key={category.name}
                onClick={() => onSelectCategory(category.name)}
                className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all duration-200 text-left hover:shadow-md"
                style={{ 
                  backgroundColor: 'white',
                }}
              >
                <div className="text-xl font-semibold mb-2" style={{ color: '#0F206C' }}>
                  {category.name}
                </div>
                <div className="text-sm text-gray-600">
                  {category.description}
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onBack}
              variant="outline"
              className="px-6"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
