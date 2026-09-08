import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RotateCcw, ChevronDown, Check, User, PlusCircle,
  Activity, BarChart3, X, Sparkles, Layers, ShieldCheck
} from 'lucide-react';

export default function Navbar({ onOpenResetModal }) {
  const { currentUser, switchRole, DEMO_ROLES, isResetting } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleRoleSelect = async (roleObj) => {
    setRoleMenuOpen(false);
    await switchRole(roleObj.role, roleObj.userId);
    if (roleObj.role === 'citizen') navigate('/dashboard/citizen');
    else if (roleObj.role === 'student') navigate('/dashboard/student');
    else if (roleObj.role === 'expert' || roleObj.role === 'industry') navigate('/dashboard/expert');
    else if (roleObj.role === 'admin') navigate('/dashboard/admin');
  };

  const getDashboardPath = () => {
    if (!currentUser) return '/demo-login';
    switch (currentUser.role) {
      case 'citizen': return '/dashboard/citizen';
      case 'student': return '/dashboard/student';
      case 'expert':
      case 'industry': return '/dashboard/expert';
      case 'admin': return '/dashboard/admin';
      default: return '/dashboard/citizen';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm transition-all">
      {/* Desktop Demo Mode Bar (>= 768px) */}
      <div className="hidden md:flex bg-slate-900 text-slate-200 text-xs px-4 sm:px-6 lg:px-8 py-1.5 items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="bg-teal-500/20 text-teal-300 font-mono font-semibold px-2 py-0.5 rounded text-[11px] border border-teal-500/30">
            DEMO MODE
          </span>
          <span className="text-slate-300">
            Persona: <strong className="text-white font-medium">{currentUser?.name || 'Citizen'}</strong> ({currentUser?.role?.toUpperCase()})
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 px-2.5 py-1 rounded text-xs border border-slate-700 transition"
              id="desktop-role-switch-btn"
            >
              <span>Switch Persona</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Demo Persona
                </div>
                {DEMO_ROLES.map((r) => {
                  const isActive = currentUser?.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => handleRoleSelect(r)}
                      className={`w-full text-left px-3 py-2 flex items-start gap-2 hover:bg-slate-50 transition text-xs ${
                        isActive ? 'bg-teal-50 font-medium text-teal-900' : 'text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isActive ? (
                          <Check className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold flex items-center justify-between">
                          <span>{r.name}</span>
                          <span className="text-[10px] text-slate-500 capitalize">{r.role}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{r.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onOpenResetModal}
            disabled={isResetting}
            className="flex items-center gap-1 text-slate-300 hover:text-white hover:bg-rose-950/60 px-2.5 py-1 rounded transition text-xs border border-slate-700 hover:border-rose-700/60"
            id="desktop-reset-demo-btn"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-rose-400' : 'text-rose-400'}`} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm group-hover:bg-teal-800 transition">
              CS
            </div>
            <div>
              <div className="brand-font font-bold text-lg sm:text-xl text-slate-900 tracking-tight leading-tight flex items-center gap-1.5">
                CivicSolve
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-sans">
                  SIH MVP
                </span>
              </div>
              <div className="text-[10px] text-slate-500 hidden sm:block">
                Connect People • Solve Problems • Create Impact
              </div>
            </div>
          </Link>

          {/* Mobile Right Controls: Compact Persona Chip & Quick Submit (< 768px) */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Compact Persona Pill */}
            <button
              onClick={() => setRoleMenuOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 active:scale-95 transition"
              id="mobile-role-pill-btn"
            >
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="capitalize text-[11px] truncate max-w-[80px]">
                {currentUser?.role || 'Citizen'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {/* Quick Submit Problem Icon */}
            <Link
              to="/submit"
              className="p-2 rounded-lg bg-teal-700 text-white active:scale-95 shadow-sm transition"
              aria-label="Submit Problem"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          </div>

          {/* Desktop Nav Links (>= 768px) */}
          <nav className="hidden md:flex items-center gap-1.5">
            <Link
              to="/challenges"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                location.pathname === '/challenges' ? 'bg-slate-100 text-teal-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Problems
            </Link>

            <Link
              to="/challenges/1"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                location.pathname.startsWith('/challenges/1') && !location.pathname.includes('match') ? 'bg-teal-50 text-teal-800 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Hero Scenario
            </Link>

            <Link
              to="/teams/1"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                location.pathname.startsWith('/teams') ? 'bg-slate-100 text-teal-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Workspace
            </Link>

            <Link
              to="/impact/1"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                location.pathname.startsWith('/impact') ? 'bg-slate-100 text-teal-900 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Impact</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 mx-1.5" />

            <Link
              to={getDashboardPath()}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-1.5 ${
                location.pathname.startsWith('/dashboard') ? 'bg-teal-700 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span className="capitalize">{currentUser?.role || 'Citizen'} View</span>
            </Link>

            <Link
              to="/submit"
              className="ml-1 bg-teal-700 hover:bg-teal-800 text-white px-3.5 py-1.5 rounded-lg text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Problem</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile Persona Sheet / Drawer (< 768px) */}
      {roleMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Demo Mode Controller</span>
                <h3 className="text-base font-bold text-slate-900">Switch Stakeholder Persona</h3>
              </div>
              <button
                onClick={() => setRoleMenuOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {DEMO_ROLES.map((r) => {
                const isActive = currentUser?.role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition touch-target ${
                      isActive 
                        ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-bold' 
                        : 'border-slate-200 bg-slate-50/50 text-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{r.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white border capitalize text-slate-600">
                          {r.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{r.title}</div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-teal-600 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  setRoleMenuOpen(false);
                  onOpenResetModal();
                }}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                <span>Reset Demo State to Initial Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
