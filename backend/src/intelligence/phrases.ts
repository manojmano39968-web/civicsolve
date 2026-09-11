/**
 * Layer 3: Phrase & Problem Collocation Detection
 * Detects known compound problem phrases and colloquial multi-word patterns.
 */

export interface DetectedPhrase {
  phrase: string;
  categoryHint?: string;
  serviceHint?: string;
}

const KNOWN_PHRASES: Record<string, { categoryHint?: string; serviceHint?: string }> = {
  // Home & Plumbing & Painting
  'tap is leaking': { serviceHint: 'plumber' },
  'tap leaking': { serviceHint: 'plumber' },
  'water leakage': { serviceHint: 'plumber' },
  'pipe leakage': { serviceHint: 'plumber' },
  'bathroom tap': { serviceHint: 'plumber' },
  'bathroom tap is leaking': { serviceHint: 'plumber' },
  'pipe burst': { serviceHint: 'plumber' },
  'flush tank': { serviceHint: 'plumber' },
  'drainage block': { serviceHint: 'plumber' },

  'house painting': { serviceHint: 'painter' },
  'paint my house': { serviceHint: 'painter' },
  'wall needs painting': { serviceHint: 'painter' },
  'wall painting': { serviceHint: 'painter' },
  'painting service': { serviceHint: 'painter' },
  'interior painting': { serviceHint: 'painter' },
  'exterior painting': { serviceHint: 'painter' },
  'roof leakage': { serviceHint: 'waterproofing' },

  // Electrical
  'short circuit': { serviceHint: 'electrician' },
  'power tripping': { serviceHint: 'electrician' },
  'switchboard repair': { serviceHint: 'electrician' },
  'fan repair': { serviceHint: 'electrician' },
  'sparking switch': { serviceHint: 'electrician' },

  // Tech
  'laptop not working': { serviceHint: 'laptop-repair' },
  'computer not working': { serviceHint: 'computer-repair' },
  'pc not working': { serviceHint: 'computer-repair' },
  'laptop screen broken': { serviceHint: 'laptop-repair' },
  'laptop screen black': { serviceHint: 'laptop-repair' },
  'mobile screen broken': { serviceHint: 'mobile-repair' },
  'mobile screen cracked': { serviceHint: 'mobile-repair' },
  'phone screen cracked': { serviceHint: 'mobile-repair' },
  'phone screen broken': { serviceHint: 'mobile-repair' },
  'computer repair': { serviceHint: 'computer-repair' },
  'computer technician': { serviceHint: 'computer-repair' },
  'format laptop': { serviceHint: 'software-installation' },
  'os installation': { serviceHint: 'software-installation' },
  'wifi router setup': { serviceHint: 'networking' },

  // Automotive
  'puncture repair': { serviceHint: 'puncture-repair' },
  'flat tyre': { serviceHint: 'puncture-repair' },
  'flat tire': { serviceHint: 'puncture-repair' },
  'tubeless puncture': { serviceHint: 'puncture-repair' },
  'tyre puncture': { serviceHint: 'puncture-repair' },
  'car breakdown': { serviceHint: 'mechanic' },
  'bike breakdown': { serviceHint: 'mechanic' },
  'jump start': { serviceHint: 'battery-service' },

  // Education & Campus
  'teach me java': { serviceHint: 'java-tutor' },
  'java tutor': { serviceHint: 'java-tutor' },
  'java teacher': { serviceHint: 'java-tutor' },
  'java programming': { serviceHint: 'java-tutor' },
  'college project': { serviceHint: 'project-guidance' },
  'college project guidance': { serviceHint: 'project-guidance' },
  'final year project': { serviceHint: 'project-guidance' },
  'project guidance': { serviceHint: 'project-guidance' },
  'poster design': { serviceHint: 'graphic-designer' },
  'college event': { serviceHint: 'graphic-designer' },

  // Appliance
  'ac not cooling': { serviceHint: 'ac-technician' },
  'ac servicing': { serviceHint: 'ac-technician' },
  'fridge not cooling': { serviceHint: 'refrigerator-repair' },
};

export function detectPhrases(normalizedText: string, ngrams: string[]): DetectedPhrase[] {
  const detected: DetectedPhrase[] = [];

  // Check whole text matches first
  for (const [phrase, hints] of Object.entries(KNOWN_PHRASES)) {
    if (normalizedText.includes(phrase)) {
      detected.push({
        phrase,
        categoryHint: hints.categoryHint,
        serviceHint: hints.serviceHint,
      });
    }
  }

  // Also match ngrams
  for (const ng of ngrams) {
    if (KNOWN_PHRASES[ng] && !detected.some(d => d.phrase === ng)) {
      detected.push({
        phrase: ng,
        categoryHint: KNOWN_PHRASES[ng].categoryHint,
        serviceHint: KNOWN_PHRASES[ng].serviceHint,
      });
    }
  }

  return detected;
}
