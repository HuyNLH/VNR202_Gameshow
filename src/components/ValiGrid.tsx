/* =====================================================
   ValiGrid.tsx — 4x5 grid of 20 vali cards
   ===================================================== */

import type { Vali } from '../types';

interface ValiGridProps {
  valis: Vali[];
  selectedValiId: number | null;
  onSelectVali: (id: number) => void;
  disabled: boolean;
}

export default function ValiGrid({ valis, selectedValiId, onSelectVali, disabled }: ValiGridProps) {
  return (
    <div className="grid grid-cols-5 gap-3 h-full">
      {valis.map((vali) => {
        const isSelected = vali.id === selectedValiId;
        const isRevealed = vali.status === 'revealed';
        const isPending = vali.status === 'pending';
        const isHidden = vali.status === 'hidden';

        // Determine card style based on status
        let cardClass = '';
        let iconName = 'folder';
        let numberColor = 'text-[#472426]';

        if (isSelected || isPending) {
          // Selected / Pending state
          cardClass =
            'bg-gradient-to-br from-[#d4af37]/20 to-[#472426] border-4 border-[#ea2a33] shadow-[0_0_20px_rgba(234,42,51,0.3)] transform scale-105';
          iconName = 'folder_special';
          numberColor = 'text-white';
        } else if (isRevealed) {
          // Opened state
          cardClass =
            'bg-[#211111]/40 border border-dashed border-[#472426] opacity-40 grayscale cursor-default';
          iconName = 'drafts';
          numberColor = 'text-slate-500';
        } else {
          // Default hidden
          cardClass =
            'bg-gradient-to-br from-[#f5e6d3] to-[#d4c4a8] border border-[#472426]/30 hover:border-[#d4af37] hover:shadow-lg cursor-pointer';
          numberColor = 'text-[#472426]';
        }

        return (
          <div
            key={vali.id}
            className={`group relative rounded-xl flex flex-col items-center justify-center transition-all min-h-[90px] ${cardClass} ${
              disabled || isRevealed ? 'pointer-events-none' : ''
            }`}
            onClick={() => {
              if (!disabled && isHidden) onSelectVali(vali.id);
            }}
          >
            {/* Pending badge */}
            {(isSelected || isPending) && (
              <div className="absolute -top-3 bg-[#ea2a33] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase z-10">
                Đang chọn
              </div>
            )}

            <span
              className={`material-symbols-outlined text-4xl md:text-5xl mb-1 ${
                isSelected || isPending
                  ? 'text-[#d4af37]'
                  : isRevealed
                    ? 'text-slate-500'
                    : 'text-[#472426]/60 group-hover:text-[#472426]'
              } transition-colors`}
            >
              {iconName}
            </span>
            <span className={`text-xl md:text-2xl font-bold ${numberColor}`}>
              {String(vali.id).padStart(2, '0')}
            </span>

            {/* Revealed checkmark */}
            {isRevealed && (
              <div className="absolute top-1 right-1">
                <span className="material-symbols-outlined text-slate-500 text-sm">check_circle</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
