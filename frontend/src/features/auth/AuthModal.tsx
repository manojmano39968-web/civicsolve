import React, { useState } from 'react';
import { useAuth } from './AuthContext.tsx';
import { Modal, Button, Input } from '../../components/ui/index.ts';
import { UserCheck, Wrench, AlertCircle } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalTab, openAuthModal, login, register } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'NEEDER' | 'PROVIDER'>('NEEDER');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authModalTab === 'login') {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          fullName,
          phone: phone || undefined,
          role,
        });
      }
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Authentication failed. Please check your credentials.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title={authModalTab === 'login' ? 'Sign In to CivicSolve' : 'Join CivicSolve'}
      maxWidth="md"
    >
      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
        <button
          type="button"
          onClick={() => { setError(null); openAuthModal('login'); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            authModalTab === 'login'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setError(null); openAuthModal('register'); }}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
            authModalTab === 'register'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Create Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {authModalTab === 'register' && (
          <>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('NEEDER')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === 'NEEDER'
                      ? 'border-brand-primary bg-blue-50/50 ring-2 ring-brand-primary/20'
                      : 'border-surface-border bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm mb-1">
                    <UserCheck className={`w-4 h-4 ${role === 'NEEDER' ? 'text-brand-primary' : 'text-slate-400'}`} />
                    Get Help
                  </div>
                  <p className="text-xs text-slate-500">I have problems to solve or services I need.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('PROVIDER')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    role === 'PROVIDER'
                      ? 'border-brand-accent bg-teal-50/50 ring-2 ring-brand-accent/20'
                      : 'border-surface-border bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm mb-1">
                    <Wrench className={`w-4 h-4 ${role === 'PROVIDER' ? 'text-brand-accent' : 'text-slate-400'}`} />
                    Offer Services
                  </div>
                  <p className="text-xs text-slate-500">I am a solver, technician, tutor, or business.</p>
                </button>
              </div>
            </div>

            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Ananya Patel"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </>
        )}

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="your.email@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <Input
          label="Password"
          type="password"
          required
          placeholder={authModalTab === 'register' ? 'Min 8 chars, 1 uppercase, 1 number' : 'Enter your password'}
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant={role === 'PROVIDER' && authModalTab === 'register' ? 'accent' : 'primary'}
            fullWidth
            isLoading={isSubmitting}
          >
            {authModalTab === 'login' ? 'Sign In' : role === 'PROVIDER' ? 'Continue as Service Provider' : 'Create Needer Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
