/* =====================================================
   R2TimedHintsOverlay.tsx — Thử thách R2: Gợi ý dần
   5 gợi ý xuất hiện dần trong 30 giây.
   Người chơi nhập đáp án & bấm CHỐT bất kỳ lúc nào.
   Hết giờ → quản trò bấm HIỆN ĐÁP ÁN.
   ===================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChallengeVali, Player } from '../types';

/* ─── Config ─────────────────────────────────────── */
const DURATION_SEC = 40;

const HINTS: { text: string; revealAtRemainingSec: number }[] = [
  { text: 'Một hình thức tập hợp lực lượng', revealAtRemainingSec: 40 },
  { text: 'Xuất hiện đầu thập kỷ 40', revealAtRemainingSec: 34 },
  { text: 'Mục tiêu trọng tâm: độc lập dân tộc', revealAtRemainingSec: 28 },
  { text: "Tên gọi có 2 từ, từ đầu liên quan 'Việt'", revealAtRemainingSec: 22 },
  { text: 'Hay được nhắc cùng giai đoạn chuẩn bị tổng khởi nghĩa', revealAtRemainingSec: 16 },
];

const OFFICIAL_ANSWER = 'MẶT TRẬN VIỆT MINH';

const ACCEPTED_NORMALIZED: string[] = [
  'mat tran viet minh',
  'viet minh',
];

const POINTS_SUCCESS = 15;
const POINTS_FAIL = -10;

