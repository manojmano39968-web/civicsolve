import re
from typing import List, Dict, Tuple
from ..schemas.models import AnalyzeProblemResponse

# Domain taxonomies and concept dictionaries
CIVIC_DOMAINS = [
    {
        "id": "flooding_drainage",
        "category": "Urban Infrastructure / Flood Management",
        "domain": "Civil Infrastructure & Hydrology",
        "keywords": [
            "flood", "flooding", "waterlogging", "waterlogged", "drain", "drainage",
            "stormwater", "culvert", "waterlogging", "stagnant", "rainfall", "rain",
            "monsoon", "runoff", "choked drain", "overflow", "canal", "inundation",
            "water accumulation", "ponding", "low-lying"
        ],
        "core_skills": ["Hydrology", "Drainage Design", "GIS", "Urban Planning"],
        "primary_focus": "surface water runoff and drainage network capacity"
    },
    {
        "id": "waste_management",
        "category": "Waste Management & Environment",
        "domain": "Environmental Engineering & Public Policy",
        "keywords": [
            "waste", "garbage", "segregation", "compost", "composting", "landfill",
            "plastic", "trash", "dumping", "litter", "organic waste", "biowaste",
            "source segregation", "recycling"
        ],
        "core_skills": ["Waste Management", "Environmental Engineering", "Community Engagement"],
        "primary_focus": "decentralized solid waste management and source segregation"
    },
    {
        "id": "road_safety",
        "category": "Transportation & Road Safety",
        "domain": "Transportation & Municipal Engineering",
        "keywords": [
            "road", "traffic", "accident", "speed", "crossing", "pedestrian",
            "collision", "vehicle", "school zone", "blind turn", "speed breaker",
            "traffic signal", "zebra crossing", "congestion"
        ],
        "core_skills": ["Transportation Engineering", "Road Safety", "Traffic Analysis"],
        "primary_focus": "vehicular speed management and pedestrian safety corridors"
    },
    {
        "id": "water_supply",
        "category": "Water Resources & Supply",
        "domain": "Civil & Hydraulic Engineering",
        "keywords": [
            "pipeline", "leak", "leakage", "drinking water", "water supply", "pressure",
            "pipe", "contamination", "potable", "water tank", "distribution", "valve"
        ],
        "core_skills": ["Water Resources", "Pipeline Systems", "Civil Engineering"],
        "primary_focus": "potable water distribution integrity and pressure monitoring"
    },
    {
        "id": "public_sanitation",
        "category": "Public Health & Sanitation",
        "domain": "Public Health & Civic Infrastructure",
        "keywords": [
            "toilet", "sanitation", "hygiene", "sewage", "restroom", "latrine",
            "plumbing", "cleanliness", "urinal", "public convenience"
        ],
        "core_skills": ["Sanitation", "Public Health", "Civil Engineering"],
        "primary_focus": "community sanitation facilities and maintenance accountability"
    },
    {
        "id": "lake_restoration",
        "category": "Environmental Conservation",
        "domain": "Ecological & Water Resources Engineering",
        "keywords": [
            "lake", "pond", "water body", "restoration", "ecology", "wetland",
            "inflow", "algae", "biodiversity", "eutrophication", "bund", "encroachment"
        ],
        "core_skills": ["Environmental Engineering", "Hydrology", "Water Resources"],
        "primary_focus": "urban wetland rejuvenation and ecological inlet purification"
    },
    {
        "id": "pedestrian_accessibility",
        "category": "Urban Planning & Accessibility",
        "domain": "Urban Design & Infrastructure",
        "keywords": [
            "sidewalk", "footpath", "curb", "ramp", "wheelchair", "accessibility",
            "barrier", "pavement", "obstruction", "walkability", "pedestrian pathway"
        ],
        "core_skills": ["Urban Planning", "Transportation Engineering", "Accessibility Design"],
        "primary_focus": "universal pedestrian mobility and barrier-free pathways"
    }
]

SEVERITY_KEYWORDS = {
    "Critical": ["severe", "life threatening", "acute", "danger", "hazardous", "fatal", "disaster", "collapse"],
    "High": ["heavy", "recurrent", "recurring", "frequent", "hours", "homes", "choke", "stagnant", "school", "overflow", "flooding"],
    "Medium": ["moderate", "intermittent", "inconvenience", "delay", "periodic", "lacking"],
    "Low": ["minor", "aesthetic", "cosmetic", "irregular"]
}

def clean_and_tokenize(text: str) -> List[str]:
    text = text.lower()
    # Normalize punctuation to spaces
    cleaned = re.sub(r'[^a-z0-9\s-]', ' ', text)
    return [t.strip() for t in cleaned.split() if len(t.strip()) > 1]

def analyze_civic_problem(title: str, description: str, location: str = "") -> AnalyzeProblemResponse:
    combined_text = f"{title} {description} {location}".lower()
    tokens = clean_and_tokenize(combined_text)
    token_set = set(tokens)

    # Score each domain by keyword presence
    best_domain = None
    max_score = 0
    matched_keywords_all = []

    for domain_entry in CIVIC_DOMAINS:
        score = 0
        domain_matched = []
        for kw in domain_entry["keywords"]:
            if " " in kw:
                # Multi-word phrase matching
                if kw in combined_text:
                    score += 3
                    domain_matched.append(kw)
            else:
                if kw in token_set:
                    score += 1
                    domain_matched.append(kw)

        if score > max_score:
            max_score = score
            best_domain = domain_entry
            matched_keywords_all = domain_matched

    # Default fallback if no specific keywords matched
    if not best_domain or max_score == 0:
        best_domain = CIVIC_DOMAINS[0]  # Default to Flooding / Civil Infrastructure
        matched_keywords_all = ["waterlogging", "drainage"]

    # Detect severity
    detected_severity = "Medium"
    for severity, kw_list in SEVERITY_KEYWORDS.items():
        if any(kw in combined_text for kw in kw_list):
            detected_severity = severity
            break

    # Calculate confidence based on keyword match density
    confidence = min(0.96, max(0.72, 0.70 + (max_score * 0.04)))

    # Formulate transparent, explainable reasoning
    unique_kws = list(dict.fromkeys(matched_keywords_all))[:5]
    kw_summary = ", ".join([f"'{k}'" for k in unique_kws]) if unique_kws else "civic infrastructure keywords"
    skills_summary = ", ".join(best_domain["core_skills"])

    reason = (
        f"AI-assisted analysis detected key terms ({kw_summary}) indicating {best_domain['primary_focus']}. "
        f"Recommended interdisciplinary expertise in {skills_summary} for viable field resolution."
    )

    return AnalyzeProblemResponse(
        category=best_domain["category"],
        domain=best_domain["domain"],
        required_skills=best_domain["core_skills"],
        severity=detected_severity,
        keywords=unique_kws,
        confidence=round(confidence, 2),
        reason=reason
    )
