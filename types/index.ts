// Task Types
export type TaskType = 'auto' | 'personal' | 'software' | 'business' | 'marketing' | 'financial';

// Personal Plan Types
export interface BudgetItem {
  name: string;
  amount: number;
  quantity?: number;
  notes?: string;
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  items: BudgetItem[];
}

export interface Budget {
  total: number;
  currency: string;
  categories: BudgetCategory[];
  remaining?: number;
}

export interface ExecutionStep {
  id: string;
  action: string;
  details: string;
  location?: string;
  tips?: string[];
  completed: boolean;
}

export interface PersonalUnclearPoint {
  id: string;
  issue: string;
  impact: string;
  suggestedResolution: string;
}

export interface PersonalPlanResult {
  detectedType: 'personal';
  taskName: string;
  summary: string;
  budget?: Budget;
  executionSteps: ExecutionStep[];
  constraints: string[];
  checkpoints: string[];
  timeline?: string;
  unclearPoints: PersonalUnclearPoint[];
  risks: Risk[];
}

// Software Requirement Types
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

export interface SoftwareRequirementResult {
  detectedType: 'software';
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

// Business Task Result Type
export interface BusinessTaskResult {
  detectedType: 'business';
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

// Marketing Campaign Result Type
export interface MarketingCampaignResult {
  detectedType: 'marketing';
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

// Financial Planning Result Type
export interface FinancialPlanningResult {
  detectedType: 'financial';
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

// Union type for all formatted results
export type FormattedResult = PersonalPlanResult | SoftwareRequirementResult | BusinessTaskResult | MarketingCampaignResult | FinancialPlanningResult;

export interface SavedNote extends Omit<FormattedNote, 'unclearPoints'> {
  id: string;
  detectedType: TaskType;
  rawInput: string;
  createdAt: string;
  // Include all FormattedNote fields except unclearPoints
  taskName: string;
  summary: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedComplexity: 'Simple' | 'Moderate' | 'Complex';
  functionalRequirements: FunctionalRequirement[];
  technicalRequirements: TechnicalRequirement[];
  userStories: UserStory[];
  unclearPoints?: (UnclearPoint | PersonalUnclearPoint)[];
  questionsForStakeholder: StakeholderQuestion[];
  assumptions: string[];
  outOfScope: string[];
  dependencies: string[];
  risks: Risk[];
  // Personal plan specific fields
  budget?: Budget;
  executionSteps?: ExecutionStep[];
  constraints?: string[];
  checkpoints?: string[];
  timeline?: string;
}



export interface ErrorResponse {
  error: string;
}

// Task Type Labels for UI
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  auto: 'Auto-detect',
  personal: 'Personal Plan',
  software: 'Software Requirement',
  business: 'Business Task',
  marketing: 'Marketing Campaign',
  financial: 'Financial Planning'
};
