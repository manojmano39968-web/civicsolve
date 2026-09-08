import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, Cpu, ArrowRight, CheckCircle2, AlertTriangle,
  MapPin, Tag, ShieldAlert, FileText, RefreshCw, Layers
} from 'lucide-react';

export default function SubmitChallengePage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: 'Chennai',
    category: 'Urban Infrastructure / Flood Management',
    severity: 'High',
    expected_impact: 'Mitigate recurring waterlogging, prevent road closure during monsoons, and improve pedestrian transit safety.',
    additional_notes: 'Water depth reaches 1.5 to 2.5 feet at intersections, remaining for up to 6 hours after moderate downpours.'
  });

  const [submitting, setSubmitting] = useState(false);
  const [analyzingState, setAnalyzingState] = useState(''); // text message for step-by-step loading
  const [analysisResult, setAnalysisResult] = useState(null);
  const [createdChallenge, setCreatedChallenge] = useState(null);
  const [error, setError] = useState('');

  // 1-Click Hero Scenario Prefill
  const handlePrefillHero = () => {
    setFormData({
      title: 'Recurring Urban Flooding Near Residential Area',
      description: 'During heavy rainfall, the road and surrounding residential streets experience severe waterlogging. Water remains for several hours after rainfall, affecting pedestrians, vehicles and nearby homes.',
      location: 'Chennai',
      category: 'Urban Infrastructure / Flood Management',
      severity: 'High',
      expected_impact: 'Eliminate street water accumulation within 1 hour post-precipitation and prevent basement seepage for 450+ households.',
      additional_notes: 'Historical stormwater conduits on 4th Main Avenue are obstructed by construction silt and utility crossings.'
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please provide both title and a detailed description of the civic problem.');
      return;
    }

    setError('');
    setSubmitting(true);
    setAnalysisResult(null);

    try {
      // Step 1: Create Challenge in DB
      setAnalyzingState('Submitting problem report to municipal registry...');
      const createdRes = await api.createChallenge({
        title: formData.title,
        description: formData.description,
        location: formData.location,
        category: formData.category,
        severity: formData.severity,
        submitted_by: currentUser?.id || 1
      });

      const newChallenge = createdRes.challenge;
      setCreatedChallenge(newChallenge);

      // Step 2: Trigger AI Analysis
      setAnalyzingState('Connecting to AI Service: Tokenizing problem text and analyzing civic domain taxonomy...');
      await new Promise(r => setTimeout(r, 600)); // Visible smooth transition

      setAnalyzingState('AI-assisted analysis: Extracting required engineering skills & severity classification...');
      const analysis = await api.analyzeChallenge(newChallenge.id);

      setAnalysisResult(analysis);
    } catch (err) {
      console.error('Submission failed:', err);
      setError('Failed to process submission: ' + err.message);
    } finally {
      setSubmitting(false);
      setAnalyzingState('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-subtle bg-teal-100 text-teal-800 border border-teal-200">
              Civic Problem Intake
            </span>
            <span className="text-xs text-slate-500">Citizen Submission Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Report a Real-World Community Problem
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Submit an observed civic challenge. The CivicSolve NLP engine will classify the domain, detect required skills, and find collaborative problem solvers.
          </p>
        </div>

        {/* 1-Click Judge Demo Prefill */}
        <button
          type="button"
          onClick={handlePrefillHero}
          id="prefill-hero-btn"
          className="shrink-0 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Prefill Chennai Flooding Example</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Main Form */}
      {!analysisResult ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Problem Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Recurring Urban Flooding Near Residential Area"
                className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition min-h-[44px]"
                id="problem-title-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Problem Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what happens, when it occurs, and how the community is impacted (e.g., During heavy rainfall, the road and residential streets experience severe waterlogging...)"
                className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition"
                id="problem-description-input"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The AI analyzer processes natural text to derive technical domain concepts, hydrology/drainage keywords, and multidisciplinary skills.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Location / City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Chennai"
                  className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition min-h-[44px]"
                  id="problem-location-input"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Initial Category (Suggested)
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition bg-white min-h-[44px]"
                >
                  <option value="Urban Infrastructure / Flood Management">Urban Infrastructure / Flood Management</option>
                  <option value="Waste Management & Environment">Waste Management & Environment</option>
                  <option value="Transportation & Road Safety">Transportation & Road Safety</option>
                  <option value="Water Resources & Supply">Water Resources & Supply</option>
                  <option value="Public Health & Sanitation">Public Health & Sanitation</option>
                  <option value="Environmental Conservation">Environmental Conservation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Severity Level
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition bg-white min-h-[44px]"
                >
                  <option value="High">High (Immediate Civic Disruption)</option>
                  <option value="Critical">Critical (Hazardous / Structural Threat)</option>
                  <option value="Medium">Medium (Regular Inconvenience)</option>
                  <option value="Low">Low (Maintenance / Minor)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Expected Community Impact
              </label>
              <input
                type="text"
                value={formData.expected_impact}
                onChange={(e) => setFormData({ ...formData, expected_impact: e.target.value })}
                placeholder="e.g., Mitigate recurring waterlogging and prevent road closure during monsoons"
                className="w-full px-3.5 py-3 text-base sm:text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-600 focus:border-teal-600 outline-none transition min-h-[44px]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Submission triggers live FastAPI NLP analysis and candidate skill matching.</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              id="analyze-submit-btn"
              className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-teal-700 hover:bg-teal-800 active:bg-teal-900 text-white font-semibold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Problem...</span>
                </>
              ) : (
                <>
                  <span>Analyze & Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {submitting && analyzingState && (
            <div className="p-4 bg-teal-50 border border-teal-200 rounded-lg text-teal-900 text-xs flex items-center gap-3 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin text-teal-600 shrink-0" />
              <div>{analyzingState}</div>
            </div>
          )}
        </form>
      ) : (
        /* Critical Demo Moment: Real AI Problem Analysis Feedback Panel */
        <div className="bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono text-xs border border-teal-500/30">
                  AI-ASSISTED PROBLEM ANALYSIS
                </span>
                <span className="text-xs text-slate-400">Analysis Confidence: {Math.round(analysisResult.confidence * 100)}%</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Problem Registered (# {createdChallenge?.id})
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight">
              {createdChallenge?.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 mb-0.5">Problem Category</div>
                <div className="font-semibold text-teal-300">{analysisResult.category}</div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 mb-0.5">Detected Domain</div>
                <div className="font-semibold text-slate-200">{analysisResult.domain}</div>
              </div>

              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="text-slate-400 mb-0.5">Problem Severity & Location</div>
                <div className="font-semibold text-rose-300">{analysisResult.severity} • {createdChallenge?.location}</div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Detected Skills */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                AI-Recommended Required Technical Skills:
              </div>
              <div className="flex flex-wrap gap-2">
                {analysisResult.required_skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-teal-50 text-teal-900 border border-teal-200 rounded-lg text-xs font-bold shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    <span>{skill}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-teal-700" />
                <span>Explainable AI Analysis Reasoning:</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {analysisResult.reason}
              </p>
              {analysisResult.keywords && analysisResult.keywords.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-slate-400 font-medium">Extracted Keywords:</span>
                  <div className="flex flex-wrap gap-1">
                    {analysisResult.keywords.map(kw => (
                      <span key={kw} className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[11px] text-slate-700">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Next Step CTA */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Ready to find qualified students, faculty experts, and industry partners matching these skills.
              </div>

              <button
                type="button"
                onClick={() => navigate(`/challenges/${createdChallenge.id}/matches`)}
                id="find-relevant-people-btn"
                className="w-full sm:w-auto px-6 py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-sm rounded-lg shadow transition flex items-center justify-center gap-2"
              >
                <span>Find Relevant People</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
