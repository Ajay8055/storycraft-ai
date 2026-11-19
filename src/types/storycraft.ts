export interface FeatureInput {
  featureName: string;
  featureDescription: string;
  businessContext: string;
  userPersona: string;
  constraints: string;
}

export interface UserStory {
  id: string;
  title: string;
  asA: string;
  iWant: string;
  soThat: string;
  priority: 'Must Have' | 'Should Have' | 'Could Have';
  notes: string;
}

export interface AcceptanceCriterion {
  id: string;
  storyRef: string;
  title: string;
  given: string;
  when: string;
  then: string;
}

export interface UserFlow {
  id: string;
  title: string;
  flowType: 'Happy Path' | 'Alternative Flow';
  actor: string;
  trigger: string;
  steps: string[];
  outcome: string;
}

export type EdgeCaseCategory =
  | 'Invalid Input'
  | 'Empty States'
  | 'Permissions'
  | 'Network Failures'
  | 'Boundary Conditions'
  | 'Duplicate Actions'
  | 'System Failures'
  | 'Other';

export interface EdgeCase {
  id: string;
  category: EdgeCaseCategory;
  scenario: string;
  expectedHandling: string;
  severity: 'High' | 'Medium' | 'Low';
}

export interface QaTestCase {
  testId: string;
  scenario: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface RequirementGapAnalysis {
  suppliedFacts: string[];
  assumptionsAndRecommendations: string[];
  missingInformationGaps: string[];
  clarifyingQuestions: string[];
  validationDisclaimer: string;
}

export interface StoryCraftOutput {
  userStories: UserStory[];
  acceptanceCriteria: AcceptanceCriterion[];
  flows: UserFlow[];
  edgeCases: EdgeCase[];
  qaTestCases: QaTestCase[];
  gapAnalysis: RequirementGapAnalysis;
}

export interface GenerationRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  input: FeatureInput;
  output: StoryCraftOutput;
}

export type NavView = 'dashboard' | 'generate' | 'history';

export type SectionKey =
  | 'userStories'
  | 'acceptanceCriteria'
  | 'flows'
  | 'edgeCases'
  | 'qaTestCases'
  | 'gapAnalysis';
