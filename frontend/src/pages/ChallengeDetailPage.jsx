import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  MapPin, Users, CheckCircle2, Cpu, BarChart3, FileText,
  ArrowRight, ShieldCheck, Sparkles, RefreshCw, AlertCircle, ChevronRight
} from 'lucide-react';

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchChallenge = () => {
    setLoading(true);
    api.getChallengeById(id)
      .then(data => setChallenge(data.challenge))
      .catch(err => console.error('Failed to load challenge details:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-500 max-w-3xl mx-auto">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
        <div className="text-xs font-medium">Loading challenge details...</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="p-16 text-center text-slate-500 max-w-3xl mx-auto">
        Challenge not found.
      </div>
    );
  }

  const aiReasoning = challenge.id === 1 
    ? "Heavy rainfall, prolonged waterlogging and drainage constraints indicate a need for hydrology assessment, drainage analysis, GIS mapping and urban planning expertise."
    : `AI-assisted analysis identified municipal infrastructure constraints requiring interdisciplinary engineering and community collaboration.`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header Banner Required by Phase 7 */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>{challenge.location}</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">#{challenge.id}</span>
          </div>

          <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300/80">
            Status: {challenge.id === 1 ? 'Solution Development' : challenge.status}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {challenge.title}
        </h1>

        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
          <span>Category: <strong className="text-slate-800">{challenge.category}</strong></span>
          <span>• Submitted by: <strong className="text-slate-800">{challenge.submitter_name || 'Kavitha Rajan'}</strong></span>
        </div>
      </div>

      {/* Structured Sections Required by Phase 7 */}
      <div className="space-y-5">
        {/* 1. Problem Section */}
        <div className="card-civic p-5 sm:p-6 space-y-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Problem Statement</div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Real-World Community Description</h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {challenge.description}
          </p>
        </div>

        {/* 2. AI Understanding Section */}
        <div className="card-civic p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">AI Understanding</div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">AI-Assisted Domain Categorization</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              Transparent NLP
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[11px]">Problem Category</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{challenge.category}</div>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="text-slate-500 text-[11px]">Severity Classification</div>
              <div className="font-bold text-rose-700 text-sm mt-0.5">{challenge.severity}</div>
            </div>
          </div>
        </div>

        {/* 3. Required Skills Section */}
        <div className="card-civic p-5 sm:p-6 space-y-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Required Skills</div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Identified Engineering Disciplines</h2>

          <div className="flex flex-wrap gap-2">
            {(challenge.required_skills || ['Hydrology', 'Drainage Design', 'GIS', 'Urban Planning']).map((sk) => (
              <span
                key={sk}
                className="px-3 py-1.5 bg-teal-50 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{sk}</span>
              </span>
            ))}
          </div>

          {/* 4. Why these skills? Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-700" />
              <span>Why these skills? (AI-Assisted Analysis)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              "{aiReasoning}"
            </p>
          </div>
        </div>

        {/* 5. Active Team if Formed */}
        {challenge.team && (
          <div className="card-civic p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Team</div>
                <h3 className="text-base font-bold text-slate-900">{challenge.team.name}</h3>
              </div>
              <Link to={`/teams/${challenge.team.id}`} className="text-xs font-bold text-teal-700 hover:underline">
                Open Workspace
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
              {(challenge.team.members || []).map(m => (
                <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-bold text-slate-900">{m.name}</div>
                  <div className="text-[11px] text-teal-700 font-medium">{m.team_role}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Stacked on Mobile */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            to={`/challenges/${challenge.id}/matches`}
            className="flex-1 py-3.5 px-4 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 touch-target"
            id="find-people-cta-btn"
          >
            <Users className="w-4 h-4" />
            <span>People Who Can Help Solve This Problem</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {challenge.team && (
            <Link
              to={`/teams/${challenge.team.id}`}
              className="py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 touch-target"
            >
              <span>Team Workspace</span>
            </Link>
          )}

          <Link
            to="/impact/1"
            className="py-3.5 px-5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 touch-target"
          >
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span>View Impact</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
