import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, CheckCircle2, Clock, MessageSquare, Send, Plus,
  FileText, ArrowRight, ShieldCheck, MapPin, RefreshCw, BarChart3,
  ExternalLink, Layers, Check, Sparkles, CheckSquare, Square
} from 'lucide-react';

export default function TeamWorkspacePage() {
  const { id } = useParams();
  const teamId = id || 1;
  const { currentUser } = useAuth();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Modal state
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(2);

  const fetchWorkspace = () => {
    setLoading(true);
    api.getTeamById(teamId)
      .then(data => {
        setTeam(data.team);
        setTasks(data.team?.tasks || []);
        setComments(data.team?.comments || []);
      })
      .catch(err => console.error('Failed to load team workspace:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkspace();
  }, [teamId]);

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      const res = await api.patchTask(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? res.task : t));
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setPostingComment(true);
    try {
      const res = await api.addComment(teamId, {
        user_id: currentUser?.id || 2,
        content: newComment.trim()
      });
      setComments(prev => [...prev, res.comment]);
      setNewComment('');
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    } finally {
      setPostingComment(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await api.createTask(teamId, {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        assigned_to: Number(newTaskAssignee),
        status: 'Pending',
        due_date: 'Upcoming Sprint'
      });
      setTasks(prev => [...prev, res.task]);
      setShowNewTaskModal(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
    } catch (err) {
      alert('Failed to create task: ' + err.message);
    }
  };

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 68;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header Required by Phase 9 */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="badge-civic bg-teal-100 text-teal-800 border border-teal-200">
              Active Sprint Workspace
            </span>
            <span className="text-xs text-slate-400">Team #{teamId}</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Sprint Phase: Active
          </span>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {team?.name || 'CivicSolve Flood Response Team'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Challenge: <strong className="text-slate-900">{team?.challenge?.title || 'Recurring Urban Flooding Near Residential Area'}</strong> ({team?.challenge?.location || 'Chennai'})
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Link
              to="/solutions/1"
              className="flex-1 sm:flex-none py-2.5 px-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 touch-target"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Proposed Solution</span>
            </Link>

            <Link
              to="/impact/1"
              className="flex-1 sm:flex-none py-2.5 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 touch-target"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Impact Metrics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress & Current Focus Strip Required by Phase 9 */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <div className="text-[10px] font-mono text-teal-300 uppercase tracking-wider font-bold">Progress</div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-3xl font-extrabold text-white">{progressPercent}%</span>
            <span className="text-xs text-slate-400">({completedCount} of {tasks.length} Milestones Complete)</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-mono text-amber-300 uppercase tracking-wider font-bold">Current Focus</div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span>Solution Development & Pilot Specification</span>
          </div>
        </div>

        {/* Mini progress bar */}
        <div className="w-full sm:w-48 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Members Section Required by Phase 9 */}
      <div className="card-civic p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">Assigned Team Roster</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">Arjun Kumar</div>
            <div className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded inline-block">Student</div>
            <div className="text-slate-600 font-medium">GIS & Field Contour Mapping</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">Dr. Meena Raman</div>
            <div className="text-[10px] font-bold uppercase text-purple-800 bg-purple-50 px-2 py-0.5 rounded inline-block">Hydrology Expert</div>
            <div className="text-slate-600 font-medium">Hydraulic Peak Discharge Calculations</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="font-bold text-slate-900">Ravi Infrastructure Solutions</div>
            <div className="text-[10px] font-bold uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded inline-block">Implementation Partner</div>
            <div className="text-slate-600 font-medium">Municipal Culvert Desiltation & Civil Works</div>
          </div>
        </div>
      </div>

      {/* Grid: Tasks Checklist + Discussion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Tasks Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-civic p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Sprint Tasks & Action Items</h2>
                <p className="text-xs text-slate-500">Tap checkboxes to toggle task completion in real-time.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowNewTaskModal(true)}
                id="add-task-btn"
                className="py-1.5 px-3 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold transition flex items-center gap-1 touch-target"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {/* Tasks list with touch-friendly targets */}
            <div className="space-y-2.5">
              {tasks.map((task, idx) => {
                const isCompleted = task.status === 'Completed';
                const isInProgress = task.status === 'In Progress';

                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task)}
                    className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer touch-target active:scale-[0.99] ${
                      isCompleted 
                        ? 'bg-slate-50/80 border-slate-200 text-slate-500' 
                        : 'bg-white border-slate-200 hover:border-teal-400 text-slate-900'
                    }`}
                    id={`task-item-${task.id}`}
                  >
                    {/* Checkbox button */}
                    <div className="pt-0.5 shrink-0">
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                        isCompleted ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs sm:text-sm font-bold leading-snug ${
                          isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}>
                          {idx + 1}. {task.title}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          isCompleted ? 'bg-emerald-100 text-emerald-800' :
                          isInProgress ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {task.status}
                        </span>
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
                      )}

                      <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                        <span>Assigned to: <strong className="text-slate-700">{task.assigned_to_name || 'Team Member'}</strong></span>
                        {task.due_date && <span>• {task.due_date}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Discussion Thread (1 col) */}
        <div className="card-civic flex flex-col h-[560px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <MessageSquare className="w-4 h-4 text-teal-700" />
              <span>Team Discussion</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{comments.length} Messages</span>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 text-xs">
            {comments.map((c) => {
              const isCurrentUser = currentUser && currentUser.id === c.user_id;
              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border space-y-1 ${
                    isCurrentUser ? 'bg-teal-50/60 border-teal-200 ml-4' : 'bg-slate-50 border-slate-200 mr-4'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.author_name}</span>
                    <span className="text-[10px] text-slate-500 capitalize">{c.author_role}</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">{c.content}</p>
                  <div className="text-[10px] text-slate-400 text-right">
                    {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Keyboard-Safe Input Form */}
          <form onSubmit={handlePostComment} className="p-3 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Post team update..."
              className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-600 outline-none"
              id="team-comment-input"
            />
            <button
              type="submit"
              disabled={postingComment || !newComment.trim()}
              id="team-comment-send-btn"
              className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center shrink-0 touch-target"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Add Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Milestone Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g., Finalize hydraulic intake grating dimensions"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Details of engineering requirements and deliverables"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assign Member</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white outline-none"
                >
                  <option value={2}>Arjun Kumar (Student - GIS & Field)</option>
                  <option value={3}>Dr. Meena Raman (Expert - Hydrology)</option>
                  <option value={4}>Ravi Infrastructure (Industry Partner)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
