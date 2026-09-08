import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  Shield, RotateCcw, Database, Cpu, CheckCircle2, AlertTriangle,
  BarChart3, Users, Building, ChevronRight, RefreshCw, Sparkles
} from 'lucide-react';

export default function AdminDashboard({ onOpenResetModal }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = () => {
    setLoading(true);
    api.getDashboardSummary()
      .then(data => setSummary(data))
      .catch(err => console.error('Failed to load admin summary:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-subtle bg-slate-800 text-white border border-slate-700">
              Platform Administration & Diagnostics
            </span>
            <span className="text-xs text-slate-500">Smart City Mission Innovation Cell</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            CivicSolve Operational Oversight
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Monitor civic challenge intake, oversee interdisciplinary matchmaking, and maintain system integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Demo Reset Trigger */}
          <button
            onClick={onOpenResetModal}
            id="admin-reset-demo-btn"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* System Diagnostics Banner - Explicitly showing DB Mode & AI Engine */}
      {summary?.system_diagnostics && (
        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
              <Database className="w-4 h-4" />
              <span>Active System Architecture Diagnostics</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Services Healthy</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 space-y-1">
              <div className="text-slate-400 text-[11px]">Database Adapter Engine</div>
              <div className="font-mono font-bold text-white flex items-center gap-2">
                <span>{summary.system_diagnostics.database_mode}</span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded font-sans">
                  Dual-Mode Adapter
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate">{summary.system_diagnostics.database_source}</div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 space-y-1">
              <div className="text-slate-400 text-[11px]">AI Service Engine</div>
              <div className="font-mono font-bold text-white flex items-center gap-2">
                <span>FASTAPI + NLP</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-sans">
                  Offline Ready
                </span>
              </div>
              <div className="text-[10px] text-slate-400">40% Skill / 25% Domain / 15% Loc / 20% Exp</div>
            </div>

            <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700 space-y-1">
              <div className="text-slate-400 text-[11px]">API Framework</div>
              <div className="font-mono font-bold text-white">NODE.JS + EXPRESS</div>
              <div className="text-[10px] text-slate-400">RESTful Endpoints on Port 5000</div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {summary?.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card-civic p-4 text-center">
            <div className="text-2xl font-extrabold font-mono text-slate-900">{summary.metrics.total_challenges}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Total Challenges</div>
          </div>
          <div className="card-civic p-4 text-center">
            <div className="text-2xl font-extrabold font-mono text-teal-700">{summary.metrics.active_teams}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Active Teams</div>
          </div>
          <div className="card-civic p-4 text-center">
            <div className="text-2xl font-extrabold font-mono text-slate-900">{summary.metrics.solutions_developed}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Solutions Formulated</div>
          </div>
          <div className="card-civic p-4 text-center">
            <div className="text-2xl font-extrabold font-mono text-amber-600">{summary.metrics.pilots_initiated}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Pilots Initiated</div>
          </div>
          <div className="card-civic p-4 text-center">
            <div className="text-2xl font-extrabold font-mono text-emerald-700">{summary.metrics.problems_with_impact}</div>
            <div className="text-xs font-semibold text-slate-500 mt-1">Measured Outcomes</div>
          </div>
        </div>
      )}

      {/* Grid: Status Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Challenges by Civic Category</h2>
          <div className="space-y-2.5 text-xs">
            {(summary?.category_distribution || []).map(cat => (
              <div key={cat.category} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">{cat.category}</span>
                <span className="font-mono bg-white border px-2 py-0.5 rounded font-bold text-slate-700">
                  {cat.count} Issues
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Pipeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900">Lifecycle Stage Distribution</h2>
          <div className="space-y-2.5 text-xs">
            {(summary?.status_distribution || []).map(st => (
              <div key={st.status} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-800">{st.status}</span>
                <span className="font-mono bg-white border px-2 py-0.5 rounded font-bold text-teal-800">
                  {st.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Challenges Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Intake Moderation Queue</h2>
          <Link to="/challenges" className="text-xs font-semibold text-teal-700 hover:underline">
            View All Challenges
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {(summary?.recent_challenges || []).map(c => (
            <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 hover:text-teal-700">{c.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                    {c.severity}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px]">{c.location} • Submitted by {c.submitter_name || 'Citizen'}</div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {c.status}
                </span>
                <Link
                  to={`/challenges/${c.id}`}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-teal-700 text-white rounded text-xs font-semibold transition"
                >
                  Inspect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
