import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  BarChart3, ShieldAlert, ArrowDownRight, Clock, MapPin,
  TrendingDown, CheckCircle2, AlertTriangle, Layers, Building2, Sparkles, ArrowRight
} from 'lucide-react';

export default function ImpactPage() {
  const { id } = useParams();
  const challengeId = id || 1;

  const [impactData, setImpactData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getImpact(challengeId),
      api.getDashboardSummary()
    ])
      .then(([iData, sData]) => {
        setImpactData(iData);
        setSummary(sData);
      })
      .catch(err => console.error('Failed to load impact metrics:', err))
      .finally(() => setLoading(false));
  }, [challengeId]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6">
      {/* Top Banner: Impossible to Miss DEMO / PILOT DATA Disclosure */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl font-bold flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm border border-amber-600/30">
        <div className="flex items-center gap-2">
          <span className="bg-slate-950 text-amber-400 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded tracking-widest">
            DEMO / PILOT DATA
          </span>
          <span className="text-xs sm:text-sm font-semibold tracking-tight text-slate-950">
            Smart India Hackathon Prototype Verification Environment
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-900/80">
          Simulated & Pilot Benchmarks (Chennai Urban Field Study)
        </span>
      </div>

      {/* Header */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="badge-subtle bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold">
              Outcome Verification
            </span>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              DEMO / PILOT DATA
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Measuring Real-World Impact
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Tracking measurable community relief and engineering outcomes against pre-intervention baseline benchmarks.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/teams/1"
            className="flex-1 sm:flex-none text-center min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
          >
            Team Workspace
          </Link>
          <Link
            to="/solutions/1"
            className="flex-1 sm:flex-none text-center min-h-[44px] inline-flex items-center justify-center px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            Proposed Solution
          </Link>
        </div>
      </div>

      {/* Honest Transparency Notice */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 sm:p-4 text-xs text-amber-950 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="font-bold text-amber-900">Demonstration & Pilot Simulation Disclosure</div>
          <p className="text-amber-800/90 leading-relaxed text-[11px] sm:text-xs">
            These metrics reflect engineering simulations and localized field test data for the <strong>Recurring Urban Flooding in Chennai</strong> pilot area. They illustrate CivicSolve's closed-loop impact verification mechanism rather than municipality-wide completion.
          </p>
        </div>
      </div>

      {/* Hero Problem Impact Metrics */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <div className="text-[11px] font-mono text-teal-700 font-bold uppercase tracking-wider">
              Pilot Challenge Tracking
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Recurring Urban Flooding Near Residential Area
            </h2>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-teal-600" />
              <span>Chennai, Tamil Nadu</span>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
            Status: Pilot Implementation Phase
          </span>
        </div>

        {/* Canonical SIH Impact Comparison Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Core Metric Benchmarks (Baseline vs Target vs Current)
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded">
              SIH Verification Framework
            </span>
          </div>

          {/* Desktop & Mobile Responsive Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-700 font-bold">
                <tr>
                  <th scope="col" className="px-4 py-3">Metric</th>
                  <th scope="col" className="px-4 py-3 text-right">Baseline</th>
                  <th scope="col" className="px-4 py-3 text-right text-teal-800">Target</th>
                  <th scope="col" className="px-4 py-3 text-right text-emerald-800 bg-emerald-50/50">Current Measured</th>
                  <th scope="col" className="px-4 py-3 text-right">Net Relief</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    <div>Waterlogging Duration</div>
                    <span className="text-[10px] text-slate-500 font-normal">Average street recession time</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">5.0 hrs</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-teal-700">2.0 hrs</td>
                  <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-700 bg-emerald-50/40">3.0 hrs</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      ↓ 40% Reduction
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    <div>Affected Area</div>
                    <span className="text-[10px] text-slate-500 font-normal">Residential inundated surface</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">2.4 km²</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-teal-700">1.2 km²</td>
                  <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-700 bg-emerald-50/40">1.5 km²</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      ↓ 38% Less Area
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3.5 font-semibold text-slate-900">
                    <div>Incidents / Month</div>
                    <span className="text-[10px] text-slate-500 font-normal">Resident grievance logs</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-rose-600">12 / mo</td>
                  <td className="px-4 py-3.5 text-right font-mono font-bold text-teal-700">5 / mo</td>
                  <td className="px-4 py-3.5 text-right font-mono font-extrabold text-emerald-700 bg-emerald-50/40">7 / mo</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                      ↓ 42% Fewer Calls
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 3 Visual Progress Cards with Visual Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
          {/* Card 1 */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-800">Waterlogging Duration</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                Hours
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Baseline (Pre-Intervention):</span>
                <span className="font-mono font-bold text-rose-600">5 hrs</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Target Goal:</span>
                <span className="font-mono font-bold text-teal-700">2 hrs</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg text-emerald-950 font-bold">
                <span>Current Measured:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">3 hrs</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                <span>Target Realization</span>
                <span className="text-emerald-700">67% Achieved</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '67%' }} />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-800">Affected Area</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                km²
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Baseline (Pre-Intervention):</span>
                <span className="font-mono font-bold text-rose-600">2.4 km²</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Target Goal:</span>
                <span className="font-mono font-bold text-teal-700">1.2 km²</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg text-emerald-950 font-bold">
                <span>Current Measured:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">1.5 km²</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                <span>Relief Coverage</span>
                <span className="text-emerald-700">75% Achieved</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '75%' }} />
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-slate-50/60 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs sm:text-sm text-slate-800">Incidents / Month</span>
              <span className="text-[10px] font-mono text-slate-500 uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                Calls
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-500">
                <span>Baseline (Pre-Intervention):</span>
                <span className="font-mono font-bold text-rose-600">12</span>
              </div>
              <div className="flex justify-between items-center text-slate-500">
                <span>Target Goal:</span>
                <span className="font-mono font-bold text-teal-700">5</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg text-emerald-950 font-bold">
                <span>Current Measured:</span>
                <span className="font-mono font-black text-emerald-700 text-sm">7</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[11px] text-slate-600 font-semibold">
                <span>Disruption Reduction</span>
                <span className="text-emerald-700">71% Achieved</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: '71%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Aggregated Platform Health */}
      {summary?.metrics && (
        <div className="bg-slate-900 text-white rounded-xl p-5 sm:p-7 space-y-5 border border-slate-800 shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="text-[10px] font-mono text-teal-400 uppercase tracking-widest font-bold">
                Platform Registry Summary
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Aggregated Multi-Stakeholder Resolution Metrics
              </h3>
            </div>
            <span className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700 self-start sm:self-auto font-mono">
              Live DB Counts
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 text-center">
            <div className="p-3 sm:p-4 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {summary.metrics.total_challenges}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Problems Logged</div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-teal-400">
                {summary.metrics.active_teams}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Teams Active</div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                {summary.metrics.solutions_developed}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Solutions Formed</div>
            </div>

            <div className="p-3 sm:p-4 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                {summary.metrics.pilots_initiated}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Pilots Initiated</div>
            </div>

            <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 bg-slate-800/80 rounded-xl border border-slate-700">
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
                {summary.metrics.problems_with_impact}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Measured Impact</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
