/* =====================================================
   HistoryLog.tsx — Khu vực log lịch sử lượt
   ===================================================== */

import type { LogEntry } from '../types';

interface HistoryLogProps {
  log: LogEntry[];
}

export default function HistoryLog({ log }: HistoryLogProps) {
  if (log.length === 0) {
    return (
      <div className="text-slate-500 text-sm text-center p-4 italic">
        Chưa có lượt nào được ghi nhận.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar">
      {[...log].reverse().map((entry) => {
        const decisionLabel = entry.decision === 'steal' ? 'CƯỚP' : 'BỎ';
        const decisionColor = entry.decision === 'steal' ? 'text-[#ea2a33]' : 'text-emerald-400';

        return (
          <div
            key={`${entry.turnNumber}-${entry.valiId}`}
            className="flex items-center gap-3 p-2 rounded bg-white/5 text-xs border border-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-[#d4af37] font-bold w-14 shrink-0">
              Vali {String(entry.valiId).padStart(2, '0')}
            </span>
            <span className="text-slate-400 w-24 shrink-0 truncate">
              {entry.p1Name} → {entry.p2Name}
            </span>
            <span className={`${decisionColor} font-bold w-12 shrink-0`}>
              {decisionLabel}
            </span>
            <span className="text-slate-300 flex-1 truncate">
              {entry.description}
            </span>
            {entry.result && (
              <span className="text-white font-bold shrink-0 bg-slate-700 px-2 py-0.5 rounded">
                {entry.result}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
