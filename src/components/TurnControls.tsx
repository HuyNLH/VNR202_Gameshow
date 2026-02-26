/* =====================================================
   TurnControls.tsx — Khu vực điều khiển lượt
   (dropdown P1/P2, buttons: Cướp, Bỏ, Reveal, Undo, Lượt mới)
   ===================================================== */

import type { Player, TurnPhase } from '../types';

interface TurnControlsProps {
  players: Player[];
  p1Id: string | null;
  p2Id: string | null;
  phase: TurnPhase;
  selectedValiId: number | null;
  starActive: boolean;
  onSetP1: (id: string) => void;
  onSetP2: (id: string) => void;
  onActivateStar: () => { ok: boolean; reason?: string };
  onDecision: (decision: 'steal' | 'pass') => { ok: boolean; reason?: string };
  onReveal: () => { ok: boolean; reason?: string };
  onUndo: () => void;
  onNextTurn: () => void;
  onEndGame: () => void;
  canUndoFlag: boolean;
}

export default function TurnControls({
  players,
  p1Id,
  p2Id,
  phase,
  selectedValiId,
  starActive,
  onSetP1,
  onSetP2,
  onActivateStar,
  onDecision,
  onReveal,
  onUndo,
  onNextTurn,
  onEndGame,
  canUndoFlag,
}: TurnControlsProps) {
  const handleSteal = () => {
    const res = onDecision('steal');
    if (!res.ok && res.reason) alert(res.reason);
  };

  const handlePass = () => {
    const res = onDecision('pass');
    if (!res.ok && res.reason) alert(res.reason);
  };

  const handleStarClick = () => {
    const res = onActivateStar();
    if (!res.ok && res.reason) alert(res.reason);
  };

  const handleRevealClick = () => {
    const res = onReveal();
    if (!res.ok && res.reason) alert(res.reason);
  };

  const isIdle = phase === 'idle';
  const isPendingDecision = phase === 'pendingDecision';
  const isPendingReveal = phase === 'pendingReveal';
  const isResolved = phase === 'resolved';

  return (
    <div className="space-y-4">
      {/* Player Dropdowns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">
            Người chơi 1 (P1)
          </label>
          <select
            className="w-full bg-[#211111]/80 border border-[#ea2a33]/30 rounded-lg py-2 px-3 text-sm text-white focus:border-[#ea2a33] focus:outline-none"
            value={p1Id || ''}
            onChange={(e) => onSetP1(e.target.value)}
            disabled={!isIdle}
          >
            <option value="">-- Chọn P1 --</option>
            {players.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === p2Id}>
                {p.name} ({p.score} đ)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1 block">
            Người chơi 2 (P2)
          </label>
          <select
            className="w-full bg-[#211111]/80 border border-[#d4af37]/30 rounded-lg py-2 px-3 text-sm text-white focus:border-[#d4af37] focus:outline-none"
            value={p2Id || ''}
            onChange={(e) => onSetP2(e.target.value)}
            disabled={!isIdle}
          >
            <option value="">-- Chọn P2 --</option>
            {players.map((p) => (
              <option key={p.id} value={p.id} disabled={p.id === p1Id}>
                {p.name} ({p.score} đ)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Star Active Indicator */}
      {starActive && (
        <div className="flex items-center gap-2 bg-amber-500/20 px-4 py-2 rounded-lg border border-amber-500/50 animate-pulse">
          <span className="text-xl">⭐</span>
          <p className="text-amber-400 text-xs font-black uppercase tracking-wider">
            Ngôi sao hi vọng — Nhân đôi điểm lượt này!
          </p>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center gap-2 bg-[#472426]/20 px-4 py-2 rounded-lg border border-[#472426]/40">
        <span className="material-symbols-outlined text-[#d4af37] text-sm">info</span>
        <p className="text-slate-300 text-xs">
          {phase === 'idle' && 'Chọn P1, P2 rồi bấm vào vali trên bảng.'}
          {phase === 'pendingDecision' && (
            <>Vali <span className="text-white font-bold">{String(selectedValiId).padStart(2, '0')}</span> đã chọn. P2 chọn <span className="text-[#ea2a33] font-bold">Cướp</span> hoặc <span className="text-emerald-400 font-bold">Bỏ</span>.</>
          )}
          {phase === 'pendingReveal' && 'Đã chốt! Bấm REVEAL để mở vali.'}
          {(phase === 'resolvingQuestion' || phase === 'resolvingChallenge') && 'Đang xử lý nội dung vali...'}
          {phase === 'resolved' && 'Lượt hoàn thành. Bấm Lượt mới.'}
          {phase === 'finished' && 'Đã mở hết 20 vali! Game kết thúc.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Star — only show when idle, P1 selected, P1 has stars, star not yet active */}
        {isIdle && p1Id && !starActive && (() => {
          const p1 = players.find((p) => p.id === p1Id);
          return p1 && p1.stars > 0;
        })() && (
          <button
            className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/40 text-amber-400 border border-amber-500/50 px-4 py-2.5 rounded-lg font-black text-sm transition-all hover:scale-105 active:scale-95"
            onClick={handleStarClick}
          >
            <span className="text-lg">⭐</span>
            DÙNG SAO
          </button>
        )}

        {/* Steal */}
        <button
          className="flex items-center gap-2 bg-[#ea2a33]/20 hover:bg-[#ea2a33]/40 text-[#ea2a33] border border-[#ea2a33]/50 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={handleSteal}
          disabled={!isPendingDecision}
        >
          <span className="material-symbols-outlined text-lg">security_update_warning</span>
          CƯỚP
        </button>

        {/* Pass */}
        <button
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={handlePass}
          disabled={!isPendingDecision}
        >
          <span className="material-symbols-outlined text-lg">cancel</span>
          BỎ
        </button>

        {/* Reveal — nổi bật */}
        <button
          className="flex items-center gap-2 bg-gradient-to-b from-[#d4af37] to-[#b8860b] text-[#211111] px-6 py-2.5 rounded-lg font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={handleRevealClick}
          disabled={!isPendingReveal}
        >
          <span className="material-symbols-outlined text-lg">visibility</span>
          REVEAL
        </button>

        {/* Next Turn */}
        {isResolved && (
          <button
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition-colors"
            onClick={onNextTurn}
          >
            <span className="material-symbols-outlined text-lg">skip_next</span>
            LƯỢT MỚI
          </button>
        )}

        {/* Undo */}
        <button
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={onUndo}
          disabled={!canUndoFlag}
        >
          <span className="material-symbols-outlined text-lg">undo</span>
          UNDO
        </button>

        {/* End Game (manual) */}
        <button
          className="ml-auto flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-2.5 rounded-lg font-bold text-xs transition-colors"
          onClick={onEndGame}
        >
          <span className="material-symbols-outlined text-lg">stop_circle</span>
          KẾT THÚC
        </button>
      </div>
    </div>
  );
}
