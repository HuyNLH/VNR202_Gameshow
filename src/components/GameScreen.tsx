/* =====================================================
   GameScreen.tsx — Màn hình chơi chính (1 screen chiếu)
   Layout: No left sidebar, optimized for classroom projection
   ===================================================== */

import type { GameState, StealDecision, QuestionVali, ChallengeVali } from '../types';
import ValiGrid from './ValiGrid';
import ScoreBoard from './ScoreBoard';
import TurnControls from './TurnControls';
import RevealPanel from './RevealPanel';
import QuestionOverlay from './QuestionOverlay';
import PuzzleOverlay from './PuzzleOverlay';
import HistoryLog from './HistoryLog';

interface GameScreenProps {
  state: GameState;
  onSelectVali: (id: number) => { ok: boolean; reason?: string };
  onSetP1: (id: string) => void;
  onSetP2: (id: string) => void;
  onDecision: (d: StealDecision) => { ok: boolean; reason?: string };
  onReveal: () => { ok: boolean; reason?: string };
  onQuestionResult: (correct: boolean) => void;
  onPenaltyShield: (useShield: boolean) => void;
  onChallengeResult: (success: boolean) => void;
  onNextTurn: () => void;
  onUndo: () => void;
  onEndGame: () => void;
}

export default function GameScreen({
  state,
  onSelectVali,
  onSetP1,
  onSetP2,
  onDecision,
  onReveal,
  onQuestionResult,
  onPenaltyShield,
  onChallengeResult,
  onNextTurn,
  onUndo,
  onEndGame,
}: GameScreenProps) {
  const { players, valis, turn, turnNumber, log } = state;

  const selectedVali = turn.selectedValiId
    ? valis.find((v) => v.id === turn.selectedValiId) || null
    : null;

  const holder = turn.holderId
    ? players.find((p) => p.id === turn.holderId) || null
    : null;

  // Count revealed valis
  const revealedCount = valis.filter((v) => v.status === 'revealed').length;

  // Phase label
  const phaseLabels: Record<string, string> = {
    idle: 'ĐANG CHỜ CHỌN VALI',
    pendingDecision: 'CHỜ QUYẾT ĐỊNH CƯỚP/BỎ',
    pendingReveal: 'CHỜ REVEAL',
    resolvingQuestion: 'ĐANG XỬ LÝ CÂU HỎI',
    resolvingChallenge: 'ĐANG XỬ LÝ THỬ THÁCH',
    resolved: 'ĐÃ HOÀN THÀNH LƯỢT',
    finished: 'GAME KẾT THÚC',
  };

  // Can undo?
  const canUndoFlag = state.undoStack.length > 0;

  // Disable vali clicking in non-idle phases
  const gridDisabled = turn.phase !== 'idle';

  const handleValiClick = (id: number) => {
    const res = onSelectVali(id);
    if (!res.ok && res.reason) {
      alert(res.reason);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#211111]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-[#472426] bg-[#211111]/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#ea2a33] p-1.5 rounded-lg">
            <span className="material-symbols-outlined text-white text-2xl">account_balance</span>
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase tracking-wider text-white">
              Cướp hay Bỏ Vali – <span className="text-[#ea2a33]">Lịch sử Đảng</span>
            </h1>
            <p className="text-[#ea2a33] text-xs font-semibold">
              Lượt {turnNumber} • Đã mở {revealedCount}/20 vali
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-slate-400 text-[10px] uppercase tracking-widest">Trạng thái</p>
            <p className="text-[#d4af37] font-bold text-sm">{phaseLabels[turn.phase] || turn.phase}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Left: Scoreboard + Controls */}
        <aside className="w-[300px] shrink-0 flex flex-col gap-3 overflow-hidden">
          {/* Scoreboard */}
          <div className="bg-[#472426]/20 border border-[#472426] rounded-xl p-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 border-b border-[#472426] pb-2 mb-2 shrink-0">
              <span className="material-symbols-outlined text-[#ea2a33] text-xl">leaderboard</span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-white">Bảng điểm</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ScoreBoard
                players={players}
                p1Id={turn.p1Id}
                p2Id={turn.p2Id}
              />
            </div>
          </div>

          {/* Turn Controls */}
          <div className="bg-[#472426]/20 border border-[#472426] rounded-xl p-3 shrink-0">
            <div className="flex items-center gap-2 border-b border-[#472426] pb-2 mb-2">
              <span className="material-symbols-outlined text-[#ea2a33] text-xl">sports_esports</span>
              <h2 className="text-sm font-bold uppercase tracking-wide text-white">Điều khiển</h2>
            </div>
            <TurnControls
              players={players}
              p1Id={turn.p1Id}
              p2Id={turn.p2Id}
              phase={turn.phase}
              selectedValiId={turn.selectedValiId}
              onSetP1={onSetP1}
              onSetP2={onSetP2}
              onDecision={onDecision}
              onReveal={onReveal}
              onUndo={onUndo}
              onNextTurn={onNextTurn}
              onEndGame={onEndGame}
              canUndoFlag={canUndoFlag}
            />
          </div>
        </aside>

        {/* Center: Vali Grid + Reveal */}
        <section className="flex-1 flex flex-col gap-3 overflow-hidden">
          {/* Vali Grid */}
          <div className="flex-1 min-h-0">
            <ValiGrid
              valis={valis}
              selectedValiId={turn.selectedValiId}
              onSelectVali={handleValiClick}
              disabled={gridDisabled}
            />
          </div>

          {/* Reveal Panel (below grid) — shows for NON-question & NON-puzzle vali types & pre-reveal states */}
          {turn.selectedValiId && turn.phase !== 'resolvingQuestion' && !(selectedVali?.type === 'challenge' && turn.phase === 'resolvingChallenge' && (selectedVali as ChallengeVali).code === 'R1') && (
            <div className="shrink-0">
              <RevealPanel
                vali={selectedVali}
                phase={turn.phase}
                holder={holder}
                decision={turn.decision}
                shieldPromptActive={turn.shieldPromptActive}
                onQuestionResult={onQuestionResult}
                onChallengeResult={onChallengeResult}
                onPenaltyShield={onPenaltyShield}
              />
            </div>
          )}
        </section>
      </main>

      {/* Question Overlay — full-screen when resolving a question */}
      {selectedVali && selectedVali.type === 'question' && turn.phase === 'resolvingQuestion' && (
        <QuestionOverlay
          vali={selectedVali as QuestionVali}
          holder={holder}
          decision={turn.decision}
          onQuestionResult={onQuestionResult}
        />
      )}

      {/* Puzzle Overlay — full-screen for challenge R1 (ghép hình) */}
      {selectedVali && selectedVali.type === 'challenge' && turn.phase === 'resolvingChallenge' && (selectedVali as ChallengeVali).code === 'R1' && (
        <PuzzleOverlay
          vali={selectedVali as ChallengeVali}
          holder={holder}
          onChallengeResult={onChallengeResult}
        />
      )}

      {/* Bottom: History Log as scrolling ticker */}
      <footer className="bg-[#211111] border-t border-[#472426] shrink-0">
        <div className="px-4 py-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#ea2a33] text-sm">history</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Lịch sử lượt</span>
          </div>
          <HistoryLog log={log} />
        </div>
      </footer>
    </div>
  );
}
