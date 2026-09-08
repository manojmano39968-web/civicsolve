import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle2, Circle, Clock, ArrowRight, ShieldCheck,
  Plus, RefreshCw, AlertCircle, BarChart3, ChevronRight
} from 'lucide-react';

export default function ProgressPage() {
  const { id } = useParams();
  const challengeId = id || 1;
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPct, setNewPct] = useState(75);
  const [newStatus, setNewStatus] = useState('Solution Developed');

  const fetchProgress = () => {
    setLoading(true);
    api.getProgress(challengeId)
      .then(res => setData(res))
      .catch(err => console.error('Failed to load progress:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProgress();
  }, [challengeId]);

  const handleCreateUpdate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      await api.createProgressUpdate(challengeId, {
        title: newTitle.trim(),
        description: newDesc.trim(),
        percentage: Number(newPct),
        team_id: 1,
        created_by: currentUser?.id || 2,
        new_status: newStatus
      });
      setShowUpdateModal(false);
      setNewTitle('');
      setNewDesc('');
      fetchProgress();
    } catch (err) {
      alert('Failed to record progress update: ' + err.message);
    }
  };

  // Explicit Phase 10 Lifecycle Stages
  const stages = [
    { step: 1, name: 'Problem Submitted', status: 'completed', stateLabel: '✓ DONE' },
    { step: 2, name: 'AI Categorized', status: 'completed', stateLabel: '✓ DONE' },
    { step: 3, name: 'Team Matched', status: 'completed', stateLabel: '✓ DONE' },
    { step: 4, name: 'Team Formed', status: 'completed', stateLabel: '✓ DONE' },
    { step: 5, name: 'Analysis', status: 'completed', stateLabel: '✓ DONE' },
    { step: 6, name: 'Solution Developed', status: 'current', stateLabel: 'CURRENT' },
    { step: 7, name: 'Pilot Implementation', status: 'next', stateLabel: 'NEXT' },
    { step: 8, name: 'Impact Measurement', status: 'future', stateLabel: 'FUTURE' }
  ];

  const currentPercent = data?.current_percentage || 68;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-civic bg-teal-100 text-teal-800 border border-teal-200">
              Lifecycle Progression
            </span>
            <span className="text-xs text-slate-500">Problem #{challengeId}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lifecycle Progress Timeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Real-time audit log tracking the civic issue through engineering development to verified community impact.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUpdateModal(true)}
          id="update-stage-btn"
          className="w-full sm:w-auto px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5 touch-target"
        >
          <Plus className="w-4 h-4" />
          <span>Update Milestone</span>
        </button>
      </div>

      {/* Overall Progress Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono text-teal-300 uppercase tracking-wider font-bold">Overall Resolution Progress</div>
            <div className="text-3xl font-extrabold font-mono text-white mt-0.5">{currentPercent}%</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-slate-400">Current Lifecycle Phase</div>
            <div className="text-xs sm:text-sm font-bold text-amber-300">Solution Developed (Ready for Pilot Review)</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-3 border border-slate-700 overflow-hidden">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${currentPercent}%` }}
          />
        </div>
      </div>

      {/* Lifecycle Timeline - Vertical on Mobile Required by Phase 10 */}
      <div className="card-civic p-5 sm:p-7 space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Problem-to-Impact Milestones</h2>
          <p className="text-xs text-slate-500">Ordered sequence of phases from citizen submission to outcome measurement.</p>
        </div>

        {/* Responsive Vertical Timeline with Left Line */}
        <div className="relative border-l-2 border-slate-200 ml-4 sm:ml-6 space-y-6 pl-6 sm:pl-8 py-2">
          {stages.map((st) => {
            const isCompleted = st.status === 'completed';
            const isCurrent = st.status === 'current';
            const isNext = st.status === 'next';

            return (
              <div key={st.step} className="relative group">
                {/* Node icon on line */}
                <div className={`absolute -left-[35px] sm:-left-[43px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-emerald-600 border-white text-white shadow-sm' :
                  isCurrent ? 'bg-amber-400 border-amber-200 text-amber-950 animate-pulse shadow-md' :
                  isNext ? 'bg-slate-200 border-slate-300 text-slate-600' :
                  'bg-slate-100 border-slate-200 text-slate-400'
                }`}>
                  {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                  {isCurrent && <Clock className="w-4 h-4" />}
                  {!isCompleted && !isCurrent && <Circle className="w-3.5 h-3.5" />}
                </div>

                <div className={`p-4 rounded-xl border transition ${
                  isCurrent 
                    ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-xs' 
                    : isCompleted 
                    ? 'bg-slate-50/70 border-slate-200' 
                    : 'bg-white border-slate-200/80 opacity-70'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">Step {st.step}</span>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900">{st.name}</h3>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isCompleted ? 'bg-emerald-100 text-emerald-800' :
                      isCurrent ? 'bg-amber-200 text-amber-900' :
                      isNext ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {st.stateLabel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {st.step === 1 && "Citizen reported waterlogging issue on 4th Main Avenue, Velachery."}
                    {st.step === 2 && "AI-assisted NLP extracted required skills: Hydrology, Drainage Design, GIS, Urban Planning."}
                    {st.step === 3 && "FastAPI matching scored qualified candidates (Arjun 87-92%, Dr. Meena 92%, Ravi Infra 88%)."}
                    {st.step === 4 && "CivicSolve Flood Response Team established with assigned multidisciplinary roles."}
                    {st.step === 5 && "Contour elevation profile mapped; 3 critical depression nodes identified."}
                    {st.step === 6 && "GIS-guided decentralized drainage & 400m bypass proposal drafted (Ready for Pilot Review)."}
                    {st.step === 7 && "Scheduled municipal contractor desiltation and bypass trenching pilot."}
                    {st.step === 8 && "Continuous gauge logging: target waterlogging duration reduced from 5.0h to 2.0h."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documented History Audit Log */}
      <div className="card-civic p-5 sm:p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Milestone Audit Log</h2>
        <div className="space-y-3">
          {(data?.updates || []).map((u, idx) => (
            <div key={u.id || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-slate-900">{u.title}</span>
                <span className="font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                  {u.percentage}% Progress
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">{u.description}</p>
              <div className="text-[11px] text-slate-400 pt-1">
                Recorded by: <strong className="text-slate-700">{u.created_by_name || 'Team Member'}</strong> • {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Update Progress Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Record Milestone Progress</h3>
            <form onSubmit={handleCreateUpdate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Milestone Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Pilot Hydraulic Specifications Completed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Summary of engineering work achieved and validated clearances."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newPct}
                    onChange={(e) => setNewPct(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none bg-white"
                  >
                    <option value="Solution Developed">Solution Developed</option>
                    <option value="Pilot Review">Pilot Review</option>
                    <option value="Impact Measured">Impact Measured</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
