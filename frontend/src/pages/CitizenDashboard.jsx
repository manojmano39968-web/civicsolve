import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle, AlertCircle, Users, CheckCircle2, Clock, MapPin,
  ArrowRight, BarChart3, ChevronRight, RefreshCw, Sparkles, Activity
} from 'lucide-react';

export default function CitizenDashboard() {
  const { currentUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCitizenData = () => {
    setLoading(true);
    api.getChallenges()
      .then(data => setChallenges(data.challenges || []))
      .catch(err => console.error('Failed to load citizen challenges:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCitizenData();
  }, []);

  const heroChallenge = challenges.find(c => c.id === 1) || challenges[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Welcome Section Required by Phase 6 */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-civic bg-blue-100 text-blue-800 border border-blue-200">
              Citizen Portal
            </span>
            <span className="text-xs text-slate-500">Velachery, Chennai</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Good morning, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Kavitha'}.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Here’s what is happening with your civic problems.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={fetchCitizenData}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition touch-target flex items-center justify-center"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/submit"
            id="citizen-submit-btn"
            className="flex-1 sm:flex-none px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2 touch-target"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit a Problem</span>
          </Link>
        </div>
      </div>

      {/* Primary Active Problem Card with Hierarchy */}
      {heroChallenge && (
        <div className="bg-slate-900 rounded-2xl text-white p-5 sm:p-7 shadow-lg border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold border border-teal-500/30">
                YOUR ACTIVE ISSUE
              </span>
              <span className="text-xs text-slate-400">Problem #{heroChallenge.id}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-xs font-semibold">
              Status: {heroChallenge.status}
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {heroChallenge.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
              {heroChallenge.description}
            </p>
          </div>

          {/* 4 Hierarchical Metrics Required by Phase 6 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400">Active Problems</div>
              <div className="text-sm font-bold text-white mt-0.5">1 Ongoing</div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400">Team Activity</div>
              <div className="text-sm font-bold text-teal-300 mt-0.5">Flood Response</div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400">Current Progress</div>
              <div className="text-sm font-mono font-bold text-emerald-400 mt-0.5">68% Complete</div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold text-slate-400">Impact Status</div>
              <div className="text-sm font-bold text-amber-300 mt-0.5">Pilot Review</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {(heroChallenge.required_skills || []).map(s => (
                <span key={s} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {s}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/teams/1"
                className="flex-1 sm:flex-none text-center py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition touch-target flex items-center justify-center gap-1"
              >
                <span>Team Space</span>
              </Link>

              <Link
                to="/impact/1"
                className="flex-1 sm:flex-none text-center py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition touch-target flex items-center justify-center gap-1"
              >
                <span>View Impact</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Community Problems Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Your Community Challenges</h2>
            <p className="text-[11px] sm:text-xs text-slate-500">Track all local issues undergoing AI categorization and team matching.</p>
          </div>
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
            {challenges.length} Issues
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
            Loading challenge feed...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {challenges.map((c) => (
              <div key={c.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        c.status === 'Team Formed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        c.status === 'Analyzed' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> {c.location}
                      </span>
                    </div>

                    <Link to={`/challenges/${c.id}`} className="font-bold text-slate-900 hover:text-teal-700 text-sm block leading-snug">
                      {c.title}
                    </Link>
                  </div>

                  <Link
                    to={`/challenges/${c.id}`}
                    className="shrink-0 p-2 bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-800 rounded-xl transition touch-target flex items-center justify-center"
                    aria-label="Inspect Challenge"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{c.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {(c.required_skills || []).map(s => (
                      <span key={s} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>

                  {c.id === 1 && (
                    <Link
                      to="/impact/1"
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Impact Delta</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
