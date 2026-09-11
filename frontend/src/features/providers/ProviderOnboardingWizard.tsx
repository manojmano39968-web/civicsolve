import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Category, Service, ProviderType, ServiceMode, PricingUnit } from '@civicsolve/shared';
import { Button, Input, Card, Badge } from '../../components/ui/index.ts';
import { Check, ArrowRight, ArrowLeft, Wrench, ShieldAlert } from 'lucide-react';

interface SelectedServiceConfig {
  serviceId: string;
  serviceName: string;
  categoryName: string;
  customTitle?: string;
  startingPrice?: number;
  typicalMin?: number;
  typicalMax?: number;
  pricingUnit: PricingUnit;
  pricingNotes?: string;
}

export const ProviderOnboardingWizard: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Taxonomy data
  const [categories, setCategories] = useState<Category[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');

  // Form states
  const [providerType, setProviderType] = useState<ProviderType>('INDIVIDUAL');
  const [businessName, setBusinessName] = useState('');
  const [professionalTitle, setProfessionalTitle] = useState('');
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState<number>(3);
  const [serviceMode, setServiceMode] = useState<ServiceMode>('HOME_VISIT');
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(10);
  const [availability, setAvailability] = useState<'AVAILABLE' | 'BUSY' | 'OFFLINE'>('AVAILABLE');
  const [statusNote, setStatusNote] = useState('');

  // Location
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560038');
  const [latitude] = useState(12.9716);
  const [longitude] = useState(77.5946);

  // Selected services with pricing
  const [selectedServices, setSelectedServices] = useState<SelectedServiceConfig[]>([]);

  useEffect(() => {
    // Load taxonomy
    const loadTaxonomy = async () => {
      try {
        const [catsRes, svcsRes] = await Promise.all([
          api.get('/taxonomy/categories'),
          api.get('/taxonomy/services'),
        ]);
        setCategories(catsRes.data.data);
        setAllServices(svcsRes.data.data);
        if (catsRes.data.data.length > 0) {
          setSelectedCategorySlug(catsRes.data.data[0].slug);
        }
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      }
    };
    loadTaxonomy();
  }, []);

  if (role !== 'PROVIDER') {
    return (
      <div className="max-w-xl mx-auto p-6 my-12 text-center bg-white rounded-2xl border border-surface-border">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Provider Account Required</h2>
        <p className="text-sm text-slate-600 mb-4">
          You are currently signed in as a Solution Needer. Please sign in with a Service Provider account to access onboarding.
        </p>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
      </div>
    );
  }

  const toggleServiceSelection = (svc: Service) => {
    const exists = selectedServices.some(s => s.serviceId === svc.id);
    if (exists) {
      setSelectedServices(selectedServices.filter(s => s.serviceId !== svc.id));
    } else {
      setSelectedServices([
        ...selectedServices,
        {
          serviceId: svc.id,
          serviceName: svc.name,
          categoryName: svc.categoryName || 'General',
          customTitle: svc.name,
          startingPrice: 300,
          typicalMin: 300,
          typicalMax: 800,
          pricingUnit: svc.defaultPricingUnit || 'PER_SERVICE',
          pricingNotes: 'Typical residential visit',
        },
      ]);
    }
  };

  const updateServicePricing = (serviceId: string, updates: Partial<SelectedServiceConfig>) => {
    setSelectedServices(
      selectedServices.map(s => (s.serviceId === serviceId ? { ...s, ...updates } : s))
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        providerType,
        businessName: businessName || undefined,
        professionalTitle,
        bio,
        experienceYears: Number(experienceYears),
        serviceMode,
        serviceRadiusKm: Number(serviceRadiusKm),
        availability,
        statusNote: statusNote || undefined,
        latitude,
        longitude,
        addressLine,
        area,
        city,
        pincode: pincode || undefined,
        services: selectedServices.map(s => ({
          serviceId: s.serviceId,
          customTitle: s.customTitle,
          startingPrice: s.startingPrice ? Number(s.startingPrice) : undefined,
          typicalMin: s.typicalMin ? Number(s.typicalMin) : undefined,
          typicalMax: s.typicalMax ? Number(s.typicalMax) : undefined,
          pricingUnit: s.pricingUnit,
          pricingNotes: s.pricingNotes,
        })),
      };

      await api.post('/providers/onboard', payload);
      navigate('/provider/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Onboarding submission failed. Please review your details.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentServicesForCategory = allServices.filter(
    s => s.categorySlug === selectedCategorySlug
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Wizard Header & Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
          <span>Provider Onboarding</span>
          <span>Step {step} of 6</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand-accent h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Professional Identity */}
      {step === 1 && (
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Professional Profile</h2>
            <p className="text-sm text-slate-500">How do you operate as a problem solver?</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">I am an:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { type: 'INDIVIDUAL' as ProviderType, label: 'Individual Professional' },
                { type: 'FREELANCER' as ProviderType, label: 'Freelancer / Gig' },
                { type: 'BUSINESS' as ProviderType, label: 'Registered Business' },
                { type: 'STUDENT' as ProviderType, label: 'Student / Mentor' },
                { type: 'FACULTY' as ProviderType, label: 'Academic Faculty' },
                { type: 'TECH_CLUB' as ProviderType, label: 'Technical Club' },
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setProviderType(item.type)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    providerType === item.type
                      ? 'border-brand-accent bg-teal-50/50 ring-2 ring-brand-accent/20 font-semibold text-slate-900'
                      : 'border-surface-border text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {providerType === 'BUSINESS' && (
            <Input
              label="Business / Enterprise Name"
              placeholder="e.g. Apex Electricals & Solutions"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
            />
          )}

          <Input
            label="Professional Title"
            required
            placeholder="e.g. Certified Domestic Plumber or Master Painter"
            value={professionalTitle}
            onChange={e => setProfessionalTitle(e.target.value)}
            helperText="A clear, concise title displayed prominently on your profile."
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Years of Experience</label>
            <input
              type="number"
              min="0"
              max="50"
              step="0.5"
              className="w-full rounded-xl border border-surface-border px-4 py-2.5 text-slate-900"
              value={experienceYears}
              onChange={e => setExperienceYears(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Bio & Problem Solving Philosophy</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-surface-border p-3 text-sm text-slate-900 focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent focus:outline-none"
              placeholder="Describe your expertise, past projects, equipment, or approach to solving problems."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => {
                if (!professionalTitle.trim()) {
                  setError('Please provide a professional title before proceeding.');
                  return;
                }
                setError(null);
                setStep(2);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Select Services
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Select Services */}
      {step === 2 && (
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Select Offered Services</h2>
            <p className="text-sm text-slate-500">Pick from predefined CivicSolve service capabilities.</p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategorySlug(cat.slug)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                  selectedCategorySlug === cat.slug
                    ? 'bg-brand-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Services in Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentServicesForCategory.map(svc => {
              const isSelected = selectedServices.some(s => s.serviceId === svc.id);
              return (
                <button
                  key={svc.id}
                  type="button"
                  onClick={() => toggleServiceSelection(svc)}
                  className={`p-3.5 rounded-xl border text-left flex items-start justify-between transition-all ${
                    isSelected
                      ? 'border-brand-accent bg-teal-50/60 ring-2 ring-brand-accent/20'
                      : 'border-surface-border hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{svc.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{svc.description}</p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ml-2 flex-shrink-0 ${
                      isSelected ? 'bg-brand-accent text-white' : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">
                {selectedServices.length} service(s) selected
              </span>
              <Button
                onClick={() => {
                  if (selectedServices.length === 0) {
                    setError('Please select at least one service capability.');
                    return;
                  }
                  setError(null);
                  setStep(3);
                }}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next: Pricing
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Pricing Configuration */}
      {step === 3 && (
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Service Pricing</h2>
            <p className="text-sm text-slate-500">
              Provide typical price bounds for each selected service. (Clearly labeled as provider-declared).
            </p>
          </div>

          <div className="space-y-4">
            {selectedServices.map(s => (
              <div key={s.serviceId} className="p-4 rounded-xl border border-surface-border bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm">{s.serviceName}</h3>
                  <Badge variant="accent">{s.categoryName}</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Typical Min (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm bg-white"
                      value={s.typicalMin ?? ''}
                      onChange={e =>
                        updateServicePricing(s.serviceId, {
                          typicalMin: parseFloat(e.target.value) || 0,
                          startingPrice: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Typical Max (₹)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm bg-white"
                      value={s.typicalMax ?? ''}
                      onChange={e =>
                        updateServicePricing(s.serviceId, {
                          typicalMax: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pricing Unit</label>
                    <select
                      className="w-full rounded-lg border border-surface-border px-3 py-2 text-sm bg-white"
                      value={s.pricingUnit}
                      onChange={e =>
                        updateServicePricing(s.serviceId, {
                          pricingUnit: e.target.value as PricingUnit,
                        })
                      }
                    >
                      <option value="PER_SERVICE">Per Service</option>
                      <option value="PER_HOUR">Per Hour</option>
                      <option value="PER_DAY">Per Day</option>
                      <option value="PER_SQFT">Per Sq.Ft</option>
                      <option value="PER_ITEM">Per Item</option>
                      <option value="PER_KM">Per Km</option>
                      <option value="CUSTOM">Custom Quote</option>
                    </select>
                  </div>
                </div>

                <Input
                  placeholder="Notes (e.g. materials charged separately, diagnostic included)"
                  value={s.pricingNotes || ''}
                  onChange={e => updateServicePricing(s.serviceId, { pricingNotes: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs">
            <strong>Transparency Notice:</strong> Final price may vary based on requirements, materials, distance and complexity.
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Location & Radius
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Location & Service Radius */}
      {step === 4 && (
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Location & Service Radius</h2>
            <p className="text-sm text-slate-500">
              Where are you based and how far are you willing to travel to solve problems?
            </p>
          </div>

          <div className="space-y-4">
            <Input
              label="Operating Street Address / Base"
              required
              placeholder="e.g. 12th Main Road, HAL 2nd Stage"
              value={addressLine}
              onChange={e => setAddressLine(e.target.value)}
              helperText={
                providerType === 'INDIVIDUAL'
                  ? '🔒 Privacy Protected: Exact street address is strictly kept internal and never shown to public users.'
                  : 'Commercial business address visible to customers.'
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Area / Neighborhood"
                required
                placeholder="e.g. Indiranagar"
                value={area}
                onChange={e => setArea(e.target.value)}
              />
              <Input
                label="City"
                required
                placeholder="e.g. Bengaluru"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
              <Input
                label="Pincode"
                placeholder="e.g. 560038"
                value={pincode}
                onChange={e => setPincode(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Service Radius: <span className="text-brand-accent font-bold">{serviceRadiusKm} km</span>
              </label>
              <div className="flex gap-2 mb-3">
                {[5, 10, 15, 20, 30].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setServiceRadiusKm(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      serviceRadiusKm === r
                        ? 'bg-brand-accent text-white border-brand-accent'
                        : 'bg-white text-slate-600 border-surface-border'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                className="w-full accent-brand-accent cursor-pointer"
                value={serviceRadiusKm}
                onChange={e => setServiceRadiusKm(Number(e.target.value))}
              />
              <p className="text-xs text-slate-500 mt-1">
                You will only be matched with problem requests within this distance from your base location.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              onClick={() => {
                if (!addressLine.trim() || !area.trim() || !city.trim()) {
                  setError('Please fill in your address, area and city.');
                  return;
                }
                setError(null);
                setStep(5);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Next: Service Mode
            </Button>
          </div>
        </Card>
      )}

      {/* Step 5: Service Mode & Availability */}
      {step === 5 && (
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Service Mode & Availability</h2>
            <p className="text-sm text-slate-500">How do you provide assistance?</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Service Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { mode: 'HOME_VISIT' as ServiceMode, label: 'Home / Customer Location Visit', desc: 'You travel to the needer to fix the issue.' },
                { mode: 'SERVICE_CENTER' as ServiceMode, label: 'Service Center / Workshop', desc: 'Needers bring devices or visit your premises.' },
                { mode: 'BOTH' as ServiceMode, label: 'Both Available', desc: 'Doorstep visit and workshop options both supported.' },
              ].map(item => (
                <button
                  key={item.mode}
                  type="button"
                  onClick={() => setServiceMode(item.mode)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    serviceMode === item.mode
                      ? 'border-brand-accent bg-teal-50/50 ring-2 ring-brand-accent/20'
                      : 'border-surface-border bg-white hover:border-slate-300'
                  }`}
                >
                  <h3 className="font-bold text-sm text-slate-900 mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Initial Availability</label>
            <div className="flex gap-3">
              {[
                { status: 'AVAILABLE' as const, label: 'Available Now', color: 'bg-emerald-50 text-emerald-700 border-emerald-300' },
                { status: 'BUSY' as const, label: 'Busy with existing jobs', color: 'bg-amber-50 text-amber-700 border-amber-300' },
                { status: 'OFFLINE' as const, label: 'Offline / Inactive', color: 'bg-slate-100 text-slate-700 border-slate-300' },
              ].map(item => (
                <button
                  key={item.status}
                  type="button"
                  onClick={() => setAvailability(item.status)}
                  className={`flex-1 p-3 rounded-xl border text-center text-xs sm:text-sm font-bold transition-all ${
                    availability === item.status ? `${item.color} ring-2 ring-offset-1` : 'border-surface-border text-slate-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Optional Status Note"
            placeholder="e.g. Taking bookings for afternoon slots"
            value={statusNote}
            onChange={e => setStatusNote(e.target.value)}
          />

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setStep(4)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button onClick={() => setStep(6)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Review Profile
            </Button>
          </div>
        </Card>
      )}

      {/* Step 6: Review & Finalize */}
      {step === 6 && (
        <Card className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Review Your Provider Profile</h2>
            <p className="text-sm text-slate-500">Confirm your details before activating your problem solver profile.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-surface-border space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Name:</span>
              <span className="font-bold text-slate-900">{user?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="font-bold text-slate-900">{professionalTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Provider Type:</span>
              <span className="font-bold text-slate-900">{providerType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location Base:</span>
              <span className="font-bold text-slate-900">{area}, {city} (Radius: {serviceRadiusKm} km)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Services:</span>
              <span className="font-bold text-brand-accent">{selectedServices.length} services configured</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-border">
            <Button variant="secondary" onClick={() => setStep(5)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button
              variant="accent"
              isLoading={isSubmitting}
              onClick={handleSubmit}
              leftIcon={<Wrench className="w-4 h-4" />}
            >
              Complete & Activate Profile
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
