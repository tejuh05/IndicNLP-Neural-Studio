/**
 * Curated Benchmark Corpora & Separate Ground-Truth Evaluation Test Set
 * Keeps Development Examples separate from Independent Held-Out Evaluation Test Data.
 */

import { GroundTruthToken } from './types.js';

export interface BenchmarkSentence {
  id: string;
  title: string;
  domain: string;
  text: string;
  groundTruth: GroundTruthToken[];
}

// ============================================================================
// 1. Curated Benchmark Development Corpus (Includes 8 Prompt Benchmark Sentences)
// ============================================================================

export const DEVELOPMENT_EXAMPLES: BenchmarkSentence[] = [
  {
    id: 'test_sent_01',
    title: '1. Nale nivu office ge bartira?',
    domain: 'Workplace Inquiry',
    text: 'Nale nivu office ge bartira?',
    groundTruth: [
      { surface: 'Nale', language: 'kannada', root: 'naale' },
      { surface: 'nivu', language: 'kannada', root: 'neevu' },
      { surface: 'office', language: 'english', root: 'office' },
      { surface: 'ge', language: 'kannada', root: 'ge', suffix: '-ge' },
      { surface: 'bartira', language: 'kannada', root: 'baruttira' },
      { surface: '?', language: 'punct', root: '?' },
    ],
  },
  {
    id: 'test_sent_02',
    title: '2. Nanu college ge hogtini.',
    domain: 'Campus Routine',
    text: 'Nanu college ge hogtini.',
    groundTruth: [
      { surface: 'Nanu', language: 'kannada', root: 'naanu' },
      { surface: 'college', language: 'english', root: 'college' },
      { surface: 'ge', language: 'kannada', root: 'ge', suffix: '-ge' },
      { surface: 'hogtini', language: 'kannada', root: 'hoguthini' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'test_sent_03',
    title: '3. Meeting mugithu, manege hogona.',
    domain: 'Daily Transit',
    text: 'Meeting mugithu, manege hogona.',
    groundTruth: [
      { surface: 'Meeting', language: 'english', root: 'Meeting' },
      { surface: 'mugithu', language: 'kannada', root: 'mugi' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'manege', language: 'kannada', root: 'mane', suffix: '-ge' },
      { surface: 'hogona', language: 'kannada', root: 'hogi' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'test_sent_04',
    title: '4. I am manege hogtini.',
    domain: 'Intra-Sentential Shift',
    text: 'I am manege hogtini.',
    groundTruth: [
      { surface: 'I', language: 'english', root: 'I' },
      { surface: 'am', language: 'english', root: 'am' },
      { surface: 'manege', language: 'kannada', root: 'mane', suffix: '-ge' },
      { surface: 'hogtini', language: 'kannada', root: 'hoguthini' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'test_sent_05',
    title: '5. Tomorrow exam ide.',
    domain: 'Academic Notice',
    text: 'Tomorrow exam ide.',
    groundTruth: [
      { surface: 'Tomorrow', language: 'english', root: 'Tomorrow' },
      { surface: 'exam', language: 'english', root: 'exam' },
      { surface: 'ide', language: 'kannada', root: 'ide' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'test_sent_06',
    title: '6. Nivu assignment submit madidira?',
    domain: 'Complex Predicate',
    text: 'Nivu assignment submit madidira?',
    groundTruth: [
      { surface: 'Nivu', language: 'kannada', root: 'neevu' },
      { surface: 'assignment', language: 'english', root: 'assignment' },
      { surface: 'submit', language: 'english', root: 'submit' },
      { surface: 'madidira', language: 'kannada', root: 'maadu' },
      { surface: '?', language: 'punct', root: '?' },
    ],
  },
  {
    id: 'test_sent_07',
    title: '7. Avanu project complete madilla.',
    domain: 'Negative Auxiliary',
    text: 'Avanu project complete madilla.',
    groundTruth: [
      { surface: 'Avanu', language: 'kannada', root: 'avanu' },
      { surface: 'project', language: 'english', root: 'project' },
      { surface: 'complete', language: 'english', root: 'complete' },
      { surface: 'madilla', language: 'kannada', root: 'maadu', suffix: '-illa' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'test_sent_08',
    title: '8. Ivattu class ide but nanu baralla.',
    domain: 'Clause Transition',
    text: 'Ivattu class ide but nanu baralla.',
    groundTruth: [
      { surface: 'Ivattu', language: 'kannada', root: 'eevatthu' },
      { surface: 'class', language: 'english', root: 'class' },
      { surface: 'ide', language: 'kannada', root: 'ide' },
      { surface: 'but', language: 'english', root: 'but' },
      { surface: 'nanu', language: 'kannada', root: 'naanu' },
      { surface: 'baralla', language: 'kannada', root: 'baru', suffix: '-alla' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'bench_tech_09',
    title: '9. Sprint Demo & Code Review',
    domain: 'Software Engineering',
    text: 'Eevatthu meeting-alli new release open-maadi code-review complete-aagbeku.',
    groundTruth: [
      { surface: 'Eevatthu', language: 'kannada', root: 'Eevatthu' },
      { surface: 'meeting-alli', language: 'hybrid', root: 'meeting', suffix: '-alli' },
      { surface: 'new', language: 'english', root: 'new' },
      { surface: 'release', language: 'english', root: 'release' },
      { surface: 'open-maadi', language: 'hybrid', root: 'open', suffix: '-maadi' },
      { surface: 'code-review', language: 'english', root: 'code-review' },
      { surface: 'complete-aagbeku', language: 'hybrid', root: 'complete', suffix: '-aagbeku' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'bench_tech_10',
    title: '10. Package Delivery & Link Verification',
    domain: 'E-commerce Operations',
    text: 'Amazon package delivered-aagide, invoice link-annu check-maadi verify-maadbeku.',
    groundTruth: [
      { surface: 'Amazon', language: 'english', root: 'Amazon' },
      { surface: 'package', language: 'english', root: 'package' },
      { surface: 'delivered-aagide', language: 'hybrid', root: 'delivered', suffix: '-aagide' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'invoice', language: 'english', root: 'invoice' },
      { surface: 'link-annu', language: 'hybrid', root: 'link', suffix: '-annu' },
      { surface: 'check-maadi', language: 'hybrid', root: 'check', suffix: '-maadi' },
      { surface: 'verify-maadbeku', language: 'hybrid', root: 'verify', suffix: '-maadbeku' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
];

// ============================================================================
// 2. SEPARATE Held-Out Evaluation Test Set (10+ Test Sentences, 70+ Tokens)
// Kept completely separate from development examples for unbiased generalization testing
// ============================================================================

export const UNSEEN_EVALUATION_TEST_SET: BenchmarkSentence[] = [
  {
    id: 'heldout_01',
    title: 'Cinema & Movie Tickets',
    domain: 'Social Entertainment',
    text: 'Nale nanu cinema ge hogtini, ticket book madidira?',
    groundTruth: [
      { surface: 'Nale', language: 'kannada', root: 'naale' },
      { surface: 'nanu', language: 'kannada', root: 'naanu' },
      { surface: 'cinema', language: 'english', root: 'cinema' },
      { surface: 'ge', language: 'kannada', root: 'ge', suffix: '-ge' },
      { surface: 'hogtini', language: 'kannada', root: 'hoguthini' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'ticket', language: 'english', root: 'ticket' },
      { surface: 'book', language: 'english', root: 'book' },
      { surface: 'madidira', language: 'kannada', root: 'maadu' },
      { surface: '?', language: 'punct', root: '?' },
    ],
  },
  {
    id: 'heldout_02',
    title: 'Software Bug & Display Error',
    domain: 'Engineering Incident',
    text: 'App update madilla, error message display aagide.',
    groundTruth: [
      { surface: 'App', language: 'english', root: 'App' },
      { surface: 'update', language: 'english', root: 'update' },
      { surface: 'madilla', language: 'kannada', root: 'maadu', suffix: '-illa' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'error', language: 'english', root: 'error' },
      { surface: 'message', language: 'english', root: 'message' },
      { surface: 'display', language: 'english', root: 'display' },
      { surface: 'aagide', language: 'kannada', root: 'aagide' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_03',
    title: 'Laptop Verification',
    domain: 'Device Checking',
    text: 'Nimma laptop table mele ide, check maadi.',
    groundTruth: [
      { surface: 'Nimma', language: 'kannada', root: 'nimma' },
      { surface: 'laptop', language: 'english', root: 'laptop' },
      { surface: 'table', language: 'english', root: 'table' },
      { surface: 'mele', language: 'kannada', root: 'mele' },
      { surface: 'ide', language: 'kannada', root: 'ide' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'check', language: 'english', root: 'check' },
      { surface: 'maadi', language: 'kannada', root: 'maadi' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_04',
    title: 'Support Call & Details',
    domain: 'Customer Operations',
    text: 'Customer support ge call maadi details share madona.',
    groundTruth: [
      { surface: 'Customer', language: 'english', root: 'Customer' },
      { surface: 'support', language: 'english', root: 'support' },
      { surface: 'ge', language: 'kannada', root: 'ge', suffix: '-ge' },
      { surface: 'call', language: 'english', root: 'call' },
      { surface: 'maadi', language: 'kannada', root: 'maadi' },
      { surface: 'details', language: 'english', root: 'details' },
      { surface: 'share', language: 'english', root: 'share' },
      { surface: 'madona', language: 'kannada', root: 'maadona' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_05',
    title: 'Transit Booking',
    domain: 'Urban Mobility',
    text: 'Train station ge cab book maadoke agalla.',
    groundTruth: [
      { surface: 'Train', language: 'english', root: 'Train' },
      { surface: 'station', language: 'english', root: 'station' },
      { surface: 'ge', language: 'kannada', root: 'ge', suffix: '-ge' },
      { surface: 'cab', language: 'english', root: 'cab' },
      { surface: 'book', language: 'english', root: 'book' },
      { surface: 'maadoke', language: 'kannada', root: 'maadu', suffix: '-oke' },
      { surface: 'agalla', language: 'kannada', root: 'aagalla' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_06',
    title: 'Office Morning Tea & Standup',
    domain: 'Workplace Casual',
    text: 'Morning coffee aaythu, team standup start madona.',
    groundTruth: [
      { surface: 'Morning', language: 'english', root: 'Morning' },
      { surface: 'coffee', language: 'english', root: 'coffee' },
      { surface: 'aaythu', language: 'kannada', root: 'aaythu' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'team', language: 'english', root: 'team' },
      { surface: 'standup', language: 'english', root: 'standup' },
      { surface: 'start', language: 'english', root: 'start' },
      { surface: 'madona', language: 'kannada', root: 'maadona' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_07',
    title: 'Document Download Failure',
    domain: 'Campus Portal',
    text: 'Syllabus pdf download aagilla, browser refresh maadi.',
    groundTruth: [
      { surface: 'Syllabus', language: 'english', root: 'Syllabus' },
      { surface: 'pdf', language: 'english', root: 'pdf' },
      { surface: 'download', language: 'english', root: 'download' },
      { surface: 'aagilla', language: 'kannada', root: 'aagilla' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'browser', language: 'english', root: 'browser' },
      { surface: 'refresh', language: 'english', root: 'refresh' },
      { surface: 'maadi', language: 'kannada', root: 'maadi' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_08',
    title: 'Metro Commute & Road Traffic',
    domain: 'Urban Commute',
    text: 'Main road-alli heavy traffic ide, metro-inda hogona.',
    groundTruth: [
      { surface: 'Main', language: 'english', root: 'Main' },
      { surface: 'road-alli', language: 'hybrid', root: 'road', suffix: '-alli' },
      { surface: 'heavy', language: 'english', root: 'heavy' },
      { surface: 'traffic', language: 'english', root: 'traffic' },
      { surface: 'ide', language: 'kannada', root: 'ide' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'metro-inda', language: 'hybrid', root: 'metro', suffix: '-inda' },
      { surface: 'hogona', language: 'kannada', root: 'hogi' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_09',
    title: 'Database Query Optimization',
    domain: 'Software Engineering',
    text: 'Server database slow aagide, query optimize maadbeku.',
    groundTruth: [
      { surface: 'Server', language: 'english', root: 'Server' },
      { surface: 'database', language: 'english', root: 'database' },
      { surface: 'slow', language: 'english', root: 'slow' },
      { surface: 'aagide', language: 'kannada', root: 'aagide' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'query', language: 'english', root: 'query' },
      { surface: 'optimize', language: 'english', root: 'optimize' },
      { surface: 'maadbeku', language: 'kannada', root: 'maadu', suffix: '-beku' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_10',
    title: 'Assignment Deadline Notice',
    domain: 'Campus Academics',
    text: 'Physics lab assignment ready ide but submission portal open agilla.',
    groundTruth: [
      { surface: 'Physics', language: 'english', root: 'Physics' },
      { surface: 'lab', language: 'english', root: 'lab' },
      { surface: 'assignment', language: 'english', root: 'assignment' },
      { surface: 'ready', language: 'english', root: 'ready' },
      { surface: 'ide', language: 'kannada', root: 'ide' },
      { surface: 'but', language: 'english', root: 'but' },
      { surface: 'submission', language: 'english', root: 'submission' },
      { surface: 'portal', language: 'english', root: 'portal' },
      { surface: 'open', language: 'english', root: 'open' },
      { surface: 'agilla', language: 'kannada', root: 'aagalla' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
  {
    id: 'heldout_11',
    title: 'Weekend Social Dinner Plan',
    domain: 'Social Conversation',
    text: 'Nale evening dinner ge banni, plans ready madona.',
    groundTruth: [
      { surface: 'Nale', language: 'kannada', root: 'naale' },
      { surface: 'evening', language: 'english', root: 'evening' },
      { surface: 'dinner', language: 'english', root: 'dinner' },
      { surface: 'ge', language: 'kannada', root: 'ge', suffix: '-ge' },
      { surface: 'banni', language: 'kannada', root: 'banni' },
      { surface: ',', language: 'punct', root: ',' },
      { surface: 'plans', language: 'english', root: 'plans' },
      { surface: 'ready', language: 'english', root: 'ready' },
      { surface: 'madona', language: 'kannada', root: 'maadona' },
      { surface: '.', language: 'punct', root: '.' },
    ],
  },
];
