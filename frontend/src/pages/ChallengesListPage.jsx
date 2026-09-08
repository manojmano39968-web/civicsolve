import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import {
  MapPin, PlusCircle, Search, Filter, ChevronRight, AlertCircle, RefreshCw
} from 'lucide-react';

export default function ChallengesListPage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    setLoading(true);
    api.getChallenges()
      .then(data => setChallenges(data.challenges || []))
      .catch(err => console.error('Failed to load challenges:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredChallenges = challenges.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = !selectedCategory || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(challenges.map(c => c.category)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-subtle bg-teal-100 text-teal-800 border border-teal-200">
              Community Registry
            </span>
            <span className="text-xs text-slate-500">Verified Civic Challenges</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Explore Civic Challenges & Problem Statements
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Browse real-world societal problems undergoing AI categorization and interdisciplinary matchmaking.
          </p>
        </div>

        <Link
          to="/submit"
          className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Problem</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search problems by keyword or city (e.g. Chennai, Drainage, Waste)..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 outline-none bg-white"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-teal-600"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Challenges Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
          <div className="text-xs font-medium">Loading challenge catalog...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map(c => (
            <div
              key={c.id}
              className={`card-civic p-5 flex flex-col justify-between hover:border-teal-500 transition space-y-4 ${
                c.id === 1 ? 'ring-2 ring-teal-600/30' : ''
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    c.severity === 'High' || c.severity === 'Critical' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {c.severity} Severity
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {c.location}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {c.title}
                </h3>
                <div className="text-[11px] text-teal-800 font-medium">{c.category}</div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {c.description}
                </p>

                {/* Required skills */}
                <div className="pt-1">
                  <div className="text-[10px] text-slate-400 font-medium mb-1">Required Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {(c.required_skills || []).map(s => (
                      <span key={s} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                  c.status === 'Team Formed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {c.status}
                </span>

                <Link
                  to={`/challenges/${c.id}`}
                  className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                >
                  <span>Inspect Problem</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