/* ─── Vietnamese diacritics removal ──────────────── */
function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function normalizeAnswer(raw: string): string {
  let s = raw.trim().toLowerCase();
  s = removeDiacritics(s);
  s = s.replace(/[–\-/.,;:!?()[\]{}'"]/g, ' ');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/* ─── State machine ──────────────────────────────── */
type Phase = 'running' | 'submitted' | 'timeUp' | 'revealed';

/* ─── Props ──────────────────────────────────────── */
interface R2TimedHintsOverlayProps {
  vali: ChallengeVali;
  holder: Player | null;
  starActive: boolean;
  onChallengeResult: (success: boolean) => void;
}

/* ═══════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════ */
export default function R2TimedHintsOverlay({
  vali,
  holder,
  starActive,
  onChallengeResult,
}: R2TimedHintsOverlayProps) {
  const multiplier = starActive ? 2 : 1;

  const [seconds, setSeconds] = useState(DURATION_SEC);
  const [phase, setPhase] = useState<Phase>('running');
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Which hints are visible
  const visibleHintCount = HINTS.filter((h) => seconds <= DURATION_SEC - (DURATION_SEC - h.revealAtRemainingSec)).length;
  // simpler: hint is visible if remaining seconds <= hint.revealAtRemainingSec
  const isHintVisible = (idx: number) => seconds <= HINTS[idx].revealAtRemainingSec;

  // Timer
  useEffect(() => {
    if (phase === 'revealed') return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // Time up detection
  useEffect(() => {
    if (seconds === 0 && phase !== 'revealed') {
      if (phase === 'running') {
        setPhase('timeUp');
      } else if (phase === 'submitted') {
        setPhase('timeUp');
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [seconds, phase]);

  // Submit answer
  const handleSubmit = useCallback(() => {
    if (phase !== 'running') return;
    const normalized = normalizeAnswer(userAnswer);
    const correct = ACCEPTED_NORMALIZED.includes(normalized);
    setIsCorrect(correct);
    setPhase('submitted');
  }, [phase, userAnswer]);

  // Reveal answer (host button)
  const handleReveal = useCallback(() => {
    setPhase('revealed');
  }, []);

  // Close & send result to parent
  const handleClose = useCallback(() => {
    const submitted = phase === 'revealed' && isCorrect !== null;
    // If never submitted or wrong → fail
    const success = isCorrect === true;
    onChallengeResult(success);
  }, [phase, isCorrect, onChallengeResult]);

  // Host override buttons
  const handleHostOverride = useCallback((success: boolean) => {
    onChallengeResult(success);
  }, [onChallengeResult]);

  // Timer color
  const timerColor =
    seconds <= 6 ? 'text-red-400' : seconds <= 12 ? 'text-amber-400' : 'text-emerald-400';

  // Points display
  const successPts = POINTS_SUCCESS * multiplier;
  const failPts = POINTS_FAIL * multiplier;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in">
      <div className="relative w-[95vw] max-w-4xl max-h-[95vh] flex flex-col bg-gradient-to-br from-[#1a0a0a] via-[#211111] to-[#1a0808] rounded-2xl border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden">

        {/* ─── Top Bar ─────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-orange-500 text-white text-sm font-black tracking-widest uppercase">
              THỬ THÁCH R2
            </span>
            <span className="text-white font-bold text-lg">Đoán từ gợi ý</span>
            {starActive && <span className="text-2xl">⭐</span>}
          </div>

          {/* Timer */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-amber-400">timer</span>
            <span className={`text-4xl font-black tabular-nums ${timerColor} ${seconds <= 6 ? 'animate-pulse' : ''}`}>
              {String(seconds).padStart(2, '0')}s
            </span>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">Người chơi</p>
            <p className="text-white font-bold text-sm">{holder?.name || '—'}</p>
          </div>
        </div>

        {/* ─── Points Bar ──────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between px-6 py-2 bg-white/[0.02] border-b border-white/5 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Đúng: <span className="text-emerald-400 font-bold">+{successPts}</span>
            </span>
            <span className="text-slate-400">
              Sai / Không trả lời: <span className="text-red-400 font-bold">{failPts}</span>
            </span>
            {starActive && <span className="text-amber-400 font-bold">⭐ ×2</span>}
          </div>
        </div>

        {/* ─── Hints Area ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {HINTS.map((hint, idx) => {
            const visible = isHintVisible(idx);
            const nextRevealIn = visible ? 0 : HINTS[idx].revealAtRemainingSec - (DURATION_SEC - seconds);
            // time until this hint reveals = revealAtRemainingSec - (DURATION_SEC - seconds) doesn't work
            // remaining seconds when hint shows = revealAtRemainingSec
            // current remaining = seconds
            // hint shows when seconds <= revealAtRemainingSec → wait = seconds - revealAtRemainingSec
            const waitSec = visible ? 0 : seconds - HINTS[idx].revealAtRemainingSec;

            return (
              <div
                key={idx}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all duration-500 ${
                  visible
                    ? 'bg-white/[0.06] border-amber-500/30 shadow-lg shadow-amber-500/5'
                    : 'bg-white/[0.02] border-white/5 opacity-40'
                }`}
              >
                {/* Number badge */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black ${
                    visible
                      ? 'bg-amber-500 text-white'
                      : 'bg-white/10 text-slate-500'
                  }`}
                >
                  {visible ? idx + 1 : '🔒'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {visible ? (
                    <p className="text-white text-lg font-bold leading-relaxed animate-in">
                      {hint.text}
                    </p>
                  ) : (
                    <p className="text-slate-500 text-sm italic">
                      Gợi ý sẽ mở sau <span className="text-amber-400 font-bold">{waitSec}</span> giây...
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── Answer Input Area ───────────────────── */}
        <div className="shrink-0 border-t border-white/10 bg-black/40 p-5 space-y-4">
          {/* Input + Submit */}
          {phase !== 'revealed' && (
            <div className="flex gap-3 max-w-3xl mx-auto">
              <input
                ref={inputRef}
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && phase === 'running') handleSubmit();
                }}
                disabled={phase !== 'running'}
                placeholder={
                  phase === 'running'
                    ? 'Nhập đáp án tại đây...'
                    : phase === 'submitted'
                      ? '✅ Đã chốt đáp án'
                      : '⏱ Hết giờ'
                }
                className={`flex-1 px-5 py-4 rounded-xl text-lg font-bold border-2 bg-[#211111]/80 outline-none transition-all ${
                  phase === 'running'
                    ? 'border-amber-500/40 text-white placeholder-slate-500 focus:border-amber-400'
                    : phase === 'submitted'
                      ? 'border-blue-500/40 text-blue-300 cursor-not-allowed'
                      : 'border-red-500/30 text-slate-500 cursor-not-allowed'
                }`}
              />
              <button
                onClick={handleSubmit}
                disabled={phase !== 'running' || userAnswer.trim() === ''}
                className="px-8 py-4 rounded-xl font-black text-lg uppercase tracking-wider bg-gradient-to-b from-amber-500 to-amber-700 text-white shadow-lg shadow-amber-500/20 transition-all active:scale-95 hover:from-amber-400 hover:to-amber-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:from-amber-500 disabled:active:scale-100"
              >
                CHỐT
              </button>
            </div>
          )}

          {/* Submitted badge */}
          {(phase === 'submitted' || (phase === 'timeUp' && isCorrect !== null)) && (
            <div className="flex items-center justify-center gap-2 bg-blue-500/15 py-3 rounded-xl border border-blue-500/30 max-w-3xl mx-auto">
              <span className="material-symbols-outlined text-blue-400">lock</span>
              <p className="text-blue-400 text-sm font-bold">
                Đã chốt: <span className="text-white">{userAnswer}</span>
              </p>
            </div>
          )}

          {/* Time Up: show HIỆN ĐÁP ÁN button */}
          {phase === 'timeUp' && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-red-400">
                <span className="material-symbols-outlined text-2xl">timer_off</span>
                <span className="text-xl font-black uppercase">Hết giờ!</span>
              </div>
              <button
                onClick={handleReveal}
                className="px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest bg-gradient-to-b from-[#d4af37] to-[#b8860b] text-[#211111] shadow-2xl shadow-[#d4af37]/30 transition-all hover:scale-105 active:scale-95 animate-pulse"
              >
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-3xl">visibility</span>
                  HIỆN ĐÁP ÁN
                </span>
              </button>
            </div>
          )}

          {/* Revealed: Show answer + result + close */}
          {phase === 'revealed' && (
            <div className="flex flex-col items-center gap-4 animate-in">
              {/* Official Answer */}
              <div className="text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Đáp án chính thức</p>
                <p className="text-4xl font-black text-[#d4af37] tracking-wider">{OFFICIAL_ANSWER}</p>
              </div>

              {/* Result */}
              {isCorrect !== null ? (
                <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border ${
                  isCorrect
                    ? 'bg-emerald-500/15 border-emerald-500/30'
                    : 'bg-red-500/15 border-red-500/30'
                }`}>
                  <span className="material-symbols-outlined text-3xl" style={{
                    color: isCorrect ? '#34d399' : '#f87171'
                  }}>
                    {isCorrect ? 'check_circle' : 'cancel'}
                  </span>
                  <div>
                    <p className={`text-lg font-black ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isCorrect ? 'ĐÚNG!' : 'SAI!'}
                    </p>
                    <p className="text-white text-sm">
                      Đáp án đã chốt: <span className="font-bold">{userAnswer}</span>
                    </p>
                  </div>
                  <span className={`text-2xl font-black ml-3 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isCorrect ? `+${successPts}` : failPts}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-6 py-3 rounded-xl border bg-red-500/15 border-red-500/30">
                  <span className="material-symbols-outlined text-3xl text-red-400">cancel</span>
                  <div>
                    <p className="text-lg font-black text-red-400">KHÔNG TRẢ LỜI</p>
                    <p className="text-slate-400 text-sm">Hết giờ mà chưa chốt đáp án</p>
                  </div>
                  <span className="text-2xl font-black ml-3 text-red-400">{failPts}</span>
                </div>
              )}

              {/* Close button */}
              <button
                onClick={handleClose}
                className="mt-2 px-8 py-3 rounded-xl font-bold text-sm uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all"
              >
                XONG — Áp dụng điểm
              </button>
            </div>
          )}

          {/* Host override (small, discreet) */}
          {phase !== 'revealed' && (
            <div className="flex justify-center gap-3 pt-2">
              <button
                className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                onClick={() => handleHostOverride(true)}
              >
                <span className="material-symbols-outlined text-sm">check</span>
                Quản trò: Thành công
              </button>
              <span className="text-slate-700">|</span>
              <button
                className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                onClick={() => handleHostOverride(false)}
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Quản trò: Thất bại
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
