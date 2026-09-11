import React, { useState } from 'react';
import { MapPin, Loader2, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { api } from '../../services/api.ts';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: {
    id: string;
    fullName: string;
    startingPrice?: number;
    pricingUnit?: string;
    services?: { serviceId: string; name: string }[];
    serviceName?: string;
    serviceId?: string;
  };
  onSuccess?: (requestId: string) => void;
}

export const RequestModal: React.FC<RequestModalProps> = ({
  isOpen,
  onClose,
  provider,
  onSuccess,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    provider.serviceId || provider.services?.[0]?.serviceId || ''
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [serviceMode, setServiceMode] = useState<'HOME_VISIT' | 'SERVICE_CENTER'>('HOME_VISIT');
  const [preferredSchedule, setPreferredSchedule] = useState('Within 2-4 hours');
  const [addressLine, setAddressLine] = useState('');
  const [area, setArea] = useState('Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [pincode, setPincode] = useState('560038');
  const [lat, setLat] = useState<number>(12.9716);
  const [lng, setLng] = useState<number>(77.5946);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRequestId, setCreatedRequestId] = useState<string | null>(null);

  React.useEffect(() => {
    if (provider.serviceId) {
      setSelectedServiceId(provider.serviceId);
    } else if (provider.services && provider.services.length > 0) {
      setSelectedServiceId(provider.services[0].serviceId);
    }
  }, [provider]);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      },
      (err) => console.warn('Geolocation fallback:', err)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !addressLine) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/requests', {
        providerId: provider.id,
        serviceId: selectedServiceId || 'svc-plumber',
        title,
        description,
        serviceMode,
        preferredSchedule,
        addressLine,
        area,
        city,
        pincode,
        latitude: lat,
        longitude: lng,
      });

      if (res.data.success) {
        const req = res.data.data;
        setCreatedRequestId(req.id);
        if (onSuccess) onSuccess(req.id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to submit service request.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDone = () => {
    setCreatedRequestId(null);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleDone} title={`Request Service from ${provider.fullName}`}>
      {createdRequestId ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Service Request Sent!</h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mb-6 leading-relaxed">
            {provider.fullName} has received your request. You will be notified the moment they accept and share their estimated arrival time.
          </p>
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-left text-slate-600 mb-6 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              CivicSolve Quality Assurance
            </div>
            <p>
              Your exact contact details are shared safely with the solver only once they accept the request.
            </p>
          </div>
          <Button variant="primary" size="md" onClick={handleDone} className="w-full shadow-sm">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Pricing Transparent Callout */}
          {provider.startingPrice && (
            <div className="bg-emerald-50/80 border border-emerald-200/70 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transparent Pricing: </span>
                Starting from ₹{provider.startingPrice} {provider.pricingUnit ? `/ ${provider.pricingUnit.replace('PER_', '').toLowerCase()}` : ''}.
                Final price is directly agreed upon inspection. No hidden platform markups.
              </div>
            </div>
          )}

          {/* Service Selector if multiple */}
          {provider.services && provider.services.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium focus:ring-2 focus:ring-brand-accent focus:outline-none"
              >
                {provider.services.map((s) => (
                  <option key={s.serviceId} value={s.serviceId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Problem Summary <span className="text-rose-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bathroom pipe leaking severely"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Detailed Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
              placeholder="Explain the issue, tools needed, when you noticed it, and any special instructions..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setServiceMode('HOME_VISIT')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    serviceMode === 'HOME_VISIT'
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Doorstep Visit
                </button>
                <button
                  type="button"
                  onClick={() => setServiceMode('SERVICE_CENTER')}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    serviceMode === 'SERVICE_CENTER'
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  At Center
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Timing
              </label>
              <Input
                value={preferredSchedule}
                onChange={(e) => setPreferredSchedule(e.target.value)}
                placeholder="e.g. Urgent / Today at 4 PM"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">
                Service Address <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1"
              >
                <MapPin className="w-3 h-3" />
                Detect GPS Location
              </button>
            </div>
            <Input
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="House/Flat number, building name, street"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Area / Locality</label>
              <Input value={area} onChange={(e) => setArea(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Pincode</label>
              <Input value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              className="shadow-sm font-semibold"
              leftIcon={isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
            >
              {isLoading ? 'Submitting...' : 'Send Service Request'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
