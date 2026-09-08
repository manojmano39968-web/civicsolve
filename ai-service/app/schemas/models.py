from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AnalyzeProblemRequest(BaseModel):
    title: str = Field(..., example="Recurring Urban Flooding Near Residential Area")
    description: str = Field(..., example="During heavy rainfall, the road and surrounding residential streets experience severe waterlogging.")
    location: Optional[str] = Field("Chennai", example="Chennai")

class AnalyzeProblemResponse(BaseModel):
    category: str
    domain: str
    required_skills: List[str]
    severity: str
    keywords: List[str]
    confidence: float
    reason: str

class CandidateSkill(BaseModel):
    name: str
    proficiency: Optional[str] = "Intermediate"

class CandidateProfile(BaseModel):
    id: int
    name: str
    role: str
    institution: Optional[str] = None
    location: str
    skills: List[CandidateSkill]
    bio: Optional[str] = None

class ChallengeContext(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    category: Optional[str] = None
    location: Optional[str] = None
    required_skills: List[str]

class MatchRequest(BaseModel):
    challenge: ChallengeContext
    candidates: List[CandidateProfile]

class FactorBreakdown(BaseModel):
    skill_score: int
    domain_score: int
    location_score: int
    experience_score: int

class CandidateMatch(BaseModel):
    user_id: int
    name: str
    role: str
    institution: Optional[str] = None
    location: str
    score: int
    matched_skills: List[str]
    missing_skills: List[str]
    factor_breakdown: FactorBreakdown
    reason: str

class MatchResponse(BaseModel):
    challenge_title: str
    total_candidates_analyzed: int
    matches: List[CandidateMatch]
