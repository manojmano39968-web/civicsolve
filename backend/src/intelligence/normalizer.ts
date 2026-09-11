/**
 * Layer 1: Text Normalization
 * Handles lowercase conversion, unicode punctuation stripping, whitespace collapsing,
 * and common phonetic typo normalization.
 */

const TYPO_MAP: Record<string, string> = {
  // Trades & home
  plubmer: 'plumber',
  plamer: 'plumber',
  plumberr: 'plumber',
  electrisian: 'electrician',
  electritian: 'electrician',
  electricion: 'electrician',
  electrian: 'electrician',
  bijli: 'electrician',
  carpanter: 'carpenter',
  karpenter: 'carpenter',
  paintr: 'painter',
  penting: 'painting',
  waterprofing: 'waterproofing',
  waterproffing: 'waterproofing',

  // Tech
  computr: 'computer',
  labtop: 'laptop',
  leptop: 'laptop',
  screan: 'screen',
  displey: 'display',
  notbook: 'laptop',
  mobail: 'mobile',
  fhone: 'phone',

  // Automotive
  panchar: 'puncture',
  puncher: 'puncture',
  punctur: 'puncture',
  tyer: 'tyre',
  tire: 'tyre',
  mecanic: 'mechanic',
  mechanik: 'mechanic',

  // Education & Campus
  techer: 'teacher',
  tutorr: 'tutor',
  programing: 'programming',
  projeckt: 'project',
  projct: 'project',
  clg: 'college',
  colg: 'college',
};

export function normalizeText(rawInput: string): string {
  if (!rawInput) return '';

  // 1. Lowercase
  let text = rawInput.toLowerCase();

  // 2. Strip punctuation & special characters (preserve letters, digits, and spaces)
  text = text.replace(/[^a-z0-9\s]/g, ' ');

  // 3. Collapse multiple whitespace characters into single space
  text = text.replace(/\s+/g, ' ').trim();

  // 4. Word-level typo correction
  const words = text.split(' ').map(w => TYPO_MAP[w] || w);

  return words.join(' ');
}
