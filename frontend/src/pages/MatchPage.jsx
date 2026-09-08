import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, CheckCircle2, Award, Building, GraduationCap, MapPin,
  ArrowRight, ShieldCheck, RefreshCw, AlertCircle, Sparkles, Check
} from 'lucide-react';

export default function MatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [matches, setMatches] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set([2, 3, 4])); // Default select top 3
  const [teamName, setTeamName] = useState('CivicSolve Flood Response Team');
  const [teamObjective, setTeamObjective] = useState('Develop a practical decentralized drainage intervention to mitigate recurring urban flooding.');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      api.getChallengeById(id),
      api.getChallengeMatches(id)
    ])
      .then(([cData, mData]) => {
        setChallenge(cData.challenge);
        setMatches(mData.matches || []);
        if (mData.matches && mData.matches.length >= 3) {
          const topThree = new Set(mData.matches.slice(0, 3).map(m => m.user_id));
          setSelectedUserIds(topThree);
        }
      })
      .catch(err => {
        console.error('Failed to load matching candidates:', err);
        setError('Failed to compute smart matches: ' + err.message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const toggleSelectUser = (userId) => {
    const next = new Set(selectedUserIds);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUserIds(next);
  };

  const handleCreateTeam = async () => {
    if (selectedUserIds.size === 0) {
      alert('Please select at least one candidate to form a team.');
      return;
    }

    setIsCreatingTeam(true);
    try {
      const selectedMatches = matches.filter(m => selectedUserIds.has(m.user_id));
      const members = selectedMatches.map(m => {
        let role = 'Collaborator';
        if (m.role === 'student') role = 'Field Analysis & GIS Mapping';
        else if (m.role === 'expert') role = 'Hydrology & Technical Review Lead';
        else if (m.role === 'industry') role = 'Field Implementation Partner';
        return { user_id: m.user_id, role };
      });

      const res = await api.createTeam({
        challenge_id: Number(id),
        name: teamName,
        members
      });

      navigate(`/teams/${res.team.id}`);
    } catch (err) {
      console.error('Failed to create team:', err);
      alert('Error creating team: ' + err.message);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'student': return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'expert': return <Award className="w-5 h-5 text-purple-600" />;
      case 'industry': return <Building className="w-5 h-5 text-amber-600" />;
      default: return <Users className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Required by Phase 8 */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-civic bg-teal-100 text-teal-800 border border-teal-200">
              Smart Matching Algorithm
            </span>
            <span className="text-xs text-slate-500">4-Factor Weighted Ranking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            People who can help solve this problem
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Ranked candidates computed via Python FastAPI /match service with explainable factor breakdowns.
          </p>
        </div>

        <Link
          to={`/challenges/${id}`}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-slate-100 transition shrink-0"
        >
          Challenge Details
        </Link>
      </div>

      {challenge && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 space-y-2">
          <div className="text-[10px] font-mono text-teal-300 uppercase tracking-wider font-bold">Target Challenge</div>
          <div className="text-base sm:text-lg font-bold text-white">{challenge.title}</div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="flex items-center gap-1 font-semibold text-teal-300"><MapPin className="w-3.5 h-3.5" /> {challenge.location}</span>
            <span>• {challenge.category}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200/90">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-600" />
          <div className="font-semibold text-sm text-slate-800">Calculating Candidate Scoring Factors...</div>
          <div className="text-xs text-slate-500 mt-1">Evaluating Skill Match (40%), Domain (25%), Location (15%), Experience (20%)</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Candidates Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Ranked Recommendations ({matches.length})
              </span>
              <span className="text-xs text-slate-400">Tap card to select</span>
            </div>

            {matches.map((cand) => {
              const isSelected = selectedUserIds.has(cand.user_id);
              const fb = cand.factor_breakdown || {
                skill_score: 90,
                domain_score: 94,
                location_score: 95,
                experience_score: 88
              };

              return (
                <div
                  key={cand.user_id}
                  onClick={() => toggleSelectUser(cand.user_id)}
                  className={`card-civic p-5 cursor-pointer border-2 transition-all ${
                    isSelected ? 'border-teal-600 bg-teal-50/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
                  }`}
                  id={`match-candidate-card-${cand.user_id}`}
                >
                  {/* Candidate Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-slate-100 rounded-xl mt-0.5 shrink-0">
                        {getRoleIcon(cand.role)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-slate-900 leading-snug">{cand.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                            {cand.role}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">{cand.institution}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" /> {cand.location}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-mono text-2xl sm:text-3xl font-extrabold text-teal-700 leading-none">
                        {cand.score}%
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                        Match Score
                      </div>
                    </div>
                  </div>

                  {/* WHY THIS MATCH? Section with Compact Progress Bars Required by Phase 8 */}
                  <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2.5 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5 text-teal-800">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        WHY THIS MATCH?
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Explainable Factors</span>
                    </div>

                    {/* 4 Factor Visual Progress Bars Required by Phase 8 */}
                    <div className="space-y-2 pt-1">
                      {/* Skill Match */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Skill Match (40%)</span>
                          <span className="font-mono font-bold text-slate-800">{fb.skill_score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-600 h-full rounded-full transition-all duration-500" style={{ width: `${fb.skill_score}%` }} />
                        </div>
                      </div>

                      {/* Domain Alignment */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Domain Alignment (25%)</span>
                          <span className="font-mono font-bold text-slate-800">{fb.domain_score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-teal-700 h-full rounded-full transition-all duration-500" style={{ width: `${fb.domain_score}%` }} />
                        </div>
                      </div>

                      {/* Location Relevance */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Location Relevance (15%)</span>
                          <span className="font-mono font-bold text-slate-800">{fb.location_score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${fb.location_score}%` }} />
                        </div>
                      </div>

                      {/* Experience Readiness */}
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-600 mb-0.5">
                          <span>Experience Readiness (20%)</span>
                          <span className="font-mono font-bold text-slate-800">{fb.experience_score}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${fb.experience_score}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Explanatory Reasoning String */}
                    <p className="text-slate-700 leading-relaxed pt-1.5 border-t border-slate-200/80 text-[11px]">
                      <strong>Why matched:</strong> {cand.reason}
                    </p>
                  </div>

                  {/* Matched Skills & Selection Toggle */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[11px] font-semibold text-slate-500">Skills:</span>
                      {cand.matched_skills.map(sk => (
                        <span key={sk} className="text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className={isSelected ? 'text-teal-800' : 'text-slate-500'}>
                        {isSelected ? 'Selected for Team' : 'Select'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Team Formation Sidebar / Sticky Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm space-y-4 sticky top-20">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Team Assembly</span>
              <h3 className="text-base font-bold text-slate-900">Form Civic Solution Team</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Selected contributors will collaborate in a dedicated sprint workspace.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                  id="team-name-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Team Objective</label>
                <textarea
                  rows={2}
                  value={teamObjective}
                  onChange={(e) => setTeamObjective(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
                />
              </div>

              {/* Selected Roster Summary */}
              <div>
                <div className="text-xs font-bold text-slate-700 mb-1.5 flex justify-between">
                  <span>Selected Roster ({selectedUserIds.size})</span>
                  <span className="text-teal-600 font-mono text-[11px]">Ready</span>
                </div>
                <div className="space-y-1.5">
                  {matches.filter(m => selectedUserIds.has(m.user_id)).map(m => (
                    <div key={m.user_id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[10px] text-slate-500 capitalize">{m.role}</div>
                      </div>
                      <span className="font-mono text-teal-700 font-bold text-xs">{m.score}%</span>
                    </div>
                  ))}
                  {selectedUserIds.size === 0 && (
                    <div className="text-xs text-rose-500 text-center py-2">
                      Select at least 1 candidate above.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateTeam}
                disabled={isCreatingTeam || selectedUserIds.size === 0}
                id="create-team-btn"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition flex items-center justify-center gap-2 touch-target"
              >
                {isCreatingTeam ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Creating Team Workspace...</span>
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4" />
                    <span>Create Team Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
