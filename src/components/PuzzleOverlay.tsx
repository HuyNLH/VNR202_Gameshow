/* =====================================================
   PuzzleOverlay.tsx — Trò chơi ghép hình 4×4
   Thử thách R1: Ghép 16 mảnh thành hình hoàn chỉnh
   trong 60 giây.
   ===================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChallengeVali, Player } from '../types';
import { sfxTimerTick, sfxTimeUp } from '../utils/sounds';

const GRID = 4;
const TOTAL = GRID * GRID;
const TIME_LIMIT = 60;
const IMAGE_SRC = '/puzzle-r1.jpg';

interface PuzzleOverlayProps {
  vali: ChallengeVali;
  holder: Player | null;
  starActive: boolean;
  onChallengeResult: (success: boolean) => void;
}

/** Generate a solvable shuffle (even number of inversions) */
function generateSolvableShuffle(): number[] {
  const arr = Array.from({ length: TOTAL }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Check inversions — if odd, swap first two to make even (solvable)
  let inversions = 0;
  for (let i = 0; i < TOTAL; i++) {
    for (let j = i + 1; j < TOTAL; j++) {
      if (arr[i] > arr[j]) inversions++;
    }
  }
  if (inversions % 2 !== 0 && TOTAL > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  // Make sure it's not already solved
  const isSolved = arr.every((v, i) => v === i);
  if (isSolved && TOTAL > 1) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export default function PuzzleOverlay({
  vali,
  holder,
  starActive,
  onChallengeResult,
}: PuzzleOverlayProps) {
  const [pieces, setPieces] = useState<number[]>(() => generateSolvableShuffle());
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(TIME_LIMIT);
  const [finished, setFinished] = useState<'success' | 'fail' | null>(null);
  const [showPreview, setShowPreview] = useState(true); // Show full image first
  const [moves, setMoves] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const calledRef = useRef(false);

  // Check if puzzle is solved
  const isSolved = pieces.every((v, i) => v === i);

  // Show preview for 3 seconds, then start puzzle
  useEffect(() => {
    if (showPreview) {
      const t = setTimeout(() => setShowPreview(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showPreview]);

  // Timer — only run after preview ends
  useEffect(() => {
    if (showPreview || finished) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          sfxTimeUp();
          setFinished('fail');
          return 0;
        }
        if (s <= 6) sfxTimerTick();
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showPreview, finished]);

  // Check win after each move
  useEffect(() => {
    if (!showPreview && isSolved && !finished) {
      setFinished('success');
    }
  }, [pieces, showPreview, isSolved, finished]);

  // Handle piece click — swap
  const handlePieceClick = useCallback(
    (index: number) => {
      if (finished || showPreview) return;
      if (selected === null) {
        setSelected(index);
      } else {
        if (selected === index) {
          setSelected(null);
          return;
        }
        setPieces((prev) => {
          const next = [...prev];
          [next[selected], next[index]] = [next[index], next[selected]];
          return next;
        });
        setMoves((m) => m + 1);
        setSelected(null);
      }
    },
    [selected, finished, showPreview]
  );

  // Auto submit result after a short delay
  useEffect(() => {
    if (finished && !calledRef.current) {
      const t = setTimeout(() => {
        if (!calledRef.current) {
          calledRef.current = true;
          onChallengeResult(finished === 'success');
        }
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [finished, onChallengeResult]);

  const timerColor =
    seconds <= 10 ? 'text-red-400' : seconds <= 20 ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in">
      <div className="relative w-[95vw] max-w-3xl max-h-[95vh] flex flex-col bg-gradient-to-br from-[#1a0a0a] via-[#211111] to-[#1a0808] rounded-2xl border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden">

        {/* ─── Top Bar ──────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-amber-500 text-white text-sm font-black tracking-widest uppercase">
              THỬ THÁCH
            </span>
            <span className="text-white font-bold text-lg">Ghép hình 4×4</span>
          </div>

          {/* Timer */}
          {!showPreview && !finished && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-xl text-amber-400">timer</span>
              <span className={`text-3xl font-black tabular-nums ${timerColor} ${seconds <= 10 ? 'animate-pulse' : ''}`}>
                {seconds}s
              </span>
            </div>
          )}

          {showPreview && (
            <span className="text-amber-400 text-sm font-bold animate-pulse">
              Ghi nhớ hình trong 3 giây...
            </span>
          )}

          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Người chơi</p>
            <p className="text-white font-bold text-sm">{holder?.name || '—'}</p>
          </div>
        </div>

        {/* ─── Info Bar ─────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-2 bg-white/[0.02] border-b border-white/5 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Thành công: <span className="text-emerald-400 font-bold">+{starActive ? vali.successPoints * 2 : vali.successPoints}</span>
            </span>
            <span className="text-slate-400">
              Thất bại: <span className="text-red-400 font-bold">{starActive ? vali.failPoints * 2 : vali.failPoints}</span>
            </span>
            {starActive && <span className="text-amber-400 font-bold">⭐ ×2</span>}
          </div>
          <span className="text-slate-400">
            Số nước đi: <span className="text-white font-bold">{moves}</span>
          </span>
        </div>

        {/* ─── Puzzle Area ──────────────────────────── */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          {/* Preview: show full image */}
          {showPreview ? (
            <div className="relative">
              <img
                src={IMAGE_SRC}
                alt="Hình gốc"
                className="max-w-full max-h-[55vh] rounded-xl border-4 border-amber-500/50 shadow-lg"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                <span className="text-white text-4xl font-black bg-black/60 px-6 py-3 rounded-xl backdrop-blur-sm">
                  GHI NHỚ!
                </span>
              </div>
            </div>
          ) : (
            <div className="relative">
              {/* Puzzle grid */}
              <div
                className="grid gap-1 rounded-xl overflow-hidden border-2 border-white/20 bg-black/50"
                style={{
                  gridTemplateColumns: `repeat(${GRID}, 1fr)`,
                  width: 'min(55vh, 480px)',
                  height: 'min(55vh, 480px)',
                }}
              >
                {pieces.map((pieceIndex, position) => {
                  const row = Math.floor(pieceIndex / GRID);
                  const col = pieceIndex % GRID;
                  const isSelected = selected === position;
                  const isCorrect = pieceIndex === position;

                  return (
                    <button
                      key={position}
                      className={`relative overflow-hidden transition-all duration-150 ${
                        isSelected
                          ? 'ring-4 ring-amber-400 scale-95 z-10'
                          : finished === 'success'
                            ? ''
                            : 'hover:ring-2 hover:ring-white/40 hover:scale-[0.97] active:scale-90'
                      } ${isCorrect && !finished ? 'ring-1 ring-emerald-500/30' : ''}`}
                      onClick={() => handlePieceClick(position)}
                      disabled={!!finished}
                      style={{
                        backgroundImage: `url(${IMAGE_SRC})`,
                        backgroundSize: `${GRID * 100}% ${GRID * 100}%`,
                        backgroundPosition: `${(col / (GRID - 1)) * 100}% ${(row / (GRID - 1)) * 100}%`,
                      }}
                    >
                      {/* Piece number overlay (subtle) */}
                      {!finished && (
                        <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {pieceIndex + 1}
                        </span>
                      )}
                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-amber-400 text-3xl drop-shadow-lg">swap_horiz</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Result overlay */}
              {finished && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl ${
                  finished === 'success' ? 'bg-emerald-900/80' : 'bg-red-900/80'
                } backdrop-blur-sm animate-in`}>
                  <span className="material-symbols-outlined text-7xl mb-3" style={{
                    color: finished === 'success' ? '#34d399' : '#f87171'
                  }}>
                    {finished === 'success' ? 'emoji_events' : 'timer_off'}
                  </span>
                  <h3 className="text-3xl font-black text-white mb-1">
                    {finished === 'success' ? 'HOÀN THÀNH!' : 'HẾT GIỜ!'}
                  </h3>
                  <p className="text-lg text-white/80">
                    {finished === 'success'
                      ? `+${starActive ? vali.successPoints * 2 : vali.successPoints} điểm • ${moves} nước • ${TIME_LIMIT - seconds}s${starActive ? ' ⭐' : ''}`
                      : `${starActive ? vali.failPoints * 2 : vali.failPoints} điểm${starActive ? ' ⭐' : ''}`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Bottom hint ──────────────────────────── */}
        {!showPreview && !finished && (
          <div className="shrink-0 px-6 py-3 border-t border-white/10 bg-black/30 text-center">
            <p className="text-slate-400 text-sm">
              <span className="text-amber-400 font-bold">Bấm 2 mảnh</span> để hoán đổi vị trí •
              Mảnh viền <span className="text-emerald-400">xanh</span> = đúng chỗ
            </p>
          </div>
        )}

        {/* Manual override for host */}
        {!finished && !showPreview && (
          <div className="shrink-0 px-6 py-3 border-t border-white/5 flex justify-center gap-3">
            <button
              className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
              onClick={() => { if (!calledRef.current) { calledRef.current = true; setFinished('success'); onChallengeResult(true); } }}
            >
              <span className="material-symbols-outlined text-sm">check</span>
              Quản trò: Thành công
            </button>
            <span className="text-slate-700">|</span>
            <button
              className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
              onClick={() => { if (!calledRef.current) { calledRef.current = true; setFinished('fail'); onChallengeResult(false); } }}
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Quản trò: Thất bại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
