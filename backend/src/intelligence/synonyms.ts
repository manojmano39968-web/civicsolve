/**
 * Layer 4: Synonym & Vernacular Concept Mapping
 * Expands informal problem expressions and colloquial terms into formal service concepts.
 */

export interface ConceptExpansion {
  targetServiceSlug: string;
  weight: number;
}

const CONCEPT_MAP: Record<string, ConceptExpansion[]> = {
  // Painting concepts
  paint: [{ targetServiceSlug: 'painter', weight: 1.0 }],
  painter: [{ targetServiceSlug: 'painter', weight: 1.0 }],
  painting: [{ targetServiceSlug: 'painter', weight: 1.0 }],
  distemper: [{ targetServiceSlug: 'painter', weight: 0.9 }],
  whitewash: [{ targetServiceSlug: 'painter', weight: 0.9 }],
  emulsion: [{ targetServiceSlug: 'painter', weight: 0.9 }],
  primer: [{ targetServiceSlug: 'painter', weight: 0.8 }],
  wall: [{ targetServiceSlug: 'painter', weight: 0.7 }],

  // Plumbing concepts
  plumber: [{ targetServiceSlug: 'plumber', weight: 1.0 }],
  plumbing: [{ targetServiceSlug: 'plumber', weight: 1.0 }],
  leak: [{ targetServiceSlug: 'plumber', weight: 0.9 }, { targetServiceSlug: 'waterproofing', weight: 0.7 }],
  leakage: [{ targetServiceSlug: 'plumber', weight: 0.9 }, { targetServiceSlug: 'waterproofing', weight: 0.7 }],
  leaking: [{ targetServiceSlug: 'plumber', weight: 0.9 }],
  tap: [{ targetServiceSlug: 'plumber', weight: 1.0 }],
  pipe: [{ targetServiceSlug: 'plumber', weight: 0.95 }],
  faucet: [{ targetServiceSlug: 'plumber', weight: 0.95 }],
  flush: [{ targetServiceSlug: 'plumber', weight: 0.9 }],
  drain: [{ targetServiceSlug: 'plumber', weight: 0.85 }],
  drainage: [{ targetServiceSlug: 'plumber', weight: 0.85 }],
  seepage: [{ targetServiceSlug: 'waterproofing', weight: 0.95 }, { targetServiceSlug: 'plumber', weight: 0.6 }],

  // Electrical concepts
  electrician: [{ targetServiceSlug: 'electrician', weight: 1.0 }],
  electrical: [{ targetServiceSlug: 'electrician', weight: 1.0 }],
  wiring: [{ targetServiceSlug: 'electrician', weight: 0.95 }],
  spark: [{ targetServiceSlug: 'electrician', weight: 0.9 }],
  switchboard: [{ targetServiceSlug: 'electrician', weight: 0.95 }],
  tripping: [{ targetServiceSlug: 'electrician', weight: 0.9 }],
  geyser: [{ targetServiceSlug: 'electrician', weight: 0.85 }, { targetServiceSlug: 'plumber', weight: 0.7 }],

  // Technology
  laptop: [{ targetServiceSlug: 'laptop-repair', weight: 1.0 }],
  computer: [{ targetServiceSlug: 'computer-repair', weight: 1.0 }],
  pc: [{ targetServiceSlug: 'computer-repair', weight: 0.95 }],
  screen: [
    { targetServiceSlug: 'laptop-repair', weight: 1.0 },
    { targetServiceSlug: 'mobile-repair', weight: 1.0 },
  ],
  display: [
    { targetServiceSlug: 'laptop-repair', weight: 1.0 },
    { targetServiceSlug: 'mobile-repair', weight: 1.0 },
  ],
  mobile: [{ targetServiceSlug: 'mobile-repair', weight: 1.0 }],
  phone: [{ targetServiceSlug: 'mobile-repair', weight: 1.0 }],
  format: [{ targetServiceSlug: 'software-installation', weight: 0.9 }, { targetServiceSlug: 'laptop-repair', weight: 0.7 }],
  windows: [{ targetServiceSlug: 'software-installation', weight: 0.9 }],
  antivirus: [{ targetServiceSlug: 'software-installation', weight: 0.9 }],
  wifi: [{ targetServiceSlug: 'networking', weight: 1.0 }],
  router: [{ targetServiceSlug: 'networking', weight: 0.95 }],
  lan: [{ targetServiceSlug: 'networking', weight: 0.95 }],

  // Automotive
  puncture: [{ targetServiceSlug: 'puncture-repair', weight: 1.0 }],
  tyre: [{ targetServiceSlug: 'puncture-repair', weight: 0.9 }, { targetServiceSlug: 'tyre-service', weight: 0.85 }],
  tire: [{ targetServiceSlug: 'puncture-repair', weight: 0.9 }, { targetServiceSlug: 'tyre-service', weight: 0.85 }],
  tubeless: [{ targetServiceSlug: 'puncture-repair', weight: 0.95 }],
  mechanic: [{ targetServiceSlug: 'mechanic', weight: 1.0 }],
  car: [{ targetServiceSlug: 'mechanic', weight: 0.7 }, { targetServiceSlug: 'car-wash', weight: 0.6 }],
  bike: [{ targetServiceSlug: 'mechanic', weight: 0.7 }],
  battery: [{ targetServiceSlug: 'battery-service', weight: 0.95 }],

  // Education & Campus
  java: [{ targetServiceSlug: 'java-tutor', weight: 1.0 }],
  coding: [{ targetServiceSlug: 'programming-mentor', weight: 0.95 }],
  python: [{ targetServiceSlug: 'programming-mentor', weight: 1.0 }],
  programming: [{ targetServiceSlug: 'programming-mentor', weight: 0.95 }, { targetServiceSlug: 'java-tutor', weight: 0.8 }],
  tutor: [{ targetServiceSlug: 'java-tutor', weight: 0.7 }, { targetServiceSlug: 'mathematics-tutor', weight: 0.7 }],
  teacher: [{ targetServiceSlug: 'java-tutor', weight: 0.7 }, { targetServiceSlug: 'mathematics-tutor', weight: 0.7 }],
  project: [{ targetServiceSlug: 'project-guidance', weight: 0.95 }],
  math: [{ targetServiceSlug: 'mathematics-tutor', weight: 1.0 }],
  maths: [{ targetServiceSlug: 'mathematics-tutor', weight: 1.0 }],
  calculus: [{ targetServiceSlug: 'mathematics-tutor', weight: 0.95 }],

  // Creative
  poster: [{ targetServiceSlug: 'graphic-designer', weight: 1.0 }],
  designer: [{ targetServiceSlug: 'graphic-designer', weight: 0.9 }, { targetServiceSlug: 'ui-designer', weight: 0.8 }],
  figma: [{ targetServiceSlug: 'ui-designer', weight: 1.0 }],
  photographer: [{ targetServiceSlug: 'photographer', weight: 1.0 }],
  video: [{ targetServiceSlug: 'video-editor', weight: 0.95 }],

  // Engineering
  civil: [{ targetServiceSlug: 'civil-engineer', weight: 1.0 }],
  structural: [{ targetServiceSlug: 'structural-engineer', weight: 1.0 }],
  architect: [{ targetServiceSlug: 'architect', weight: 1.0 }],
  plan: [{ targetServiceSlug: 'architect', weight: 0.8 }],
  survey: [{ targetServiceSlug: 'surveyor', weight: 1.0 }],

  // Appliances
  ac: [{ targetServiceSlug: 'ac-technician', weight: 1.0 }],
  cooling: [{ targetServiceSlug: 'ac-technician', weight: 0.85 }, { targetServiceSlug: 'refrigerator-repair', weight: 0.85 }],
  fridge: [{ targetServiceSlug: 'refrigerator-repair', weight: 1.0 }],
  washing: [{ targetServiceSlug: 'washing-machine-repair', weight: 1.0 }],
};

export function expandConcepts(keywords: string[]): Map<string, number> {
  const scoresByService = new Map<string, number>();

  for (const kw of keywords) {
    const expansions = CONCEPT_MAP[kw];
    if (expansions) {
      for (const exp of expansions) {
        const current = scoresByService.get(exp.targetServiceSlug) || 0;
        scoresByService.set(exp.targetServiceSlug, current + exp.weight);
      }
    }
  }

  return scoresByService;
}
