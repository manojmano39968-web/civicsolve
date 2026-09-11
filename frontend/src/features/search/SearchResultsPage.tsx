import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  ArrowUpDown,
  AlertCircle,
  Sparkles,
  Inbox,
  Send,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { SearchBar } from './SearchBar.tsx';
import { ProviderCard } from './ProviderCard.tsx';
import { ClarificationPrompt } from './ClarificationPrompt.tsx';
import { FilterSheet } from './FilterSheet.tsx';
import { RequestModal } from '../requests/RequestModal.tsx';
import { Button } from '../../components/ui/Button.tsx';
import { Modal } from '../../components/ui/Modal.tsx';
import { Input } from '../../components/ui/Input.tsx';
import { Skeleton } from '../../components/ui/Skeleton.tsx';
import { MatchedProvider, SearchUnderstanding, SearchFilters } from './types.ts';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, openAuthModal } = useAuth();

  const query = searchParams.get('q') || '';
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const lat = latParam ? parseFloat(latParam) : 12.9716; // default Bengaluru
  const lng = lngParam ? parseFloat(lngParam) : 77.5946;

  const [understanding, setUnderstanding] = useState<SearchUnderstanding | null>(null);
  const [providers, setProviders] = useState<MatchedProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    maxDistanceKm: 30,
    minRating: 0,
    onlyAvailable: false,
    onlyVerified: false,
    sortBy: 'BEST_MATCH',
  });

  // Requirement posting modal state (unmet requirement)
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [requestingProvider, setRequestingProvider] = useState<MatchedProvider | null>(null);
  const [reqTitle, setReqTitle] = useState(query);
  const [reqDescription, setReqDescription] = useState(query);
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);

  // Load categories for filter sheet
  useEffect(() => {
    api.get('/taxonomy/categories')
      .then((res) => {
        if (res.data.success) {
          setCategories(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Execute search when query or location changes
  useEffect(() => {
    if (!query) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setReqSuccess(false);
    setReqTitle(query);
    setReqDescription(query);

    const performSearch = async () => {
      try {
        // Step 1: Understand query
        const understandRes = await api.get('/search/understand', {
          params: { q: query },
        });
        if (!isMounted) return;

        const underData = understandRes.data.data;
        setUnderstanding(underData);

        // Step 2: Fetch matched providers
        const providersRes = await api.post('/search/providers', {
          query,
          latitude: lat,
          longitude: lng,
          categoryId: filters.categoryId,
          serviceId: filters.serviceId,
          maxDistanceKm: filters.maxDistanceKm,
          onlyAvailable: filters.onlyAvailable,
          onlyVerified: filters.onlyVerified,
        });

        if (!isMounted) return;
        setProviders(providersRes.data.data || []);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Search failed:', err);
        setError(err.response?.data?.message || 'Failed to complete search. Please try again.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    performSearch();

    return () => {
      isMounted = false;
    };
  }, [query, lat, lng, filters.categoryId, filters.serviceId, filters.maxDistanceKm, filters.onlyAvailable, filters.onlyVerified]);

  const handleSearchSubmit = (newQuery: string, newLat?: number, newLng?: number) => {
    const params = new URLSearchParams();
    params.set('q', newQuery);
    if (newLat) params.set('lat', newLat.toString());
    if (newLng) params.set('lng', newLng.toString());
    setSearchParams(params);
  };

  const handleSelectClarification = (opt: { serviceId: string; name: string }) => {
    // When user clarifies specific service, update query & service filter
    setFilters((prev) => ({ ...prev, serviceId: opt.serviceId }));
    const params = new URLSearchParams(searchParams);
    params.set('q', opt.name);
    setSearchParams(params);
  };

  // Sort providers based on chosen sort option
  const sortedProviders = [...providers].sort((a, b) => {
    if (filters.sortBy === 'DISTANCE') {
      return a.distanceKm - b.distanceKm;
    }
    if (filters.sortBy === 'RATING') {
      return (b.ratingAverage || 0) - (a.ratingAverage || 0);
    }
    if (filters.sortBy === 'PRICE_LOW') {
      return a.startingPrice - b.startingPrice;
    }
    return b.score - a.score; // Default BEST_MATCH
  });

  const handlePostRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    setIsSubmittingReq(true);
    try {
      await api.post('/search/requirements', {
        title: reqTitle,
        description: reqDescription,
        latitude: lat,
        longitude: lng,
        serviceId: understanding?.detectedServices[0]?.id,
      });
      setReqSuccess(true);
      setTimeout(() => {
        setIsRequirementModalOpen(false);
        setReqSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to post requirement.');
    } finally {
      setIsSubmittingReq(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Search Bar */}
        <div className="max-w-3xl mx-auto mb-6">
          <SearchBar
            initialQuery={query}
            initialLat={lat}
            initialLng={lng}
            onSearch={handleSearchSubmit}
            isLoading={isLoading}
          />
        </div>

        {/* Clarification prompt if ambiguous query */}
        {understanding?.needsClarification && understanding.clarificationOptions && (
          <div className="max-w-3xl mx-auto">
            <ClarificationPrompt
              prompt={
                understanding.clarificationPrompt ||
                `We found multiple possible services for "${query}". Which one do you need?`
              }
              options={understanding.clarificationOptions}
              onSelectOption={handleSelectClarification}
            />
          </div>
        )}

        {/* Understanding Insight Banner */}
        {understanding && !understanding.needsClarification && understanding.extractedKeywords.length > 0 && (
          <div className="max-w-3xl mx-auto mb-6 bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 text-xs text-slate-600 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span>
                Understood intent: <strong className="text-slate-800">{understanding.intent}</strong>
                {understanding.detectedServices[0] && (
                  <> • Identified service: <strong className="text-brand-primary">{understanding.detectedServices[0].name}</strong></>
                )}
              </span>
            </div>
            <span className="hidden sm:inline text-slate-400">Deterministic CivicSolve Engine</span>
          </div>
        )}

        {/* Results Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {isLoading ? 'Finding problem solvers...' : `${sortedProviders.length} Problem Solvers Found`}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Ranked by verified skills, strict distance radius, reputation, and availability.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })
                }
                className="bg-transparent border-none focus:outline-none cursor-pointer pr-1"
              >
                <option value="BEST_MATCH">Best Match (Multi-factor)</option>
                <option value="DISTANCE">Nearest First</option>
                <option value="RATING">Highest Rating</option>
                <option value="PRICE_LOW">Lowest Price</option>
              </select>
            </div>

            {/* Filter Toggle */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterOpen(true)}
              leftIcon={<SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />}
              className="text-xs"
            >
              Filters
              {(filters.categoryId || filters.onlyAvailable || filters.onlyVerified || (filters.minRating || 0) > 0) && (
                <span className="ml-1.5 w-2 h-2 rounded-full bg-brand-primary" />
              )}
            </Button>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-10 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Results Grid */}
        {!isLoading && sortedProviders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onViewProfile={(id) => navigate(`/provider/${id}`)}
                onRequestHelp={(p) => {
                  if (!isAuthenticated) {
                    openAuthModal('login');
                  } else {
                    setRequestingProvider(p);
                  }
                }}
              />
            ))}
          </div>
        )}

        {/* Empty State when 0 providers match */}
        {!isLoading && sortedProviders.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-xl mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <Inbox className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              No problem solvers found nearby
            </h2>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              We couldn't find an available verified solver within your specified distance radius for "
              <span className="font-semibold text-slate-800">{query}</span>".
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-left text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800">What happens next?</div>
              <p>
                You can post this as an <strong>Unmet Community Requirement</strong>. Verified problem solvers in your locality will be notified and can offer their solutions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsRequirementModalOpen(true)}
                leftIcon={<Send className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-sm"
              >
                Post Community Requirement
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={() => setFilters({ maxDistanceKm: 50, sortBy: 'BEST_MATCH' })}
                className="w-full sm:w-auto"
              >
                Expand Distance to 50 km
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet */}
      <FilterSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(newFilters)}
        categories={categories}
      />

      {/* Post Requirement Modal */}
      <Modal
        isOpen={isRequirementModalOpen}
        onClose={() => setIsRequirementModalOpen(false)}
        title="Post Unmet Community Requirement"
      >
        {reqSuccess ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Requirement Posted!</h3>
            <p className="text-xs text-slate-500">
              Nearby verified problem solvers have been notified and will reach out with solutions.
            </p>
          </div>
        ) : (
          <form onSubmit={handlePostRequirement} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Requirement Title</label>
              <Input
                value={reqTitle}
                onChange={(e) => setReqTitle(e.target.value)}
                placeholder="e.g. Need urgent plumber for main pipeline leak"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
              <textarea
                value={reqDescription}
                onChange={(e) => setReqDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-brand-accent focus:border-brand-accent focus:outline-none"
                placeholder="Describe what needs to be solved, urgency, timing, and any specific tools required..."
                required
              />
            </div>
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl">
              📍 Location will be registered at your selected GPS coordinates (approximate distance matching only).
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsRequirementModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmittingReq}
                leftIcon={isSubmittingReq ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : undefined}
              >
                {isSubmittingReq ? 'Posting...' : 'Submit Requirement'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Service Request Creation Modal */}
      {requestingProvider && (
        <RequestModal
          isOpen={!!requestingProvider}
          onClose={() => setRequestingProvider(null)}
          provider={{
            id: requestingProvider.id,
            fullName: requestingProvider.fullName,
            startingPrice: requestingProvider.startingPrice,
            pricingUnit: requestingProvider.pricingUnit,
            serviceName: requestingProvider.serviceName,
          }}
          onSuccess={() => {
            setRequestingProvider(null);
            navigate('/requests');
          }}
        />
      )}
    </div>
  );
};
