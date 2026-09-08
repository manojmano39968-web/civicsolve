import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, Award, Shield, ArrowRight, Building, CheckCircle2 } from 'lucide-react';

export default function DemoLoginPage() {
  const { switchRole, DEMO_ROLES } = useAuth();
  const navigate = useNavigate();

  const handleSelectRole = async (roleObj) => {
    await switchRole(roleObj.role, roleObj.userId);
    if (roleObj.role === 'citizen') navigate('/dashboard/citizen');
    else if (roleObj.role === 'student') navigate('/dashboard/student');
    else if (roleObj.role === 'expert' || roleObj.role === 'industry') navigate('/dashboard/expert');
    else if (roleObj.role === 'admin') navigate('/dashboard/admin');
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'citizen': return <Users className="w-6 h-6 text-blue-600" />;
      case 'student': return <GraduationCap className="w-6 h-6 text-emerald-600" />;
      case 'expert': return <Award className="w-6 h-6 text-purple-600" />;
      case 'industry': return <Building className="w-6 h-6 text-amber-600" />;
      case 'admin': return <Shield className="w-6 h-6 text-slate-800" />;
      default: return <Users className="w-6 h-6 text-teal-600" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-700 text-xs font-semibold">
          <span>Judge Presentation Mode</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Select a Demo Role to Begin
        </h1>
        <p className="text-sm text-slate-600">
          No sign-up or credentials required during presentation. Select any stakeholder persona to explore CivicSolve through their perspective.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_ROLES.map((item) => (
          <div
            key={item.role}
            className="card-civic p-6 flex flex-col justify-between hover:border-teal-500 hover:shadow-md transition group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-100 rounded-xl group-hover:scale-105 transition">
                  {getRoleIcon(item.role)}
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                  {item.role}
                </span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-teal-700 transition">
                {item.name}
              </h2>
              <div className="text-xs font-semibold text-slate-500 mb-2">{item.title}</div>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {item.desc}
              </p>
            </div>

            <button
              onClick={() => handleSelectRole(item)}
              id={`enter-role-${item.role}`}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-2 group-hover:bg-teal-700"
            >
              <span>Enter as {item.role.charAt(0).toUpperCase() + item.role.slice(1)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Suggested Demonstration Flow Callout */}
      <div className="mt-12 bg-teal-50 border border-teal-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
            Recommended 5-Minute Demo Sequence
          </div>
          <p className="text-xs text-teal-800">
            Start as <strong>Citizen</strong> (submit or inspect the Chennai flooding problem) → View AI Skill Categorization → Run Smart Candidate Matching → Form Team → Explore Team Workspace & Tasks → View Impact Dashboard.
          </p>
        </div>
        <button
          onClick={() => handleSelectRole(DEMO_ROLES[0])}
          className="shrink-0 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          Start Recommended Demo Flow
        </button>
      </div>
    </div>
  );
}
