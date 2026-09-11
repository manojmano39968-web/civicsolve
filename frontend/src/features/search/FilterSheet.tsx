import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button.tsx';
import { BottomSheet } from '../../components/ui/BottomSheet.tsx';
import { SearchFilters } from './types.ts';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApplyFilters: (filters: SearchFilters) => void;
  categories: { id: string; name: string }[];
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  categories,
}) => {
  const [localFilters, setLocalFilters] = React.useState<SearchFilters>(filters);

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const handleReset = () => {
    const cleared: SearchFilters = {
      categoryId: undefined,
      maxDistanceKm: 30,
      minRating: 0,
      onlyAvailable: false,
      onlyVerified: false,
      sortBy: 'BEST_MATCH',
    };
    setLocalFilters(cleared);
    onApplyFilters(cleared);
    onClose();
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filter Problem Solvers">
      <div className="space-y-6 pb-6">
        {/* Category */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Service Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setLocalFilters({ ...localFilters, categoryId: undefined })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                !localFilters.categoryId
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, categoryId: cat.id })}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  localFilters.categoryId === cat.id
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Max Distance Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Maximum Distance
            </label>
            <span className="text-xs font-bold text-brand-primary">
              Up to {localFilters.maxDistanceKm || 30} km
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={localFilters.maxDistanceKm || 30}
            onChange={(e) =>
              setLocalFilters({ ...localFilters, maxDistanceKm: Number(e.target.value) })
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>5 km (Local)</span>
            <span>25 km</span>
            <span>50 km (City-wide)</span>
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Minimum Rating
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Any Rating', val: 0 },
              { label: '4.0+ Stars', val: 4.0 },
              { label: '4.5+ Stars', val: 4.5 },
            ].map((opt) => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setLocalFilters({ ...localFilters, minRating: opt.val })}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  (localFilters.minRating || 0) === opt.val
                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {opt.val > 0 && <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Flags */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
              <div>
                <div className="text-sm font-semibold text-slate-800">Available Now Only</div>
                <div className="text-xs text-slate-500">Only show providers actively online</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={!!localFilters.onlyAvailable}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, onlyAvailable: e.target.checked })
              }
              className="w-4 h-4 rounded text-brand-primary accent-brand-primary"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer transition-colors">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-sm font-semibold text-slate-800">Verified Solvers Only</div>
                <div className="text-xs text-slate-500">Government/Skill attested providers</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={!!localFilters.onlyVerified}
              onChange={(e) =>
                setLocalFilters({ ...localFilters, onlyVerified: e.target.checked })
              }
              className="w-4 h-4 rounded text-brand-primary accent-brand-primary"
            />
          </label>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={handleReset} className="flex-1">
            Reset All
          </Button>
          <Button variant="primary" size="md" onClick={handleApply} className="flex-1 shadow-sm">
            Apply Filters
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
