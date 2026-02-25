/* =====================================================
   ScoreBoard.tsx — Bảng điểm người chơi
   ===================================================== */

import type { Player } from '../types';

interface ScoreBoardProps {
  players: Player[];
  p1Id: string | null;
  p2Id: string | null;
}

export default function ScoreBoard({ players, p1Id, p2Id }: ScoreBoardProps) {
  // Sort by score descending
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
      {sorted.map((player, idx) => {
        const isP1 = player.id === p1Id;
        const isP2 = player.id === p2Id;
        const roleTag = isP1 ? 'P1' : isP2 ? 'P2' : null;
        const borderColor = isP1
          ? 'border-[#ea2a33] bg-[#ea2a33]/5'
          : isP2
            ? 'border-[#d4af37] bg-[#d4af37]/5'
            : 'border-white/5 bg-white/5';

        return (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-3 rounded-lg border ${borderColor} transition-all`}
          >
            {/* Rank */}
            <span className="text-xs font-bold text-slate-500 w-4 text-center">{idx + 1}</span>

            {/* Name + Role Tag */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate">{player.name}</span>
                {roleTag && (
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      isP1 ? 'bg-[#ea2a33] text-white' : 'bg-[#d4af37] text-[#211111]'
                    }`}
                  >
                    {roleTag}
                  </span>
                )}
              </div>

              {/* Tokens & Perks */}
              <div className="flex items-center gap-2 mt-1">
                {/* Steal tokens */}
                <div className="flex gap-0.5">
                  {Array.from({ length: player.stealTokens }).map((_, i) => (
                    <span key={i} className="material-symbols-outlined text-[#ea2a33] text-xs">
                      stars
                    </span>
                  ))}
                </div>
                {/* Shield */}
                {player.shields > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-blue-400 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs">shield</span>
                    {player.shields}
                  </span>
                )}
                {/* Peek */}
                {player.peeks > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-purple-400 text-[10px] font-bold">
                    <span className="material-symbols-outlined text-xs">visibility</span>
                    {player.peeks}
                  </span>
                )}
                {/* Consecutive steals warning */}
                {player.consecutiveSteals > 0 && (
                  <span className="text-amber-400 text-[10px] font-bold">
                    ({player.consecutiveSteals}/2 cướp liên tiếp)
                  </span>
                )}
              </div>
            </div>

            {/* Score */}
            <div
              className={`px-3 py-1 rounded text-xl font-black ${
                isP1 ? 'bg-[#ea2a33] text-white' : isP2 ? 'bg-[#d4af37] text-[#211111]' : 'bg-slate-700 text-white'
              }`}
            >
              {player.score}
            </div>
          </div>
        );
      })}
    </div>
  );
}
