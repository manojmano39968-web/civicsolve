import React, { useState } from 'react';
import { Search, MapPin, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';

interface SearchBarProps {
  initialQuery?: string;
  initialLat?: number;
  initialLng?: number;
  onSearch: (query: string, lat?: number, lng?: number) => void;
  isLoading?: boolean;
}

const POPULAR_CHIPS = [
  'Tap leaking in bathroom',
  'Need a painter for house wall',
  'Laptop screen broken',
  'Bike puncture repair',
  'Short circuit switchboard',
  'Mathematics tutor for calculus',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  initialQuery = '',
  initialLat,
  initialLng,
  onSearch,
  isLoading = false,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({
    lat: initialLat,
    lng: initialLng,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>(
    initialLat && initialLng ? 'Location enabled' : 'Detect location'
  );

  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationLabel('Near your location');
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or failed, using city center fallback:', err);
        // Fallback default: Bengaluru center
        setCoords({ lat: 12.9716, lng: 77.5946 });
        setLocationLabel('Bengaluru (Default)');
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim(), coords.lat, coords.lng);
  };

  const handleChipClick = (chip: string) => {
    setQuery(chip);
    onSearch(chip, coords.lat, coords.lng);
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl shadow-lg border border-slate-200/80 p-2 sm:p-2.5 transition-all focus-within:border-brand-accent focus-within:ring-4 focus-within:ring-brand-accent/15"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Input field */}
          <div className="flex items-center flex-1 px-3 py-1.5 gap-2.5">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your problem in plain words (e.g. 'tap is leaking in kitchen')..."
              className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none focus:ring-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location button */}
          <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-2 sm:pt-0 sm:pl-2">
            <button
              type="button"
              onClick={handleLocate}
              disabled={isLocating}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                coords.lat
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
              title="Use current GPS location for strict radius distance matching"
            >
              {isLocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-primary" />
              ) : (
                <MapPin
                  className={`w-3.5 h-3.5 ${
                    coords.lat ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'
                  }`}
                />
              )}
              <span className="truncate max-w-[130px]">{locationLabel}</span>
            </button>

            {/* Search CTA */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isLoading || !query.trim()}
              className="px-5 shadow-sm"
              leftIcon={
                isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )
              }
            >
              Solve
            </Button>
          </div>
        </div>
      </form>

      {/* Suggested Quick Queries */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 no-scrollbar text-xs text-slate-500">
        <span className="font-semibold text-slate-400 shrink-0">Try:</span>
        {POPULAR_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-accent-light hover:text-brand-accent-dark text-slate-600 font-medium transition-colors border border-slate-200/60"
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
};
