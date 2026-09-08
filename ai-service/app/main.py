from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas.models import (
    AnalyzeProblemRequest,
    AnalyzeProblemResponse,
    MatchRequest,
    MatchResponse
)
from .analyzers.problem_analyzer import analyze_civic_problem
from .matching.matcher import rank_candidates

app = FastAPI(
    title="CivicSolve AI Service",
    description="NLP-assisted civic problem categorization and explainable multi-factor skill matching service.",
    version="1.0.0"
)

# Enable CORS for frontend and backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "civicsolve-ai-service",
        "version": "1.0.0",
        "engine": "Transparent Hybrid NLP & Explainable Multi-factor Matching"
    }

@app.post("/analyze-problem", response_model=AnalyzeProblemResponse)
def analyze_problem(req: AnalyzeProblemRequest):
    if not req.title or not req.description:
        raise HTTPException(status_code=400, detail="Title and description are required for problem analysis.")
    
    analysis = analyze_civic_problem(
        title=req.title,
        description=req.description,
        location=req.location or ""
    )
    return analysis

@app.post("/match", response_model=MatchResponse)
def match_candidates(req: MatchRequest):
    if not req.candidates:
        return MatchResponse(
            challenge_title=req.challenge.title,
            total_candidates_analyzed=0,
            matches=[]
        )
    
    result = rank_candidates(challenge=req.challenge, candidates=req.candidates)
    return result

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
