import React from 'react';
import { HelpCircle, ChevronRight, Sparkles } from 'lucide-react';

interface ClarificationPromptProps {
  prompt: string;
  options: {
    serviceId: string;
    name: string;
    category: string;
  }[];
  onSelectOption: (option: { serviceId: string; name: string; category: string }) => void;
}

export const ClarificationPrompt: React.FC<ClarificationPromptProps> = ({
  prompt,
  options,
  onSelectOption,
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
          <HelpCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Quick Clarification
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-snug">
            {prompt}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Please pick one of the options below so we can match you with the exact right specialist:
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
        {options.map((opt) => (
          <button
            key={opt.serviceId}
            onClick={() => onSelectOption(opt)}
            className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md hover:bg-amber-50/50 transition-all text-left group"
          >
            <div>
              <div className="text-sm font-bold text-slate-800 group-hover:text-amber-700 transition-colors">
                {opt.name}
              </div>
              <div className="text-xs text-slate-500">
                {opt.category}
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
