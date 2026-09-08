import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  ArrowRight, ShieldCheck, Cpu, Users, GitMerge, BarChart3,
  MapPin, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Building2,
  FileCheck2, Activity, ArrowUpRight
} from 'lucide-react';

export default function LandingPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.getDashboardSummary()
      .then(data => setStats(data))
      .catch(err => console.warn('Could not load landing stats:', err));
  }, []);

  return (
    <div className="space-y-10 sm:space-y-16 pb-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white via-slate-50 to-slate-100/70 border-b border-slate-200/90 pt-8 sm:pt-14 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          {/* SIH Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-[11px] sm:text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>Smart India Hackathon Working Prototype</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] max-w-3xl mx-auto">
            Turn real-world problems into <span className="text-teal-700">collaborative solutions.</span>
          </h1>

          {/* Subheading */}
          <p className="text-sm sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CivicSolve connects citizens, students, experts, industries and institutions around the problems that matter.
          </p>

          {/* Strong Primary CTAs - Touch Friendly */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 max-w-md sm:max-w-none mx-auto">
            <Link
              to="/demo-login"
              className="px-6 py-3.5 sm:py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm shadow-sm hover:shadow active:scale-[0.98] transition flex items-center justify-center gap-2 touch-target"
              id="landing-explore-demo-btn"
            >
              <span>Explore Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/submit"
              className="px-6 py-3.5 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-sm active:scale-[0.98] transition flex items-center justify-center gap-2 touch-target"
              id="landing-submit-btn"
            >
              <span>Submit a Problem</span>
            </Link>
          </div>

          {/* Visual Lifecycle Flow - Responsive & Clean */}
          <div className="pt-6 sm:pt-10">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-3">
              The Problem-to-Impact Lifecycle
            </div>
            
            {/* Horizontal flow on desktop, responsive clean 2-col or 3-col on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 max-w-4xl mx-auto text-left">
              {[
                { step: '01', title: 'Problem', desc: 'Citizen reports issue', icon: AlertCircle, color: 'text-rose-600 bg-rose-50' },
                { step: '02', title: 'AI Analysis', desc: 'Categorize & detect skills', icon: Cpu, color: 'text-indigo-600 bg-indigo-50' },
                { step: '03', title: 'Matching', desc: 'Rank students & experts', icon: Users, color: 'text-teal-600 bg-teal-50' },
                { step: '04', title: 'Team', desc: 'Assemble workspace', icon: GitMerge, color: 'text-amber-600 bg-amber-50' },
                { step: '05', title: 'Solution', desc: 'Engineering pilot plan', icon: Building2, color: 'text-blue-600 bg-blue-50' },
                { step: '06', title: 'Impact', desc: 'Verified metrics delta', icon: BarChart3, color: 'text-emerald-600 bg-emerald-50' }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400">{item.step}</span>
                      <div className={`p-1.5 rounded-lg ${item.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900 leading-tight">{item.title}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Problem Preview Card */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-2xl text-white p-5 sm:p-8 shadow-xl border border-slate-800 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-[11px] font-bold border border-teal-500/30">
                FEATURED CIVIC PROBLEM
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">• SIH Demonstration Scenario</span>
            </div>
            <span className="text-xs bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-2.5 py-0.5 rounded-full font-semibold">
              Status: Team Formed
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-teal-300">
                <MapPin className="w-3.5 h-3.5" /> Chennai
              </span>
              <span>• Urban Infrastructure / Flood Management</span>
              <span className="text-rose-400 font-semibold">• High Severity</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Recurring Urban Flooding Near Residential Area
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              "During heavy rainfall, residential streets experience severe waterlogging affecting pedestrians, vehicles and nearby homes."
            </p>
          </div>

          {/* 4 Feature Badges Required by Phase 5 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">AI Analysis</div>
              <div className="text-xs font-bold text-teal-300 mt-0.5">Hydrological Runoff</div>
            </div>
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Required Skills</div>
              <div className="text-xs font-bold text-white mt-0.5">4 Core Disciplines</div>
            </div>
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Relevant People</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">5 Candidates Ranked</div>
            </div>
            <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Active Team</div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">1 Sprint Active</div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800">
            <div className="flex flex-wrap gap-1.5">
              {['Hydrology', 'Drainage Design', 'GIS', 'Urban Planning'].map(sk => (
                <span key={sk} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {sk}
                </span>
              ))}
            </div>

            <Link
              to="/challenges/1"
              className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5 touch-target"
            >
              <span>Inspect Hero Problem Details</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Value Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Report Real Problems',
              desc: 'Citizens report issues with localized coordinates, context, and severity for civic visibility.',
              icon: AlertCircle,
              color: 'text-rose-600 bg-rose-50'
            },
            {
              title: 'Find Relevant Skills',
              desc: 'AI detects exact engineering domains and scores qualified candidates transparently.',
              icon: Cpu,
              color: 'text-teal-600 bg-teal-50'
            },
            {
              title: 'Collaborate on Solutions',
              desc: 'Students, faculty researchers, and contractors organize tasks in shared workspaces.',
              icon: Users,
              color: 'text-amber-600 bg-amber-50'
            },
            {
              title: 'Track Real Impact',
              desc: 'Compare baseline conditions against verified pilot outcomes with quantitative rigor.',
              icon: BarChart3,
              color: 'text-emerald-600 bg-emerald-50'
            }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="card-civic p-5 flex flex-col justify-between">
                <div>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Aggregated Statistics Bar */}
      {stats?.metrics && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              <div className="pt-2 sm:pt-0">
                <div className="text-2xl font-extrabold font-mono text-slate-900">{stats.metrics.total_challenges}</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Civic Challenges</div>
              </div>
              <div className="pt-2 sm:pt-0">
                <div className="text-2xl font-extrabold font-mono text-teal-700">{stats.metrics.active_teams}</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Active Teams</div>
              </div>
              <div className="pt-2 sm:pt-0">
                <div className="text-2xl font-extrabold font-mono text-slate-900">{stats.metrics.solutions_developed}</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Solutions Drafted</div>
              </div>
              <div className="pt-2 sm:pt-0">
                <div className="text-2xl font-extrabold font-mono text-amber-600">{stats.metrics.pilots_initiated}</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Pilots Initiated</div>
              </div>
              <div className="pt-2 sm:pt-0 col-span-2 sm:col-span-1">
                <div className="text-2xl font-extrabold font-mono text-emerald-700">{stats.metrics.problems_with_impact}</div>
                <div className="text-[11px] font-semibold text-slate-500 mt-0.5">Measured Outcomes</div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
