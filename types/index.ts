export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface TechnicalRequirement {
  id: string;
  title: string;
  description: string;
}

export interface UserStory {
  id: string;
  persona: string;
  action: string;
  benefit: string;
}

export interface UnclearPoint {
  id: string;
  issue: string;
  impact: string;
  suggestedResolution: string;
}

export interface StakeholderQuestion {
  id: string;
  question: string;
  context: string;
  options: string[];
}

export interface Risk {
  risk: string;
  mitigation: string;
}

export interface FormattedNote {
  taskName: string;
  summary: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedComplexity: 'Simple' | 'Moderate' | 'Complex';
  functionalRequirements: FunctionalRequirement[];
  technicalRequirements: TechnicalRequirement[];
  userStories: UserStory[];
  unclearPoints: UnclearPoint[];
  questionsForStakeholder: StakeholderQuestion[];
  assumptions: string[];
  outOfScope: string[];
  dependencies: string[];
  risks: Risk[];
}

export interface SavedNote extends FormattedNote {
  id: string;
  rawInput: string;
  createdAt: string;
}

export interface ErrorResponse {
  error: string;
}
