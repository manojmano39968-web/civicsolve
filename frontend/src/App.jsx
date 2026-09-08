import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import MobileBottomNav from './components/MobileBottomNav';
import DemoResetModal from './components/DemoResetModal';
import LandingPage from './pages/LandingPage';
import DemoLoginPage from './pages/DemoLoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitChallengePage from './pages/SubmitChallengePage';
import MatchPage from './pages/MatchPage';
import TeamWorkspacePage from './pages/TeamWorkspacePage';
import ProgressPage from './pages/ProgressPage';
import SolutionPage from './pages/SolutionPage';
import ImpactPage from './pages/ImpactPage';
import StudentDashboard from './pages/StudentDashboard';
import ExpertDashboard from './pages/ExpertDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChallengesListPage from './pages/ChallengesListPage';
import ChallengeDetailPage from './pages/ChallengeDetailPage';

export default function App() {
  const [resetModalOpen, setResetModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-teal-100 selection:text-teal-900 pb-safe-nav md:pb-0">
      <Navbar onOpenResetModal={() => setResetModalOpen(true)} />

      <main className="flex-1">
        <Routes>
          {/* Main Landing & Presentation Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/demo-login" element={<DemoLoginPage />} />

          {/* Citizen & Problem Intake */}
          <Route path="/dashboard/citizen" element={<CitizenDashboard />} />
          <Route path="/submit" element={<SubmitChallengePage />} />

          {/* Challenges & Smart Matching */}
          <Route path="/challenges" element={<ChallengesListPage />} />
          <Route path="/challenges/:id" element={<ChallengeDetailPage />} />
          <Route path="/challenges/:id/matches" element={<MatchPage />} />

          {/* Collaboration, Progress, Solution, Impact */}
          <Route path="/teams/:id" element={<TeamWorkspacePage />} />
          <Route path="/progress/:id" element={<ProgressPage />} />
          <Route path="/solutions/:id" element={<SolutionPage />} />
          <Route path="/impact/:id" element={<ImpactPage />} />

          {/* Stakeholder Dashboards */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/expert" element={<ExpertDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard onOpenResetModal={() => setResetModalOpen(true)} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav />

      <footer className="border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500 mb-12 md:mb-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CivicSolve</span>
            <span>• Connect People | Solve Problems | Create Impact</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Smart India Hackathon Working MVP Prototype • Node.js + Python FastAPI + React
          </div>
        </div>
      </footer>

      {/* Global Reset Demo Modal */}
      <DemoResetModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onResetComplete={() => window.location.reload()}
      />
    </div>
  );
}
