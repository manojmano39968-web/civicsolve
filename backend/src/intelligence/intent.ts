import { SearchIntent } from '@civicsolve/shared';

/**
 * Layer 5: Intent Detection
 * Classifies user prompt into operational civic problem intent categories.
 */

const PROBLEM_SIGNALS = [
  'not working',
  'leaking',
  'broken',
  'damaged',
  'burst',
  'sparking',
  'tripping',
  'stopped',
  'noise',
  'black screen',
  'blue screen',
  'needs painting',
  'flat tyre',
  'dead battery',
  'issue',
  'fault',
  'problem',
];

const SKILL_SIGNALS = [
  'teach',
  'learn',
  'tutor',
  'teacher',
  'mentor',
  'coaching',
  'classes',
  'training',
];

const COLLEGE_SIGNALS = [
  'college',
  'campus',
  'fest',
  'symposium',
  'final year project',
  'mini project',
  'club',
  'assignment',
  'event poster',
];

const REPAIR_SIGNALS = [
  'repair',
  'fixing',
  'fix',
  'service',
  'servicing',
  'replace',
  'overhaul',
];

export function detectIntent(normalizedQuery: string): SearchIntent {
  // Check college signals first
  if (COLLEGE_SIGNALS.some(s => normalizedQuery.includes(s))) {
    return 'COLLEGE_HELP';
  }

  // Check educational / skill signals
  if (SKILL_SIGNALS.some(s => normalizedQuery.includes(s))) {
    return 'SKILL_SEARCH';
  }

  // Check symptom / problem report signals
  if (PROBLEM_SIGNALS.some(s => normalizedQuery.includes(s))) {
    return 'PROBLEM_REPORT';
  }

  // Check hardware repair request signals
  if (REPAIR_SIGNALS.some(s => normalizedQuery.includes(s))) {
    return 'REPAIR_REQUEST';
  }

  // Default to direct service discovery search
  return 'SERVICE_SEARCH';
}
