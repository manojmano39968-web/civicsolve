import bcrypt from 'bcryptjs';
import { getDatabase } from './index.js';
import { runMigrations } from './migrate.js';

export async function runSeeds(): Promise<void> {
  const db = getDatabase();

  console.log('🌱 Starting database seeding...');

  // Ensure tables exist
  await runMigrations();

  // 1. Seed Categories
  const categories = [
    {
      id: 'cat-home-maint',
      slug: 'home-maintenance',
      name: 'Home & Maintenance',
      icon: 'Home',
      description: 'Plumbing, painting, electrical, carpentry, cleaning, and structural repairs for residential spaces.',
      sort_order: 1,
    },
    {
      id: 'cat-technology',
      slug: 'technology',
      name: 'Technology',
      icon: 'Laptop',
      description: 'Computer, laptop, mobile repairs, software troubleshooting, networking, and IT support.',
      sort_order: 2,
    },
    {
      id: 'cat-automotive',
      slug: 'automotive',
      name: 'Automotive',
      icon: 'Car',
      description: 'Mechanics, tyre puncture repair, battery replacement, vehicle breakdown assistance, and wash.',
      sort_order: 3,
    },
    {
      id: 'cat-education',
      slug: 'education-campus',
      name: 'Education & Campus',
      icon: 'GraduationCap',
      description: 'Academic tutoring, programming mentoring, project guidance, and campus technical help.',
      sort_order: 4,
    },
    {
      id: 'cat-engineering',
      slug: 'engineering-construction',
      name: 'Engineering & Construction',
      icon: 'HardHat',
      description: 'Civil engineers, structural consultants, architects, surveyors, and construction guidance.',
      sort_order: 5,
    },
    {
      id: 'cat-creative',
      slug: 'creative-design',
      name: 'Creative & Design',
      icon: 'Palette',
      description: 'Graphic design, event photography, videography, poster design, and UI/UX consulting.',
      sort_order: 6,
    },
    {
      id: 'cat-appliances',
      slug: 'repair-appliances',
      name: 'Repair & Appliances',
      icon: 'Wrench',
      description: 'AC servicing, refrigerator repair, washing machine diagnostics, and home appliance fixes.',
      sort_order: 7,
    },
  ];

  for (const cat of categories) {
    await db.query(
      `INSERT INTO categories (id, slug, name, icon, description, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET 
         name = EXCLUDED.name, 
         icon = EXCLUDED.icon, 
         description = EXCLUDED.description, 
         sort_order = EXCLUDED.sort_order`,
      [cat.id, cat.slug, cat.name, cat.icon, cat.description, cat.sort_order]
    );
  }

  // 2. Seed Services
  const services = [
    // Home & Maintenance
    { id: 'svc-painter', category_id: 'cat-home-maint', slug: 'painter', name: 'Painter', icon: 'Paintbrush', default_pricing_unit: 'PER_SQFT', desc: 'Interior and exterior wall painting, distemper, texture painting, and waterproofing coats.' },
    { id: 'svc-plumber', category_id: 'cat-home-maint', slug: 'plumber', name: 'Plumber', icon: 'Pipette', default_pricing_unit: 'PER_SERVICE', desc: 'Leak detection, pipe repairs, tap fixes, bathroom fittings, flush tanks, and drainage solutions.' },
    { id: 'svc-electrician', category_id: 'cat-home-maint', slug: 'electrician', name: 'Electrician', icon: 'Zap', default_pricing_unit: 'PER_SERVICE', desc: 'Wiring repair, short circuit fixes, fan/geyser repair, switchboard installation, and safety audits.' },
    { id: 'svc-carpenter', category_id: 'cat-home-maint', slug: 'carpenter', name: 'Carpenter', icon: 'Hammer', default_pricing_unit: 'PER_SERVICE', desc: 'Furniture repair, door locks, modular kitchen woodwork, custom shelves, and assembly.' },
    { id: 'svc-mason', category_id: 'cat-home-maint', slug: 'mason', name: 'Mason', icon: 'Layers', default_pricing_unit: 'PER_DAY', desc: 'Tile laying, brickwork, plastering, bathroom tiling, and civil masonry modifications.' },
    { id: 'svc-cleaner', category_id: 'cat-home-maint', slug: 'cleaner', name: 'Cleaner', icon: 'Sparkles', default_pricing_unit: 'PER_SERVICE', desc: 'Deep house cleaning, kitchen scrubbing, bathroom sanitization, and sofa shampooing.' },
    { id: 'svc-water-tank', category_id: 'cat-home-maint', slug: 'water-tank-service', name: 'Water Tank Service', icon: 'Droplets', default_pricing_unit: 'PER_SERVICE', desc: 'Overhead and underground sump pressure cleaning, sludge removal, and sanitization.' },
    { id: 'svc-waterproofing', category_id: 'cat-home-maint', slug: 'waterproofing', name: 'Waterproofing', icon: 'Shield', default_pricing_unit: 'PER_SQFT', desc: 'Roof leakage treatment, terrace waterproofing, wall seepage solutions, and damp control.' },

    // Technology
    { id: 'svc-comp-repair', category_id: 'cat-technology', slug: 'computer-repair', name: 'Computer Repair', icon: 'Cpu', default_pricing_unit: 'PER_SERVICE', desc: 'Desktop PC diagnostics, BIOS error fixing, hardware assembly, and power supply repairs.' },
    { id: 'svc-laptop-repair', category_id: 'cat-technology', slug: 'laptop-repair', name: 'Laptop Repair', icon: 'Laptop', default_pricing_unit: 'PER_SERVICE', desc: 'Screen replacement, battery changes, motherboard diagnosis, hinge repair, and OS troubleshooting.' },
    { id: 'svc-mobile-repair', category_id: 'cat-technology', slug: 'mobile-repair', name: 'Mobile Repair', icon: 'Smartphone', default_pricing_unit: 'PER_SERVICE', desc: 'Smartphone screen replacement, charging port repair, speaker/mic fixes, and battery changes.' },
    { id: 'svc-networking', category_id: 'cat-technology', slug: 'networking', name: 'Networking', icon: 'Wifi', default_pricing_unit: 'PER_SERVICE', desc: 'Wi-Fi router setup, LAN cabling, switch configuration, signal booster setup, and office network troubleshooting.' },
    { id: 'svc-software-install', category_id: 'cat-technology', slug: 'software-installation', name: 'Software Installation', icon: 'Download', default_pricing_unit: 'PER_SERVICE', desc: 'OS formatting, driver updates, antivirus setup, productivity software, and system tune-up.' },
    { id: 'svc-data-recovery', category_id: 'cat-technology', slug: 'data-recovery', name: 'Data Recovery', icon: 'Database', default_pricing_unit: 'PER_SERVICE', desc: 'Corrupted USB recovery, deleted file restoration, external hard drive diagnosis, and backup setup.' },
    { id: 'svc-web-dev', category_id: 'cat-technology', slug: 'web-development', name: 'Web Development', icon: 'Code', default_pricing_unit: 'PER_SERVICE', desc: 'Custom website building, React/Next.js bug fixes, portfolio sites, and landing page development.' },
    { id: 'svc-it-support', category_id: 'cat-technology', slug: 'it-support', name: 'IT Support', icon: 'HelpCircle', default_pricing_unit: 'PER_HOUR', desc: 'Printer setup, email configuration, remote PC assistance, and general technical troubleshooting.' },

    // Automotive
    { id: 'svc-mechanic', category_id: 'cat-automotive', slug: 'mechanic', name: 'Mechanic', icon: 'Settings', default_pricing_unit: 'PER_SERVICE', desc: 'Car & two-wheeler engine repair, brake service, clutch adjustment, and regular servicing.' },
    { id: 'svc-puncture', category_id: 'cat-automotive', slug: 'puncture-repair', name: 'Puncture Repair', icon: 'Disc', default_pricing_unit: 'PER_SERVICE', desc: 'On-site tubeless puncture fixing, tyre pressure checks, valve changes, and spare tyre swapping.' },
    { id: 'svc-tyre-service', category_id: 'cat-automotive', slug: 'tyre-service', name: 'Tyre Service', icon: 'Circle', default_pricing_unit: 'PER_SERVICE', desc: 'Wheel alignment, wheel balancing, new tyre mounting, and rotation.' },
    { id: 'svc-battery', category_id: 'cat-automotive', slug: 'battery-service', name: 'Battery Service', icon: 'BatteryCharging', default_pricing_unit: 'PER_SERVICE', desc: 'Car battery jumpstart, dead battery diagnostics, terminal cleaning, and replacement batteries.' },
    { id: 'svc-car-wash', category_id: 'cat-automotive', slug: 'car-wash', name: 'Car Wash', icon: 'Droplet', default_pricing_unit: 'PER_SERVICE', desc: 'Doorstep foam car wash, bike wash, interior vacuuming, and exterior detailing.' },
    { id: 'svc-towing', category_id: 'cat-automotive', slug: 'towing', name: 'Towing', icon: 'Truck', default_pricing_unit: 'PER_KM', desc: 'Flatbed breakdown towing, accident recovery, and safe transport to the nearest workshop.' },

    // Education & Campus
    { id: 'svc-java-tutor', category_id: 'cat-education', slug: 'java-tutor', name: 'Java Tutor', icon: 'BookOpen', default_pricing_unit: 'PER_HOUR', desc: 'Core Java, OOPs concepts, Java collections, multithreading, DSA in Java, and exam coaching.' },
    { id: 'svc-prog-mentor', category_id: 'cat-education', slug: 'programming-mentor', name: 'Programming Mentor', icon: 'Terminal', default_pricing_unit: 'PER_HOUR', desc: 'Python, C++, JavaScript programming guidance, logic building, and debugging assistance.' },
    { id: 'svc-math-tutor', category_id: 'cat-education', slug: 'mathematics-tutor', name: 'Mathematics Tutor', icon: 'Divide', default_pricing_unit: 'PER_HOUR', desc: 'Engineering mathematics, calculus, linear algebra, discrete math, and school syllabus tutoring.' },
    { id: 'svc-english-tutor', category_id: 'cat-education', slug: 'english-tutor', name: 'English Tutor', icon: 'Languages', default_pricing_unit: 'PER_HOUR', desc: 'Spoken English, business communication, interview preparation, and professional writing.' },
    { id: 'svc-project-guide', category_id: 'cat-education', slug: 'project-guidance', name: 'Project Guidance', icon: 'Briefcase', default_pricing_unit: 'PER_SERVICE', desc: 'Final year engineering projects, mini projects, system design, report preparation, and code walk.' },
    { id: 'svc-tech-mentor', category_id: 'cat-education', slug: 'technical-mentor', name: 'Technical Mentor', icon: 'Compass', default_pricing_unit: 'PER_HOUR', desc: 'Resume review, tech interview prep, cloud computing orientation, and career roadmaps.' },

    // Engineering & Construction
    { id: 'svc-civil-engineer', category_id: 'cat-engineering', slug: 'civil-engineer', name: 'Civil Engineer', icon: 'Building', default_pricing_unit: 'PER_DAY', desc: 'Site supervision, concrete strength verification, foundation inspection, and civil estimation.' },
    { id: 'svc-structural-eng', category_id: 'cat-engineering', slug: 'structural-engineer', name: 'Structural Engineer', icon: 'Grid', default_pricing_unit: 'PER_SERVICE', desc: 'Beam and column load design, building stability certificates, and structural audit.' },
    { id: 'svc-architect', category_id: 'cat-engineering', slug: 'architect', name: 'Architect', icon: 'Compass', default_pricing_unit: 'PER_SQFT', desc: '2D residential floor plans, 3D elevations, building sanction drawings, and modern layouts.' },
    { id: 'svc-surveyor', category_id: 'cat-engineering', slug: 'surveyor', name: 'Surveyor', icon: 'MapPin', default_pricing_unit: 'PER_DAY', desc: 'Total station land survey, plot boundary marking, contour mapping, and area verification.' },

    // Creative & Design
    { id: 'svc-graphic-designer', category_id: 'cat-creative', slug: 'graphic-designer', name: 'Graphic Designer', icon: 'PenTool', default_pricing_unit: 'PER_ITEM', desc: 'College fest posters, logo branding, social media banners, event flyers, and vector art.' },
    { id: 'svc-photographer', category_id: 'cat-creative', slug: 'photographer', name: 'Photographer', icon: 'Camera', default_pricing_unit: 'PER_DAY', desc: 'Event photography, college symposium coverage, portrait sessions, and convocation shoots.' },
    { id: 'svc-video-editor', category_id: 'cat-creative', slug: 'video-editor', name: 'Video Editor', icon: 'Video', default_pricing_unit: 'PER_SERVICE', desc: 'College festival promo teasers, YouTube editing, reels creation, color grading, and montages.' },
    { id: 'svc-ui-designer', category_id: 'cat-creative', slug: 'ui-designer', name: 'UI Designer', icon: 'Layout', default_pricing_unit: 'PER_SERVICE', desc: 'Mobile app wireframes, Figma interactive prototypes, web dashboard mockups, and UI audits.' },

    // Repair & Appliances
    { id: 'svc-ac-tech', category_id: 'cat-appliances', slug: 'ac-technician', name: 'AC Technician', icon: 'Wind', default_pricing_unit: 'PER_SERVICE', desc: 'Split/window AC cooling repair, gas charging, jet foam wet cleaning, compressor replacement.' },
    { id: 'svc-fridge-repair', category_id: 'cat-appliances', slug: 'refrigerator-repair', name: 'Refrigerator Repair', icon: 'Box', default_pricing_unit: 'PER_SERVICE', desc: 'Single/double door fridge cooling issues, defrost malfunction, thermostat fixes, and gas refill.' },
    { id: 'svc-washing-repair', category_id: 'cat-appliances', slug: 'washing-machine-repair', name: 'Washing Machine Repair', icon: 'RefreshCw', default_pricing_unit: 'PER_SERVICE', desc: 'Front & top load drum noise, water drainage block, motor repair, and PCB board fixes.' },
  ];

  for (const svc of services) {
    await db.query(
      `INSERT INTO services (id, category_id, slug, name, icon, description, default_pricing_unit)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET 
         category_id = EXCLUDED.category_id,
         slug = EXCLUDED.slug,
         name = EXCLUDED.name,
         icon = EXCLUDED.icon,
         description = EXCLUDED.description,
         default_pricing_unit = EXCLUDED.default_pricing_unit`,
      [svc.id, svc.category_id, svc.slug, svc.name, svc.icon, svc.desc, svc.default_pricing_unit]
    );
  }

  // 3. Seed Service Aliases & Synonyms
  const aliases = [
    // Painter
    { serviceId: 'svc-painter', alias: 'painter', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'painting', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'house painter', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'house painting', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'paint my house', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'wall painting', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'wall needs painting', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'painting service', weight: 1.0 },
    { serviceId: 'svc-painter', alias: 'interior painting', weight: 0.9 },
    { serviceId: 'svc-painter', alias: 'exterior painting', weight: 0.9 },
    { serviceId: 'svc-painter', alias: 'distemper', weight: 0.8 },
    { serviceId: 'svc-painter', alias: 'whitewash', weight: 0.8 },
    { serviceId: 'svc-painter', alias: 'color work', weight: 0.7 },

    // Plumber
    { serviceId: 'svc-plumber', alias: 'plumber', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'plumbing', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'tap leaking', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'water leakage', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'bathroom tap', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'bathroom tap is leaking', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'pipe repair', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'pipe burst', weight: 1.0 },
    { serviceId: 'svc-plumber', alias: 'flush tank', weight: 0.9 },
    { serviceId: 'svc-plumber', alias: 'drainage block', weight: 0.9 },
    { serviceId: 'svc-plumber', alias: 'faucet repair', weight: 0.9 },

    // Electrician
    { serviceId: 'svc-electrician', alias: 'electrician', weight: 1.0 },
    { serviceId: 'svc-electrician', alias: 'electrical', weight: 1.0 },
    { serviceId: 'svc-electrician', alias: 'short circuit', weight: 1.0 },
    { serviceId: 'svc-electrician', alias: 'power tripping', weight: 1.0 },
    { serviceId: 'svc-electrician', alias: 'switchboard repair', weight: 1.0 },
    { serviceId: 'svc-electrician', alias: 'fan repair', weight: 0.9 },
    { serviceId: 'svc-electrician', alias: 'wiring work', weight: 0.9 },
    { serviceId: 'svc-electrician', alias: 'sparking switch', weight: 0.9 },

    // Laptop & Computer Repair
    { serviceId: 'svc-comp-repair', alias: 'computer repair', weight: 1.0 },
    { serviceId: 'svc-comp-repair', alias: 'computer technician', weight: 1.0 },
    { serviceId: 'svc-comp-repair', alias: 'pc repair', weight: 1.0 },
    { serviceId: 'svc-comp-repair', alias: 'desktop repair', weight: 1.0 },
    { serviceId: 'svc-laptop-repair', alias: 'laptop repair', weight: 1.0 },
    { serviceId: 'svc-laptop-repair', alias: 'laptop not working', weight: 1.0 },
    { serviceId: 'svc-laptop-repair', alias: 'laptop screen broken', weight: 1.0 },
    { serviceId: 'svc-laptop-repair', alias: 'laptop battery', weight: 0.9 },
    { serviceId: 'svc-laptop-repair', alias: 'laptop hinge repair', weight: 0.9 },
    { serviceId: 'svc-laptop-repair', alias: 'laptop overheating', weight: 0.9 },

    // Puncture & Automotive
    { serviceId: 'svc-puncture', alias: 'puncture repair', weight: 1.0 },
    { serviceId: 'svc-puncture', alias: 'puncture', weight: 1.0 },
    { serviceId: 'svc-puncture', alias: 'flat tyre', weight: 1.0 },
    { serviceId: 'svc-puncture', alias: 'flat tire', weight: 1.0 },
    { serviceId: 'svc-puncture', alias: 'tubeless puncture', weight: 1.0 },
    { serviceId: 'svc-puncture', alias: 'air leak', weight: 0.9 },
    { serviceId: 'svc-mechanic', alias: 'mechanic', weight: 1.0 },
    { serviceId: 'svc-mechanic', alias: 'car mechanic', weight: 1.0 },
    { serviceId: 'svc-mechanic', alias: 'bike mechanic', weight: 1.0 },
    { serviceId: 'svc-mechanic', alias: 'engine repair', weight: 0.9 },
    { serviceId: 'svc-mechanic', alias: 'brake issue', weight: 0.9 },

    // Education & Campus
    { serviceId: 'svc-java-tutor', alias: 'java tutor', weight: 1.0 },
    { serviceId: 'svc-java-tutor', alias: 'java teacher', weight: 1.0 },
    { serviceId: 'svc-java-tutor', alias: 'teach me java', weight: 1.0 },
    { serviceId: 'svc-java-tutor', alias: 'java programming', weight: 1.0 },
    { serviceId: 'svc-java-tutor', alias: 'java dsa', weight: 0.9 },
    { serviceId: 'svc-project-guide', alias: 'project guidance', weight: 1.0 },
    { serviceId: 'svc-project-guide', alias: 'college project', weight: 1.0 },
    { serviceId: 'svc-project-guide', alias: 'college project guidance', weight: 1.0 },
    { serviceId: 'svc-project-guide', alias: 'final year project', weight: 1.0 },
    { serviceId: 'svc-prog-mentor', alias: 'programming mentor', weight: 1.0 },
    { serviceId: 'svc-prog-mentor', alias: 'coding help', weight: 1.0 },
    { serviceId: 'svc-prog-mentor', alias: 'python tutor', weight: 0.9 },

    // Creative & Construction
    { serviceId: 'svc-graphic-designer', alias: 'graphic designer', weight: 1.0 },
    { serviceId: 'svc-graphic-designer', alias: 'poster designer', weight: 1.0 },
    { serviceId: 'svc-graphic-designer', alias: 'event poster', weight: 1.0 },
    { serviceId: 'svc-graphic-designer', alias: 'college event designer', weight: 1.0 },
    { serviceId: 'svc-photographer', alias: 'photographer', weight: 1.0 },
    { serviceId: 'svc-photographer', alias: 'event photographer', weight: 1.0 },
    { serviceId: 'svc-civil-engineer', alias: 'civil engineer', weight: 1.0 },
    { serviceId: 'svc-civil-engineer', alias: 'construction engineer', weight: 1.0 },
    { serviceId: 'svc-architect', alias: 'architect', weight: 1.0 },
    { serviceId: 'svc-architect', alias: 'house plan designer', weight: 1.0 },
    { serviceId: 'svc-ac-tech', alias: 'ac technician', weight: 1.0 },
    { serviceId: 'svc-ac-tech', alias: 'ac repair', weight: 1.0 },
    { serviceId: 'svc-ac-tech', alias: 'ac servicing', weight: 1.0 },
    { serviceId: 'svc-ac-tech', alias: 'ac not cooling', weight: 1.0 },
  ];

  let aliasIdx = 1;
  for (const a of aliases) {
    const aliasId = `alias-${aliasIdx++}`;
    await db.query(
      `INSERT INTO service_aliases (id, service_id, alias, weight)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (alias) DO UPDATE SET weight = EXCLUDED.weight`,
      [aliasId, a.serviceId, a.alias, a.weight]
    );
  }

  // 4. Seed Matching Configuration
  const matchingWeights = [
    { key: 'service_relevance', weight: 0.35, desc: 'Exact and related service capability match' },
    { key: 'skill_match', weight: 0.20, desc: 'Bio, custom title and keyword similarity' },
    { key: 'location_distance', weight: 0.15, desc: 'Proximity decay based on Haversine distance' },
    { key: 'service_radius', weight: 0.10, desc: 'Proximity headroom within provider service radius' },
    { key: 'availability', weight: 0.05, desc: 'Current active availability status (Available vs Busy)' },
    { key: 'experience', weight: 0.05, desc: 'Logarithmic scaling of years of verified experience' },
    { key: 'reputation', weight: 0.05, desc: 'Bayesian mean of verified post-resolution ratings' },
    { key: 'verification', weight: 0.05, desc: 'Identity and qualification attestation status' },
  ];

  let weightIdx = 1;
  for (const mw of matchingWeights) {
    await db.query(
      `INSERT INTO matching_configuration (id, key, weight, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO UPDATE SET weight = EXCLUDED.weight, description = EXCLUDED.description`,
      [`cfg-${weightIdx++}`, mw.key, mw.weight, mw.desc]
    );
  }

  // 5. Seed Core Users (Admin and Needer)
  const passwordHash = await bcrypt.hash('Password@123', 10);

  // Admin User
  await db.query(
    `INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (email) DO NOTHING`,
    ['usr-admin-1', 'admin@civicsolve.org', passwordHash, 'ADMIN', 'CivicSolve Admin', '+91 98765 43210', 1]
  );

  // Needer User
  await db.query(
    `INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (email) DO NOTHING`,
    ['usr-needer-1', 'needer@civicsolve.org', passwordHash, 'NEEDER', 'Rahul Sharma', '+91 98111 22334', 1]
  );

  // 6. Seed Realistic Problem Solvers / Providers
  const demoProviders = [
    {
      userId: 'usr-prov-1',
      email: 'painter.prakash@civicsolve.demo',
      name: 'Prakash Varma',
      phone: '+91 98450 11223',
      providerType: 'INDIVIDUAL',
      businessName: null,
      title: 'Master Residential Painter',
      bio: 'Expert wall painter with 8 years of experience in interior distemper, exterior emulsion, and damp proofing.',
      expYears: 8.0,
      mode: 'HOME_VISIT',
      radius: 12.0,
      verified: 1,
      rating: 4.88,
      reviews: 32,
      availability: 'AVAILABLE',
      lat: 12.9716, // Bengaluru center approx
      lng: 77.5946,
      area: 'Indiranagar',
      city: 'Bengaluru',
      serviceId: 'svc-painter',
      startPrice: 25.0,
      minPrice: 25.0,
      maxPrice: 45.0,
      unit: 'PER_SQFT',
      notes: 'Final quote depends on surface priming and coats.',
    },
    {
      userId: 'usr-prov-2',
      email: 'plumber.ramesh@civicsolve.demo',
      name: 'Ramesh Kumar',
      phone: '+91 98450 22334',
      providerType: 'INDIVIDUAL',
      businessName: null,
      title: 'Certified Sanitary & Tap Plumber',
      bio: 'Specialist in bathroom leakage fixing, pipe repairs, flush tank servicing, and emergency tap leaks.',
      expYears: 6.5,
      mode: 'HOME_VISIT',
      radius: 10.0,
      verified: 1,
      rating: 4.92,
      reviews: 47,
      availability: 'AVAILABLE',
      lat: 12.9750,
      lng: 77.6000,
      area: 'Koramangala',
      city: 'Bengaluru',
      serviceId: 'svc-plumber',
      startPrice: 299.0,
      minPrice: 299.0,
      maxPrice: 850.0,
      unit: 'PER_SERVICE',
      notes: 'Replacement spare parts charged at actual hardware store receipts.',
    },
    {
      userId: 'usr-prov-3',
      email: 'electrician.suresh@civicsolve.demo',
      name: 'Suresh Babu',
      phone: '+91 98450 33445',
      providerType: 'INDIVIDUAL',
      businessName: null,
      title: 'Licensed Domestic Electrician',
      bio: 'Short circuit diagnosis, switchboard replacements, MCB tripping resolution, and house wiring.',
      expYears: 9.0,
      mode: 'HOME_VISIT',
      radius: 15.0,
      verified: 1,
      rating: 4.85,
      reviews: 58,
      availability: 'AVAILABLE',
      lat: 12.9352,
      lng: 77.6245,
      area: 'HSR Layout',
      city: 'Bengaluru',
      serviceId: 'svc-electrician',
      startPrice: 250.0,
      minPrice: 250.0,
      maxPrice: 600.0,
      unit: 'PER_SERVICE',
      notes: 'Standard inspection and minor diagnosis included in visit fee.',
    },
    {
      userId: 'usr-prov-4',
      email: 'laptop.fix@civicsolve.demo',
      name: 'Karthik Rao',
      phone: '+91 98450 44556',
      providerType: 'BUSINESS',
      businessName: 'Apex Tech Care & Laptop Clinic',
      title: 'Senior Chip-Level Laptop Technician',
      bio: 'Screen black diagnostics, display ribbon replacement, motherboard repairs, SSD upgrades, and formatting.',
      expYears: 7.0,
      mode: 'BOTH',
      radius: 15.0,
      verified: 1,
      rating: 4.90,
      reviews: 84,
      availability: 'AVAILABLE',
      lat: 12.9279,
      lng: 77.6271,
      area: 'BTM Layout',
      city: 'Bengaluru',
      serviceId: 'svc-laptop-repair',
      startPrice: 450.0,
      minPrice: 450.0,
      maxPrice: 1500.0,
      unit: 'PER_SERVICE',
      notes: 'Walk-in service center and doorstep pickup both available.',
    },
    {
      userId: 'usr-prov-5',
      email: 'puncture.quick@civicsolve.demo',
      name: 'Anil Tyres & Quick Assistance',
      phone: '+91 98450 55667',
      providerType: 'INDIVIDUAL',
      businessName: null,
      title: 'Mobile Puncture & Roadside Tyre Specialist',
      bio: 'Fast roadside tubeless puncture fixing, flat tyre repair, tube valve repair, and stepney change.',
      expYears: 5.0,
      mode: 'HOME_VISIT',
      radius: 10.0,
      verified: 1,
      rating: 4.80,
      reviews: 29,
      availability: 'AVAILABLE',
      lat: 12.9780,
      lng: 77.6400,
      area: 'Domlur',
      city: 'Bengaluru',
      serviceId: 'svc-puncture',
      startPrice: 150.0,
      minPrice: 150.0,
      maxPrice: 350.0,
      unit: 'PER_SERVICE',
      notes: 'On-site mobile assistance within 20-30 minutes.',
    },
    {
      userId: 'usr-prov-6',
      email: 'java.mentor@civicsolve.demo',
      name: 'Aditya Sen',
      phone: '+91 98450 66778',
      providerType: 'STUDENT',
      businessName: null,
      title: 'Java TA & Competitive Programming Mentor',
      bio: 'Final year CS student and teaching assistant. Mentoring in Core Java, OOPs, Data Structures, and college projects.',
      expYears: 3.0,
      mode: 'BOTH',
      radius: 20.0,
      verified: 1,
      rating: 4.95,
      reviews: 22,
      availability: 'AVAILABLE',
      lat: 12.9340,
      lng: 77.6060,
      area: 'Jayanagar',
      city: 'Bengaluru',
      serviceId: 'svc-java-tutor',
      startPrice: 400.0,
      minPrice: 400.0,
      maxPrice: 700.0,
      unit: 'PER_HOUR',
      notes: 'One-on-one personalized session with practical coding examples.',
    },
    {
      userId: 'usr-prov-7',
      email: 'design.riya@civicsolve.demo',
      name: 'Riya Mukherjee',
      phone: '+91 98450 77889',
      providerType: 'FREELANCER',
      businessName: null,
      title: 'Event Poster & Brand Identity Designer',
      bio: 'Freelance graphic designer specializing in college festival posters, tech symposium banners, and social flyers.',
      expYears: 4.0,
      mode: 'SERVICE_CENTER',
      radius: 25.0,
      verified: 1,
      rating: 4.86,
      reviews: 35,
      availability: 'AVAILABLE',
      lat: 12.9850,
      lng: 77.6100,
      area: 'MG Road',
      city: 'Bengaluru',
      serviceId: 'svc-graphic-designer',
      startPrice: 500.0,
      minPrice: 500.0,
      maxPrice: 1200.0,
      unit: 'PER_ITEM',
      notes: 'High resolution print-ready vector files and 2 design iterations included.',
    },
    {
      userId: 'usr-prov-8',
      email: 'civil.consult@civicsolve.demo',
      name: 'Er. Sandeep Joshi',
      phone: '+91 98450 88990',
      providerType: 'BUSINESS',
      businessName: 'Joshi Structural & Civil Consultants',
      title: 'Consulting Civil & Structural Engineer',
      bio: 'M.Tech Structural Engineering. Site feasibility audits, structural stability inspection, and residential planning.',
      expYears: 12.0,
      mode: 'HOME_VISIT',
      radius: 30.0,
      verified: 1,
      rating: 4.93,
      reviews: 41,
      availability: 'AVAILABLE',
      lat: 12.9600,
      lng: 77.5800,
      area: 'Basavanagudi',
      city: 'Bengaluru',
      serviceId: 'svc-civil-engineer',
      startPrice: 1500.0,
      minPrice: 1500.0,
      maxPrice: 4000.0,
      unit: 'PER_DAY',
      notes: 'Comprehensive structural report and site inspection checklist.',
    },
    {
      userId: 'usr-prov-9',
      email: 'ac.coolcare@civicsolve.demo',
      name: 'CoolAir Solutions',
      phone: '+91 98450 99001',
      providerType: 'BUSINESS',
      businessName: 'CoolAir HVAC Services',
      title: 'Commercial & Home AC Specialist',
      bio: 'Specialist in split AC wet servicing, gas leakage diagnosis, compressor replacement, and cooling optimization.',
      expYears: 8.5,
      mode: 'HOME_VISIT',
      radius: 18.0,
      verified: 1,
      rating: 4.79,
      reviews: 63,
      availability: 'AVAILABLE',
      lat: 12.9900,
      lng: 77.5700,
      area: 'Malleshwaram',
      city: 'Bengaluru',
      serviceId: 'svc-ac-tech',
      startPrice: 499.0,
      minPrice: 499.0,
      maxPrice: 1800.0,
      unit: 'PER_SERVICE',
      notes: 'Jet foam high-pressure cleaning with drain line clearing.',
    },
  ];

  for (const p of demoProviders) {
    // Create user
    await db.query(
      `INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
       VALUES ($1, $2, $3, 'PROVIDER', $4, $5, 1)
       ON CONFLICT (email) DO NOTHING`,
      [p.userId, p.email, passwordHash, p.name, p.phone]
    );

    const profileId = `prof-${p.userId}`;
    // Create provider profile
    await db.query(
      `INSERT INTO provider_profiles (id, user_id, provider_type, business_name, professional_title, bio, experience_years, service_mode, service_radius_km, is_verified, rating_avg, review_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (user_id) DO UPDATE SET
         professional_title = EXCLUDED.professional_title,
         bio = EXCLUDED.bio,
         rating_avg = EXCLUDED.rating_avg,
         review_count = EXCLUDED.review_count`,
      [profileId, p.userId, p.providerType, p.businessName, p.title, p.bio, p.expYears, p.mode, p.radius, p.verified, p.rating, p.reviews]
    );

    // Create location
    await db.query(
      `INSERT INTO provider_locations (id, provider_id, latitude, longitude, address_line, area, city, pincode, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (provider_id) DO UPDATE SET
         latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude,
         area = EXCLUDED.area,
         city = EXCLUDED.city`,
      [`loc-${profileId}`, profileId, p.lat, p.lng, p.businessName ? `${p.area}, Main Road` : null, p.area, p.city, '560001', p.providerType === 'BUSINESS' ? 1 : 0]
    );

    // Create availability
    await db.query(
      `INSERT INTO provider_availability (id, provider_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (provider_id) DO UPDATE SET status = EXCLUDED.status`,
      [`avail-${profileId}`, profileId, p.availability]
    );

    // Link offered service
    const provSvcId = `ps-${profileId}-${p.serviceId}`;
    await db.query(
      `INSERT INTO provider_services (id, provider_id, service_id, custom_title, custom_description, is_active)
       VALUES ($1, $2, $3, $4, $5, 1)
       ON CONFLICT (provider_id, service_id) DO NOTHING`,
      [provSvcId, profileId, p.serviceId, p.title, p.bio]
    );

    // Link pricing
    await db.query(
      `INSERT INTO service_pricing (id, provider_service_id, starting_price, typical_min, typical_max, pricing_unit, pricing_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (provider_service_id) DO UPDATE SET
         starting_price = EXCLUDED.starting_price,
         typical_min = EXCLUDED.typical_min,
         typical_max = EXCLUDED.typical_max`,
      [`prc-${provSvcId}`, provSvcId, p.startPrice, p.minPrice, p.maxPrice, p.unit, p.notes]
    );
  }

  // 1. Seed Platform Administrator
  const adminId = 'usr-admin-master';
  await db.query(
    `INSERT INTO users (id, email, password_hash, role, full_name, phone, is_active)
     VALUES ($1, 'admin@civicsolve.org', $2, 'ADMIN', 'CivicSolve Platform Admin', '+91 90000 00001', 1)
     ON CONFLICT (email) DO NOTHING`,
    [adminId, passwordHash]
  );

  // 2. Seed Default Matching Configuration Weights
  const defaultWeights = [
    { key: 'WEIGHT_SERVICE_MATCH', weight: 0.35, desc: 'Direct canonical service or problem match score' },
    { key: 'WEIGHT_SKILL_OVERLAP', weight: 0.20, desc: 'Secondary skill keywords & colloquial phrase overlap' },
    { key: 'WEIGHT_DISTANCE', weight: 0.15, desc: 'Proximity decay based on spherical distance' },
    { key: 'WEIGHT_RADIUS_FIT', weight: 0.10, desc: 'Coverage ratio within provider operating radius' },
    { key: 'WEIGHT_AVAILABILITY', weight: 0.05, desc: 'Real-time online & active ready-to-serve status' },
    { key: 'WEIGHT_EXPERIENCE', weight: 0.05, desc: 'Years of demonstrated field experience' },
    { key: 'WEIGHT_BAYESIAN_RATING', weight: 0.05, desc: 'Bayesian mean weighted customer satisfaction' },
    { key: 'WEIGHT_VERIFICATION', weight: 0.05, desc: 'Government or institutional credential attestation' },
  ];

  for (const w of defaultWeights) {
    await db.query(
      `INSERT INTO matching_configuration (id, key, weight, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (key) DO NOTHING`,
      [`cfg-${w.key}`, w.key, w.weight, w.desc]
    );
  }

  // 3. Seed Sample Verification Attestation for an unverified provider
  const unverifiedProv = await db.queryOne<{ id: string }>(
    'SELECT id FROM provider_profiles WHERE is_verified = 0 LIMIT 1'
  );
  if (unverifiedProv) {
    await db.query(
      `INSERT INTO verification_attestations (id, provider_id, attestation_type, reference_data, status)
       VALUES ($1, $2, 'BUSINESS_REG', 'GSTIN: 29AABCU9603R1ZM / Trade License #BLR-2024-9912', 'PENDING')
       ON CONFLICT (provider_id) DO NOTHING`,
      [`att-${unverifiedProv.id}`, unverifiedProv.id]
    );
  }

  console.log(`✅ Successfully seeded database with ${categories.length} categories, ${services.length} services, ${aliases.length} aliases, and ${demoProviders.length} realistic problem solvers.`);
}

// If executed directly via CLI
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  runSeeds()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}
