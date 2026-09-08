from typing import List, Dict, Any
from ..schemas.models import (
    ChallengeContext,
    CandidateProfile,
    CandidateMatch,
    FactorBreakdown,
    MatchResponse
)

PROFICIENCY_WEIGHTS = {
    "Expert": 1.0,
    "Advanced": 0.85,
    "Intermediate": 0.70,
    "Beginner": 0.50
}

# Domain skill affinity map to calculate related skill credit
SKILL_ALIASES = {
    "Hydrology": ["hydrology", "water resources", "urban drainage", "flood modeling", "water management", "drainage"],
    "Drainage Design": ["drainage design", "drainage", "urban drainage", "stormwater", "drainage infrastructure", "civil engineering"],
    "GIS": ["gis", "autocad", "spatial analysis", "mapping", "geospatial", "civil engineering"],
    "Urban Planning": ["urban planning", "municipal engineering", "accessibility design", "municipal projects", "field implementation", "civil infrastructure"]
}

def normalize_skill(skill: str) -> str:
    return skill.lower().strip()

def calculate_candidate_match(challenge: ChallengeContext, candidate: CandidateProfile) -> CandidateMatch:
    req_skills = challenge.required_skills
    total_req = max(1, len(req_skills))

    candidate_skill_map = {normalize_skill(s.name): s.proficiency or "Intermediate" for s in candidate.skills}
    candidate_skill_names = list(candidate_skill_map.keys())

    # 1. Skill Match Score (40%)
    matched_skills = []
    missing_skills = []
    skill_points = 0.0

    for req in req_skills:
        req_norm = normalize_skill(req)
        aliases = SKILL_ALIASES.get(req, [req_norm])

        matched_direct = False
        # Direct name check first
        if req_norm in candidate_skill_map:
            prof = candidate_skill_map[req_norm]
            weight = PROFICIENCY_WEIGHTS.get(prof, 0.85)
            skill_points += (1.0 * weight)
            matched_skills.append(req)
            matched_direct = True
        else:
            # Check aliases
            for alias in aliases:
                if alias in candidate_skill_map:
                    prof = candidate_skill_map[alias]
                    weight = PROFICIENCY_WEIGHTS.get(prof, 0.80)
                    skill_points += (0.90 * weight)
                    # Display original candidate skill or alias
                    matched_skills.append(req)
                    matched_direct = True
                    break

        if not matched_direct:
            # Check partial substring match
            partial = any(alias in s_name or s_name in alias for alias in aliases for s_name in candidate_skill_names)
            if partial:
                skill_points += 0.60
                matched_skills.append(f"{req} (Related)")
            else:
                missing_skills.append(req)

    # Calculate skill readiness score (scaled 0-100 reflecting multi-disciplinary team coverage)
    if skill_points <= 0.1:
        skill_score = 15
    elif skill_points < 1.0:
        skill_score = int(35 + (skill_points / total_req) * 40)
    else:
        # 1 or more core skill matches gives significant baseline skill relevance
        skill_score = min(95, int(48 + (skill_points / total_req) * 58))

    # 2. Domain / Category Match (25%)
    domain_score = 70
    bio_and_skills = f"{candidate.role} {candidate.institution or ''} {candidate.bio or ''} {' '.join(candidate_skill_names)}".lower()

    if any(k in bio_and_skills for k in ["civil", "drainage", "hydrology", "water", "infrastructure"]):
        if candidate.role == "expert":
            domain_score = 96
        elif candidate.role == "industry":
            domain_score = 92
        else:
            domain_score = 94
    elif "environmental" in bio_and_skills:
        domain_score = 75

    # 3. Location Match (15%)
    location_score = 60
    if challenge.location and candidate.location:
        c_loc = challenge.location.lower()
        cand_loc = candidate.location.lower()
        if c_loc in cand_loc or cand_loc in c_loc:
            location_score = 95
        elif any(loc in cand_loc for loc in ["tamil nadu", "chennai", "coimbatore", "madurai", "trichy"]):
            location_score = 80

    # 4. Experience / Role Proficiency (20%)
    exp_score = 75
    if candidate.role == "expert":
        exp_score = 95
    elif candidate.role == "industry":
        exp_score = 90
    elif candidate.role == "student":
        has_advanced = any(p in ["Advanced", "Expert"] for p in candidate_skill_map.values())
        exp_score = 88 if has_advanced else 78

    # Final Weighted Score: 40% Skill + 25% Domain + 15% Location + 20% Experience
    final_score = int(
        (0.40 * skill_score) +
        (0.25 * domain_score) +
        (0.15 * location_score) +
        (0.20 * exp_score)
    )
    final_score = max(30, min(98, final_score))

    # Remove duplicates from matched_skills while preserving order
    matched_skills = list(dict.fromkeys(matched_skills))

    # Formulate clear explainable reason
    top_matches = [m for m in matched_skills if not m.endswith("(Related)")][:3]
    if top_matches:
        skills_str = ", ".join(top_matches)
        if candidate.role == "student":
            reason = f"Strong academic and practical match: Proficient in {skills_str} with hands-on GIS and drainage project coursework in {candidate.location}."
        elif candidate.role == "expert":
            reason = f"Senior domain authority: Deep expertise in {skills_str} with extensive research and advisory track record in stormwater modeling."
        elif candidate.role == "industry":
            reason = f"Practical implementation partner: On-ground field execution capabilities in {skills_str} and municipal culvert maintenance."
        else:
            reason = f"Relevant background in {skills_str} aligning with core project objectives."
    else:
        reason = f"Complementary civic background with transferable skills in {', '.join(candidate_skill_names[:2])}."

    return CandidateMatch(
        user_id=candidate.id,
        name=candidate.name,
        role=candidate.role,
        institution=candidate.institution,
        location=candidate.location,
        score=final_score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        factor_breakdown=FactorBreakdown(
            skill_score=skill_score,
            domain_score=domain_score,
            location_score=location_score,
            experience_score=exp_score
        ),
        reason=reason
    )

def rank_candidates(challenge: ChallengeContext, candidates: List[CandidateProfile]) -> MatchResponse:
    matches = [calculate_candidate_match(challenge, c) for c in candidates]
    # Sort descending by score
    matches.sort(key=lambda m: m.score, reverse=True)
    return MatchResponse(
        challenge_title=challenge.title,
        total_candidates_analyzed=len(candidates),
        matches=matches
    )
