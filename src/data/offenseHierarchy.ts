export type DecisionLevel = 'Always Eligible' | 'Job Dependent' | 'Always Review';

export interface FirstOrderOffense {
  name: string;
}

export interface SecondOrderGroup {
  name: string;
  firstOrderOffenses: FirstOrderOffense[];
}

export interface Category {
  name: string;
  secondOrderGroups: SecondOrderGroup[];
}

export interface HierarchicalResponse {
  category: string;
  secondOrder: string;
  firstOrder: string;
  isAggregate: boolean;
  decision: DecisionLevel;
  lookBackYears: number | null;
  notes?: string;
  job_specific_risk_tags?: string[] | null;
}

export const OFFENSE_HIERARCHY: Category[] = [
  {
    name: 'Drug',
    secondOrderGroups: [
      {
        name: 'Distribution of Controlled Substances',
        firstOrderOffenses: [
          { name: 'Distribution of Controlled Substances' },
          { name: 'Distribution of Marijuana' },
        ],
      },
      {
        name: 'Possession/Use of Controlled Substances',
        firstOrderOffenses: [
          { name: 'Possession/Use of Marijuana' },
          { name: 'Possession/Use of Controlled Substances (non-marijuana)' },
          { name: 'Drug Paraphernalia' },
        ],
      },
    ],
  },
  {
    name: 'Driving',
    secondOrderGroups: [
      {
        name: 'Driving While Intoxicated',
        firstOrderOffenses: [
          { name: 'Driving While Intoxicated' },
        ],
      },
    ],
  },
  {
    name: 'Public Order',
    secondOrderGroups: [
      {
        name: 'Family or Child Custody Related Offense',
        firstOrderOffenses: [
          { name: 'Family or Child Custody Related Offense' },
        ],
      },
      {
        name: 'Disorderly Conduct / Criminal Trespass',
        firstOrderOffenses: [
          { name: 'Invasion of Privacy' },
          { name: 'Criminal Trespass' },
          { name: 'Disorderly Conduct' },
          { name: 'Liquor Law Violation' },
        ],
      },
      {
        name: 'Court/Legal System Violation',
        firstOrderOffenses: [
          { name: 'Contempt of Court / Violate Court Order' },
          { name: 'Obstruction/Resisting' },
          { name: 'Bribery/Conflict of Interest' },
          { name: 'Escape from Custody / Prosecution' },
        ],
      },
      {
        name: 'Weapons Offense - Nonviolent',
        firstOrderOffenses: [
          { name: 'Weapons Offense - Nonviolent' },
        ],
      },
      {
        name: 'Parole or Probation Violation',
        firstOrderOffenses: [
          { name: 'Parole or Probation Violation' },
        ],
      },
      {
        name: 'Immigration Violation',
        firstOrderOffenses: [
          { name: 'Immigration Violation' },
        ],
      },
      {
        name: 'Prostitution',
        firstOrderOffenses: [
          { name: 'Prostitution / Commercialized Vice' },
        ],
      },
    ],
  },
  {
    name: 'Property',
    secondOrderGroups: [
      {
        name: 'Burglary/Theft',
        firstOrderOffenses: [
          { name: 'Burglary' },
          { name: 'Petty Theft (=<$500)' },
          { name: 'Grand Theft (>$500)' },
          { name: 'Sale or Receiving of Stolen Property' },
          { name: 'Destruction of Property' },
        ],
      },
      {
        name: 'Forgery, Fraud & Financial Crimes',
        firstOrderOffenses: [
          { name: 'Forgery, Fraud & Financial Crimes' },
        ],
      },
      {
        name: 'Arson',
        firstOrderOffenses: [
          { name: 'Arson' },
        ],
      },
    ],
  },
  {
    name: 'Violence',
    secondOrderGroups: [
      {
        name: 'Extortion/Threat',
        firstOrderOffenses: [
          { name: 'Extortion/Threat' },
        ],
      },
      {
        name: 'Murder',
        firstOrderOffenses: [
          { name: 'Murder' },
        ],
      },
      {
        name: 'Manslaughter',
        firstOrderOffenses: [
          { name: 'Voluntary Manslaughter' },
          { name: 'Vehicular Manslaughter' },
          { name: 'Involuntary Manslaughter' },
        ],
      },
      {
        name: 'Rape/Sexual Assault',
        firstOrderOffenses: [
          { name: 'Rape/Sexual Assault' },
          { name: 'Child Molestation' },
        ],
      },
      {
        name: 'Statutory Rape',
        firstOrderOffenses: [
          { name: 'Statutory Rape' },
        ],
      },
      {
        name: 'Kidnapping/Human Trafficking',
        firstOrderOffenses: [
          { name: 'Human Trafficking' },
          { name: 'Kidnapping' },
        ],
      },
      {
        name: 'Child Abuse',
        firstOrderOffenses: [
          { name: 'Child Abuse' },
        ],
      },
      {
        name: 'Robbery',
        firstOrderOffenses: [
          { name: 'Robbery' },
        ],
      },
      {
        name: 'Assault',
        firstOrderOffenses: [
          { name: 'Aggravated Assault' },
          { name: 'Simple Assault' },
          { name: 'Hit and Run' },
        ],
      },
    ],
  },
];

// Helper functions
export function getCategoryByName(categoryName: string): Category | undefined {
  return OFFENSE_HIERARCHY.find(cat => cat.name === categoryName);
}

export function getTotalSecondOrderGroups(categoryName: string): number {
  const category = getCategoryByName(categoryName);
  return category?.secondOrderGroups.length ?? 0;
}

export function getTotalFirstOrderOffenses(categoryName: string, secondOrderName: string): number {
  const category = getCategoryByName(categoryName);
  const secondOrder = category?.secondOrderGroups.find(so => so.name === secondOrderName);
  return secondOrder?.firstOrderOffenses.length ?? 0;
}
