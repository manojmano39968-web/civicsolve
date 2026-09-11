import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, HeartHandshake, User as UserIcon, LogOut, Wrench } from 'lucide-react';
import { AuthProvider, useAuth } from './features/auth/AuthContext.tsx';
import { AuthModal } from './features/auth/AuthModal.tsx';
import { Button, Badge } from './components/ui/index.ts';

function Header() {
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  return (
    <header className="bg-surface-card border-b border-surface-border sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center text-white font-bold text-lg shadow-sm">
            CS
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-brand-primary">
              Civic<span className="text-brand-accent">Solve</span>
            </span>
            <span className="text-xs ml-1.5 px-1.5 py-0.5 rounded bg-brand-accent-light text-brand-accent-dark font-semibold">
              V2
            </span>
          </div>
        </Link>

        <div className="text-xs sm:text-sm text-slate-500 font-medium hidden md:block">
          Connect People | Solve Problems | Create Impact
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                  <UserIcon className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline font-semibold">{user.fullName}</span>
                <Badge variant={user.role === 'PROVIDER' ? 'accent' : user.role === 'ADMIN' ? 'brand' : 'neutral'}>
                  {user.role}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-slate-500 hover:text-rose-600"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => openAuthModal('login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuthModal('register')}
              >
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function HomePage() {
  const { openAuthModal } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accent-light text-brand-accent-dark text-sm font-semibold mb-6">
        <Sparkles className="w-4 h-4" />
        Need → Understand → Match → Solve → Review
      </div>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
        Tell CivicSolve what you need.
      </h1>
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8">
        We understand your requirement using explainable in-house intelligence, find verified problem solvers near you, and track the solution to completion.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
        <Button
          size="lg"
          variant="primary"
          onClick={() => openAuthModal('register')}
          className="w-full sm:w-auto"
        >
          Find a Problem Solver
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => openAuthModal('register')}
          leftIcon={<Wrench className="w-4 h-4 text-brand-accent" />}
          className="w-full sm:w-auto"
        >
          Join as a Solver / Provider
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="p-5 bg-white rounded-2xl border border-surface-border shadow-card-subtle">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-1">In-House Intelligence</h2>
          <p className="text-sm text-slate-500">10-layer explainable NLP engine without external AI dependencies or API costs.</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-surface-border shadow-card-subtle">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand-accent flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-1">Guarded Roles & Privacy</h2>
          <p className="text-sm text-slate-500">ABAC ownership, location privacy shielding, and formal state machine transitions.</p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-surface-border shadow-card-subtle">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-1">Verified Resolution</h2>
          <p className="text-sm text-slate-500">Genuine reviews built strictly on confirmed problem solving interactions.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-surface-canvas">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
