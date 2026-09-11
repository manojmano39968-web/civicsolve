import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { ProviderProfile } from '@civicsolve/shared';
import { Button, Card, Badge, Skeleton } from '../../components/ui/index.ts';
import {
  Star,
  Clock,
  Wrench,
  ShieldCheck,
  Eye,
  Settings,
} from 'lucide-react';

export const ProviderDashboard: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/providers/me/profile');
        setProfile(res.data.data);
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Profile needs onboarding
          navigate('/provider/onboard');
        }
      } finally {
        setIsLoading(false);
      }
    };
    if (role === 'PROVIDER') {
      fetchMyProfile();
    }
  }, [role, navigate]);

  const handleStatusChange = async (newStatus: 'AVAILABLE' | 'BUSY' | 'OFFLINE') => {
    if (!profile || profile.availability === newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await api.put('/providers/me/availability', { status: newStatus });
      setProfile({ ...profile, availability: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {profile.businessName || user?.fullName}
            </h1>
            {profile.isVerified && (
              <Badge variant="accent" className="flex items-center gap-1 font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500">{profile.professionalTitle} • {profile.location?.area}, {profile.location?.city}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to={`/provider/${profile.id}`}>
            <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
              Public Profile
            </Button>
          </Link>
          <Link to="/provider/onboard">
            <Button variant="secondary" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
              Edit Services
            </Button>
          </Link>
        </div>
      </div>

      {/* Fast Availability Switcher */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider mb-1">
              Active Availability Status
            </div>
            <h2 className="text-lg font-bold">
              {profile.availability === 'AVAILABLE'
                ? '🟢 Available for new jobs'
                : profile.availability === 'BUSY'
                ? '🟡 Busy with current requests'
                : '⚪ Offline / Inactive'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Affects your match score and visibility to needers.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-800/80 p-1 border border-slate-700">
            {(['AVAILABLE', 'BUSY', 'OFFLINE'] as const).map(st => (
              <button
                key={st}
                disabled={isUpdatingStatus}
                onClick={() => handleStatusChange(st)}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  profile.availability === st
                    ? st === 'AVAILABLE'
                      ? 'bg-emerald-500 text-white shadow'
                      : st === 'BUSY'
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-slate-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st === 'AVAILABLE' ? 'Available' : st === 'BUSY' ? 'Busy' : 'Offline'}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{profile.ratingAvg.toFixed(1)} ★</div>
            <div className="text-xs text-slate-500">{profile.reviewCount} verified post-solve reviews</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand-accent flex items-center justify-center flex-shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{profile.services?.length || 0}</div>
            <div className="text-xs text-slate-500">Active services offered</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-primary flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900">{profile.serviceRadiusKm} km</div>
            <div className="text-xs text-slate-500">Operating service radius</div>
          </div>
        </Card>
      </div>

      {/* Offered Services List */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Services & Pricing</h2>
            <p className="text-xs text-slate-500">What needers see when matching with you</p>
          </div>
          <Link to="/provider/onboard">
            <Button variant="ghost" size="sm">
              Manage Services
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {profile.services?.map(s => (
            <div key={s.id} className="p-3.5 rounded-xl border border-surface-border bg-surface-canvas flex justify-between items-center">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">{s.categoryName}</span>
                <span className="font-bold text-sm text-slate-900">{s.serviceName}</span>
              </div>
              <div className="text-right">
                <span className="font-extrabold text-sm text-brand-primary">
                  {s.pricing?.typicalMin ? `₹${s.pricing.typicalMin} – ₹${s.pricing.typicalMax}` : 'Custom'}
                </span>
                <span className="text-xs text-slate-500 block">{s.pricing?.pricingUnit.replace('PER_', '').toLowerCase()}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
