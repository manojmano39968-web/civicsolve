import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { ProviderPublicSummary, Review } from '@civicsolve/shared';
import { Button, Card, Badge, Skeleton } from '../../components/ui/index.ts';
import { RequestModal } from '../requests/RequestModal.tsx';
import {
  Star,
  MapPin,
  ShieldCheck,
  Clock,
  Wrench,
  Navigation,
  ArrowLeft,
  Building,
  User,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { PRICING_UNITS } from '@civicsolve/shared';

export const ProviderProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const [provider, setProvider] = useState<ProviderPublicSummary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        // Default coordinates for Bengaluru demonstration or device location
        const res = await api.get(`/providers/${id}`, {
          params: { lat: 12.9716, lng: 77.5946 },
        });
        setProvider(res.data.data);

        // Fetch reviews feed
        try {
          const revRes = await api.get(`/providers/${id}/reviews`);
          if (revRes.data.success) {
            setReviews(revRes.data.data);
          }
        } catch {
          // Non-blocking
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to load provider profile.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <Wrench className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Provider Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This service provider is unavailable or inactive.'}</p>
        <Button variant="secondary" onClick={() => navigate(-1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Go Back
        </Button>
      </div>
    );
  }

  const availabilityColors = {
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-300',
    BUSY: 'bg-amber-50 text-amber-700 border-amber-300',
    OFFLINE: 'bg-slate-100 text-slate-600 border-slate-300',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Results
      </button>

      {/* Hero Header Card */}
      <Card className="relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-brand-primary/10 border-2 border-brand-primary/20 flex items-center justify-center text-brand-primary flex-shrink-0">
            {provider.avatarUrl ? (
              <img src={provider.avatarUrl} alt={provider.fullName} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <User className="w-10 h-10 sm:w-12 sm:h-12" />
            )}
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {provider.businessName || provider.fullName}
              </h1>
              {provider.isVerified && (
                <Badge variant="accent" className="flex items-center gap-1 font-semibold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                  Verified Solver
                </Badge>
              )}
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${availabilityColors[provider.availability]}`}>
                {provider.availability === 'AVAILABLE' ? 'Available' : provider.availability === 'BUSY' ? 'Busy' : 'Offline'}
              </span>
            </div>

            <p className="text-base font-semibold text-brand-primary">{provider.professionalTitle}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
              <div className="flex items-center gap-1 font-semibold text-slate-800">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{provider.ratingAvg.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({provider.reviewCount} verified reviews)</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{provider.experienceYears} yrs experience</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{provider.area}, {provider.city}</span>
              </div>

              {provider.calculatedDistanceKm !== undefined && (
                <div className="flex items-center gap-1 text-brand-accent font-semibold">
                  <Navigation className="w-4 h-4" />
                  <span>{provider.calculatedDistanceKm} km away</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commercial Address (Only shown for verified businesses) */}
        {provider.publicAddress && (
          <div className="mt-4 pt-4 border-t border-surface-border flex items-start gap-2 text-xs text-slate-600">
            <Building className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">Commercial Service Center: </span>
              {provider.publicAddress}
            </div>
          </div>
        )}
      </Card>

      {/* Bio & Details */}
      {provider.bio && (
        <Card>
          <h2 className="text-base font-bold text-slate-900 mb-2">About the Problem Solver</h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{provider.bio}</p>

          <div className="mt-4 pt-4 border-t border-surface-border flex flex-wrap gap-4 text-xs font-medium text-slate-600">
            <div>
              <span className="text-slate-400 block">Service Mode:</span>
              <span className="font-semibold text-slate-800">
                {provider.serviceMode === 'HOME_VISIT'
                  ? 'Doorstep Visit'
                  : provider.serviceMode === 'SERVICE_CENTER'
                  ? 'Service Center'
                  : 'Doorstep Visit & Service Center'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Operating Radius:</span>
              <span className="font-semibold text-slate-800">Serves within {provider.serviceRadiusKm} km</span>
            </div>
          </div>
        </Card>
      )}

      {/* Offered Services & Transparent Pricing */}
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Services Offered & Typical Pricing</h2>
          <p className="text-xs text-slate-500">
            Transparent pricing declared directly by the problem solver.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {provider.services.map(s => {
            const unitInfo = PRICING_UNITS[s.pricingUnit];
            return (
              <div
                key={s.serviceId}
                className="p-4 rounded-xl border border-surface-border bg-surface-canvas flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm mb-1">{s.name}</h3>
                  <div className="text-lg font-extrabold text-brand-primary">
                    {s.typicalMin !== undefined && s.typicalMax !== undefined ? (
                      <span>
                        ₹{s.typicalMin} – ₹{s.typicalMax}
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          {unitInfo?.suffix || '/ service'}
                        </span>
                      </span>
                    ) : s.startingPrice ? (
                      <span>
                        ₹{s.startingPrice}
                        <span className="text-xs font-normal text-slate-500 ml-1">
                          starting {unitInfo?.suffix}
                        </span>
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-slate-500">Custom Quote</span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-400">
                  Typical price • Actual estimate provided on request
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Transparency Disclaimer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
          <strong>Pricing Notice:</strong> Final price may vary based on exact requirements, replacement parts/materials, distance, and task complexity.
        </div>
      </Card>

      {/* Verified Reviews Section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-primary" />
              Verified Reviews & Track Record
            </h2>
            <p className="text-xs text-slate-500">
              Reviews can strictly only be submitted after a verified problem resolution.
            </p>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-slate-900 text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{provider.ratingAvg.toFixed(1)}</span>
            <span className="text-xs text-slate-400 font-normal">({reviews.length} reviews)</span>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No reviews yet. Be the first to solve a problem with {provider.fullName}!
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-800">{rev.neederName || 'Customer'}</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Problem Solved
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                )}
                <div className="text-[10px] text-slate-400">
                  Verified resolution • {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-surface-border sm:static sm:bg-transparent sm:border-0 sm:p-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <div className="text-xs text-slate-500">Need help from this solver?</div>
            <div className="text-sm font-bold text-slate-900">Request service directly</div>
          </div>
          <Button
            size="lg"
            variant="accent"
            fullWidth={false}
            className="w-full sm:w-auto shadow-md font-bold"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('login');
              } else {
                setIsRequestModalOpen(true);
              }
            }}
          >
            Request Service
          </Button>
        </div>
      </div>

      {/* Service Request Creation Modal */}
      {isRequestModalOpen && (
        <RequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          provider={{
            id: provider.id,
            fullName: provider.fullName,
            startingPrice: provider.services[0]?.startingPrice ?? undefined,
            pricingUnit: provider.services[0]?.pricingUnit,
            services: provider.services.map((s) => ({
              serviceId: s.serviceId,
              name: s.name,
            })),
          }}
          onSuccess={() => {
            setIsRequestModalOpen(false);
            navigate('/requests');
          }}
        />
      )}
    </div>
  );
};
