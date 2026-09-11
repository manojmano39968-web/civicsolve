import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-surface-canvas">
        <header className="bg-surface-card border-b border-surface-border sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold text-lg">
                CS
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-brand-primary">Civic<span className="text-brand-accent">Solve</span></span>
                <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-brand-accent-light text-brand-accent-dark font-semibold">V2</span>
              </div>
            </Link>
            <div className="text-xs sm:text-sm text-slate-500 font-medium hidden sm:block">
              Connect People | Solve Problems | Create Impact
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Routes>
            <Route path="/" element={
              <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-accent-light text-brand-accent-dark text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  CivicSolve V2 Architecture Initialized
                </div>
                <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                  Tell CivicSolve what you need.
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
                  Natural language problem understanding, transparent multi-factor matching, and verified resolution tracking.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                  <div className="p-5 bg-white rounded-xl border border-surface-border shadow-card-subtle">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center mb-3">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h2 className="font-semibold text-slate-900 mb-1">In-House Intelligence</h2>
                    <p className="text-sm text-slate-500">10-layer explainable NLP engine without external AI dependencies.</p>
                  </div>
                  <div className="p-5 bg-white rounded-xl border border-surface-border shadow-card-subtle">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-brand-accent flex items-center justify-center mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h2 className="font-semibold text-slate-900 mb-1">Guarded Roles & Privacy</h2>
                    <p className="text-sm text-slate-500">ABAC ownership, location privacy, and formal state machine.</p>
                  </div>
                  <div className="p-5 bg-white rounded-xl border border-surface-border shadow-card-subtle">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <h2 className="font-semibold text-slate-900 mb-1">Verified Resolution</h2>
                    <p className="text-sm text-slate-500">Genuine reviews built strictly on completed problem solving.</p>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
