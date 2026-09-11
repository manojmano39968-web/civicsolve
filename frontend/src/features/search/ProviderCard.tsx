import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { MatchedProvider } from './types.ts';

interface ProviderCardProps {
  provider: MatchedProvider;
  onRequestHelp: (provider: MatchedProvider) => void;
  onViewProfile?: (providerId: string) => void;
}

export const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  onRequestHelp,
  onViewProfile,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-emerald-500 ring-emerald-100';
      case 'BUSY':
        return 'bg-amber-500 ring-amber-100';
      default:
        return 'bg-slate-400 ring-slate-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'Available Now';
      case 'BUSY':
        return 'Busy / In Service';
      default:
        return 'Offline';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {/* Top Banner with Match Score & Status */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100/60 px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className={`w-2 h-2 rounded-full ring-4 ${getStatusColor(provider.availability)}`} />
          <span>{getStatusLabel(provider.availability)}</span>
        </div>
        <div className="flex items-center gap-1 text-brand-primary font-semibold bg-white px-2 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
          <Sparkles className="w-3 h-3 text-brand-accent" />
          <span>{(provider.score * 100).toFixed(0)}% Match</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1">
        {/* Main Info Header */}
        <div className="flex items-start gap-3.5 mb-3.5">
          {/* Avatar / Initial */}
          <div className="relative shrink-0">
            {provider.avatarUrl ? (
              <img
                src={provider.avatarUrl}
                alt={provider.fullName}
                className="w-13 h-13 rounded-2xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-accent/20 border border-brand-primary/20 flex items-center justify-center font-bold text-lg text-brand-primary">
                {provider.fullName.charAt(0)}
              </div>
            )}
            {provider.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"
                title="Verified Problem Solver"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 fill-emerald-100" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {provider.fullName}
              </h3>
              <Badge variant={provider.tier === 'GOLD' ? 'accent' : 'neutral'} size="sm">
                {provider.tier}
              </Badge>
            </div>

            <div className="text-xs text-slate-500 font-medium mt-0.5">
              {provider.serviceName} • {provider.serviceCategory}
            </div>

            {/* Ratings and Experience */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{provider.ratingAverage.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({provider.ratingCount})</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="text-slate-500">
                {provider.experienceYears}y exp
              </div>
              <span className="text-slate-300">•</span>
              <div className="text-slate-500">
                {provider.completedRequestsCount} solved
              </div>
            </div>
          </div>
        </div>

        {/* Bio snippet if available */}
        {provider.bio && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3.5 italic bg-slate-50/70 p-2 rounded-xl border border-slate-100">
            "{provider.bio}"
          </p>
        )}

        {/* Location & Distance Strip */}
        <div className="flex items-center justify-between text-xs bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 mb-3.5">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{provider.distanceKm.toFixed(1)} km away</span>
          </div>
          <div className="text-slate-500">
            Service radius: up to {provider.serviceRadiusKm} km
          </div>
        </div>

        {/* Transparent Starting Price */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 mb-3.5">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-emerald-800">Starting Price</span>
            <div className="text-right">
              <span className="text-base font-extrabold text-emerald-900">
                ₹{provider.startingPrice}
              </span>
              <span className="text-xs text-emerald-700 font-medium ml-1">
                / {provider.pricingUnit.replace('PER_', '').toLowerCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 mt-1">
            <Info className="w-3 h-3 shrink-0" />
            <span>{provider.pricingDisclaimer}</span>
          </div>
        </div>

        {/* Explainability Accordion ("Why this match?") */}
        <div className="border border-slate-100 rounded-xl overflow-hidden mb-2">
          <button
            type="button"
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-1.5 text-brand-primary">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              Why this match? ({provider.matchReasons.length} factors)
            </span>
            {showExplanation ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {showExplanation && (
            <div className="bg-slate-50/80 px-3 py-2.5 border-t border-slate-100 text-xs space-y-1.5 animate-fadeIn">
              {provider.matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 bg-white flex items-center gap-2">
        {onViewProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewProfile(provider.id)}
            className="text-xs text-slate-600"
          >
            View Profile
          </Button>
        )}
        <Button
          variant="primary"
          size="md"
          onClick={() => onRequestHelp(provider)}
          className="flex-1 shadow-sm font-semibold"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Request Service
        </Button>
      </div>
    </div>
  );
};
