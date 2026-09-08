import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award, Building, CheckCircle2, ShieldCheck, ArrowRight,
  Sparkles, MapPin, Layers, Users, ChevronRight, FileText
} from 'lucide-react';

export default function ExpertDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = currentUser?.role === 'industry' ? 4 : 3;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getUserProfile(userId),
      api.getUserRecommendations(userId)
    ])
      .then(([pData, rData]) => {
        setProfile(pData.user);
        setRecommendations(rData.recommendations || []);
      })
      .catch(err => console.error('Failed to load expert dashboard:', err))
      .finally(() => setLoading(false));
  }, [userId]);

  const isIndustry = currentUser?.role === 'industry';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge-subtle ${isIndustry ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'} border`}>
              {isIndustry ? 'Industry Implementation Portal' : 'Faculty & Domain Expert Portal'}
            </span>
            <span className="text-xs text-slate-500">Advisory & Validation Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {profile?.name || (isIndustry ? 'Ravi Infrastructure Solutions' : 'Dr. Meena Raman')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {profile?.institution} • {profile?.location}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/teams/1"
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <span>Active Team Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Expertise & Active Collaboration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Expertise Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Domain Competencies</h2>
          <div className="space-y-2.5">
            {(isIndustry ? [
              { name: 'Drainage Infrastructure', prof: 'Expert', desc: 'Precast culverts & trenchless lines' },
              { name: 'Field Implementation', prof: 'Expert', desc: 'Heavy civil machinery execution' },
              { name: 'Municipal Projects', prof: 'Advanced', desc: 'Corporation contract standards' },
              { name: 'Municipal Engineering', prof: 'Advanced', desc: 'Roadside runoff conduit layout' }
            ] : [
              { name: 'Hydrology & Catchments', prof: 'Expert', desc: '14+ yrs watershed runoff modeling' },
              { name: 'Urban Drainage Design', prof: 'Expert', desc: 'Hydraulic gradient & pipe sizing' },
              { name: 'Water Resources Management', prof: 'Expert', desc: 'Flood mitigation policy' },
              { name: 'Urban Planning Advisory', prof: 'Advanced', desc: 'Master plan integration' }
            ]).map(sk => (
              <div key={sk.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{sk.name}</div>
                  <div className="text-[10px] text-slate-500">{sk.desc}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                  {sk.prof}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Collaboration Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Active Advisory Projects (1 Ongoing)</h2>
            <span className="text-xs text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded">Milestone Review Stage</span>
          </div>

          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
                CivicSolve Flood Response Team
              </span>
              <span className="text-xs text-slate-500">Role: {isIndustry ? 'Implementation Partner' : 'Hydrology Technical Review Lead'}</span>
            </div>

            <h3 className="font-bold text-slate-900 text-sm">
              Recurring Urban Flooding Near Residential Area (Chennai)
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Collaborating with student lead Arjun Kumar (GIS mapping) and municipal partners to finalize the 400m auxiliary gradient bypass specification.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <span>Progress: <strong className="text-slate-800">68%</strong></span>
                <span>• Next Action: <strong className="text-teal-700">Pilot Spec Sign-off</strong></span>
              </div>

              <div className="flex gap-2">
                <Link to="/solutions/1" className="px-3 py-1.5 bg-slate-900 text-white rounded font-medium">
                  Review Solution
                </Link>
                <Link to="/teams/1" className="px-3 py-1.5 bg-slate-200 text-slate-800 rounded font-medium hover:bg-slate-300">
                  Workspace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Relevant Challenges Matching Domain */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Challenges Matching Your Expertise</h2>
            <p className="text-xs text-slate-500">Municipal and community problems seeking senior technical review in {profile?.location || 'Chennai'}.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">
            {recommendations.length} Matching Opportunities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {recommendations.slice(0, 3).map((rec) => (
            <div key={rec.challenge_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-purple-300 transition space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                    {rec.match_score}% Expertise Match
                  </span>
                  <span className="text-xs text-slate-500">{rec.location}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2">
                  {rec.title}
                </h3>
                <div className="text-[11px] text-slate-500 mt-1">{rec.category}</div>

                <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                  {rec.reason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(rec.matched_skills || []).slice(0, 2).map(ms => (
                    <span key={ms} className="text-[10px] bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-700">
                      {ms}
                    </span>
                  ))}
                </div>

                <Link
                  to={`/challenges/${rec.challenge_id}`}
                  className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-0.5"
                >
                  <span>Evaluate</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
