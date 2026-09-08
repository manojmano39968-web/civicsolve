import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap, CheckCircle2, Award, Clock, ArrowRight,
  Sparkles, MapPin, Layers, Target, ChevronRight
} from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Fetch Arjun Kumar's profile (id: 2) & reverse recommendations
    Promise.all([
      api.getUserProfile(2),
      api.getUserRecommendations(2)
    ])
      .then(([pData, rData]) => {
        setProfile(pData.user);
        setRecommendations(rData.recommendations || []);
      })
      .catch(err => console.error('Failed to load student dashboard:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-subtle bg-emerald-100 text-emerald-800 border border-emerald-200">
              Student Contributor Portal
            </span>
            <span className="text-xs text-slate-500">Academic & Field Internship Track</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {profile?.name || 'Arjun Kumar'} — Technical Workspace
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {profile?.institution || 'Government Engineering College, Guindy, Chennai'} • Final Year Civil Engineering
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/teams/1"
            className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <span>My Active Team</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Skills + Active Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Skills Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">My Verified Skills</h2>
            <span className="text-xs text-emerald-700 font-mono font-bold">4 Verified</span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: 'Civil Engineering', prof: 'Advanced', cat: 'Core Engineering' },
              { name: 'GIS Spatial Mapping', prof: 'Advanced', cat: 'Geospatial Tools' },
              { name: 'Drainage Design', prof: 'Advanced', cat: 'Hydraulics' },
              { name: 'AutoCAD & Civil3D', prof: 'Advanced', cat: 'Drafting' }
            ].map(sk => (
              <div key={sk.name} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{sk.name}</div>
                  <div className="text-[10px] text-slate-500">{sk.cat}</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                  {sk.prof}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Sprint Tasks */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Assigned Tasks (CivicSolve Flood Response Team)</h2>
              <p className="text-xs text-slate-500">Live milestones assigned to your geospatial & civil profile.</p>
            </div>
            <Link to="/teams/1" className="text-xs text-teal-700 hover:underline font-semibold">
              Open Full Workspace
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {[
              { title: 'Collect rainfall and historical flood elevation data', status: 'Completed', due: 'Day 3' },
              { title: 'Map affected streets and low-lying points with GIS', status: 'Completed', due: 'Day 5' },
              { title: 'Prepare elevation cross-sections for auxiliary bypass', status: 'In Progress', due: 'Day 10' }
            ].map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className={`w-4 h-4 ${t.status === 'Completed' ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <div>
                    <div className={`font-semibold ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-500">Target: {t.due}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                  t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reverse Matching: Recommended Civic Challenges for Arjun */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5 text-teal-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Reverse Matching Engine (Person → Problem)
            </div>
            <h2 className="text-lg font-bold text-slate-900">Recommended Challenges for Your Skills</h2>
            <p className="text-xs text-slate-500">Civic problems matching your GIS, civil infrastructure, and drainage proficiencies.</p>
          </div>
          <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-1 rounded">
            Ranked by Alignment
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {recommendations.slice(0, 3).map((rec) => (
            <div key={rec.challenge_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:border-teal-400 transition space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                    {rec.match_score}% Match
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {rec.location}
                  </span>
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
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                >
                  <span>View</span>
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
