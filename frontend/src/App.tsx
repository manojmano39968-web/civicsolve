import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Sparkles, ShieldCheck, HeartHandshake, User as UserIcon, LogOut, Wrench, ArrowRight, Layers } from 'lucide-react';
import { AuthProvider, useAuth } from './features/auth/AuthContext.tsx';
import { AuthModal } from './features/auth/AuthModal.tsx';
import { Button, Badge } from './components/ui/index.ts';
import { ProviderOnboardingWizard } from './features/providers/ProviderOnboardingWizard.tsx';
import { ProviderProfilePage } from './features/providers/ProviderProfilePage.tsx';
import { ProviderDashboard } from './features/providers/ProviderDashboard.tsx';
import { SearchBar } from './features/search/SearchBar.tsx';
import { SearchResultsPage } from './features/search/SearchResultsPage.tsx';
import { RequestsPage } from './features/requests/RequestsPage.tsx';

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
              {user.role === 'PROVIDER' ? (
                <Link to="/provider/dashboard">
                  <Button variant="secondary" size="sm" leftIcon={<Wrench className="w-3.5 h-3.5 text-brand-accent" />}>
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/requests">
                  <Button variant="secondary" size="sm">
                    My Requests
                  </Button>
                </Link>
              )}
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
  const navigate = useNavigate();

  const handleSearch = (query: string, lat?: number, lng?: number) => {
    const params = new URLSearchParams();
    params.set('q', query);
    if (lat) params.set('lat', lat.toString());
    if (lng) params.set('lng', lng.toString());
    navigate(`/search?${params.toString()}`);
  };

  const CATEGORIES = [
    { title: 'Home Maintenance', desc: 'Plumber, Electrician, Carpenter', query: 'plumber leaking tap' },
    { title: 'Technology & IT', desc: 'Laptop repair, Mobile, Networking', query: 'laptop screen repair' },
    { title: 'Automotive', desc: 'Puncture, Mechanic, Battery jumpstart', query: 'bike puncture repair' },
    { title: 'Education & Mentorship', desc: 'Java, Mathematics, Programming', query: 'calculus mathematics tutor' },
    { title: 'Engineering & Sanction', desc: 'Floor plans, Civil, Structural audits', query: 'house floor plan architect' },
    { title: 'Appliances', desc: 'AC cooling, Washing machine, Fridge', query: 'ac cooling repair' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-accent-light text-brand-accent-dark text-sm font-semibold mb-6">
        <Sparkles className="w-4 h-4" />
        Need → Understand → Match → Solve → Review
      </div>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 max-w-3xl mx-auto">
        Tell CivicSolve what problem you need solved.
      </h1>
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8">
        We understand your requirement in plain words using deterministic in-house intelligence, find verified problem solvers within your radius, and track resolution transparently.
      </p>

      {/* Hero Natural Language Search Bar */}
      <div className="max-w-3xl mx-auto mb-12">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Categories Explorer */}
      <div className="mb-14">
        <div className="text-left mb-4 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-primary" />
            Explore Verified Problem Categories
          </h2>
          <span className="text-xs text-slate-500">Zero AI hallucination • Hard radius matched</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-left">
          {CATEGORIES.map((cat, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSearch(cat.query)}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-brand-accent hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-sm text-slate-800 group-hover:text-brand-primary transition-colors">
                  {cat.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">{cat.desc}</div>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-brand-accent mt-3 group-hover:translate-x-1 transition-transform">
                <span>Find Solvers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
        <div className="p-5 bg-white rounded-2xl border border-surface-border shadow-card-subtle">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-1">In-House Intelligence</h2>
          <p className="text-sm text-slate-500">
            10-layer explainable NLP engine with typo tolerance, synonym expansion, and zero API costs.
          </p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-surface-border shadow-card-subtle">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand-accent flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-1">Guarded Roles & Privacy</h2>
          <p className="text-sm text-slate-500">
            Address shielding with Haversine distance, strict radius exclusion, and ABAC ownership guards.
          </p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-surface-border shadow-card-subtle">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="font-semibold text-slate-900 mb-1">Verified Resolution</h2>
          <p className="text-sm text-slate-500">
            Formal state machine lifecycle and genuine Bayesian reputation calculated strictly on confirmed solved requests.
          </p>
        </div>
      </div>

      {/* Join as Solver Callout */}
      <div className="mt-14 bg-gradient-to-r from-brand-primary to-slate-900 rounded-3xl p-8 sm:p-10 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-accent-light">Empowering Local Problem Solvers</span>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">Are you a technician, tutor, engineer, or craftsperson?</h3>
          <p className="text-sm text-slate-300">
            Offer your skills directly to your community with transparent pricing, zero middlemen cuts, and verified credentials.
          </p>
        </div>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => openAuthModal('register')}
          leftIcon={<Wrench className="w-4 h-4 text-brand-accent" />}
          className="shrink-0 shadow-md font-bold text-slate-900 bg-white hover:bg-slate-100"
        >
          Join as a Solver
        </Button>
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
              <Route path="/search" element={<SearchResultsPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/provider/onboard" element={<ProviderOnboardingWizard />} />
              <Route path="/provider/dashboard" element={<ProviderDashboard />} />
              <Route path="/provider/:id" element={<ProviderProfilePage />} />
            </Routes>
          </main>
          <AuthModal />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

