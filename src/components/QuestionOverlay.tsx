/* =====================================================
   QuestionOverlay.tsx — Full-screen overlay khi hiện câu hỏi
   Giao diện rõ ràng, không bị đè.
   Có đồng hồ đếm ngược theo độ khó.
   ===================================================== */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { QuestionVali, Player, Question } from '../types';
import { getQuestionById } from '../data/questionBank';

interface QuestionOverlayProps {
  vali: QuestionVali;
  holder: Player | null;
  decision: 'steal' | 'pass' | null;
  starActive: boolean;
  onQuestionResult: (correct: boolean) => void;
}

/* ─── Time limits per difficulty (seconds) ─────────── */
const TIME_LIMITS: Record<string, number> = {
  easy: 15,
  medium: 30,
  hard: 45,
  expert: 60,
};

/* ─── Format labels ────────────────────────────────── */
const FORMAT_LABELS: Record<string, string> = {
  mcq: 'Trắc nghiệm',
  'multi-select': 'Nhiều đáp án đúng',
  'fill-blank': 'Điền khuyết',
  'true-false': 'Đúng / Sai',
  'short-answer': 'Trả lời ngắn',
  compare: 'So sánh',
  essay: 'Tự luận ngắn',
  ordering: 'Sắp xếp thứ tự',
};

const DIFF_LABELS: Record<string, string> = {
  easy: 'DỄ',
  medium: 'TRUNG BÌNH',
  hard: 'KHÓ',
  expert: 'SIÊU KHÓ',
};

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500 text-white',
  medium: 'bg-amber-500 text-white',
  hard: 'bg-[#ea2a33] text-white',
  expert: 'bg-purple-600 text-white',
};

const DIFF_RING: Record<string, string> = {
  easy: 'text-emerald-400',
  medium: 'text-amber-400',
  hard: 'text-[#ea2a33]',
  expert: 'text-purple-400',
};

/* ─── Circular Timer ──────────────────────────────── */
function CircularTimer({
  seconds,
  total,
  paused,
  difficulty,
}: {
  seconds: number;
  total: number;
  paused: boolean;
  difficulty: string;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = seconds / total;
  const offset = circumference * (1 - progress);
  const isLow = seconds <= 10;

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" className="-rotate-90">
        {/* Track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={isLow ? '#ef4444' : DIFF_RING[difficulty]?.replace('text-', '') || '#d4af37'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`transition-all duration-1000 linear ${isLow ? 'animate-pulse' : ''}`}
          style={{
            stroke: isLow
              ? '#ef4444'
              : difficulty === 'easy'
                ? '#34d399'
                : difficulty === 'medium'
                  ? '#fbbf24'
                  : difficulty === 'hard'
                    ? '#ea2a33'
                    : '#a855f7',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-4xl font-black tabular-nums ${isLow ? 'text-red-400 animate-pulse' : 'text-white'}`}
        >
          {seconds}
        </span>
        <span className="text-[10px] text-slate-400 uppercase tracking-widest">giây</span>
        {paused && (
          <span className="text-[10px] text-amber-400 font-bold mt-0.5">TẠM DỪNG</span>
        )}
      </div>
    </div>
  );
}

/* ─── Question Body (format-specific rendering) ───── */
function QuestionBody({ question }: { question: Question }) {
  return (
    <div className="space-y-5">
      {/* MCQ / multi-select options */}
      {(question.format === 'mcq' || question.format === 'multi-select') && question.options && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <div
              key={opt.label}
              className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-colors"
            >
              <span className="shrink-0 size-10 rounded-full bg-[#ea2a33]/20 text-[#ea2a33] flex items-center justify-center font-black text-base">
                {opt.label}
              </span>
              <span className="text-slate-100 text-lg leading-snug pt-1.5">{opt.text}</span>
            </div>
          ))}
        </div>
      )}
      {question.format === 'multi-select' && (
        <p className="text-amber-400 text-sm font-bold flex items-center gap-1.5 justify-center">
          <span className="material-symbols-outlined text-base">info</span>
          Chọn TẤT CẢ đáp án đúng
        </p>
      )}

      {/* Ordering */}
      {question.format === 'ordering' && question.options && (
        <div className="grid gap-3 max-w-2xl mx-auto">
          {question.options.map((opt) => (
            <div
              key={opt.label}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10"
            >
              <span className="shrink-0 size-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-base">
                {opt.label}
              </span>
              <span className="text-slate-100 text-lg">{opt.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* True/False */}
      {question.format === 'true-false' && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 px-5 py-2.5 rounded-full text-sm font-bold border border-amber-500/20">
            <span className="material-symbols-outlined text-base">help</span>
            Trả lời ĐÚNG hoặc SAI — giải thích ngắn nếu Sai
          </div>
        </div>
      )}

      {/* Fill-blank */}
      {question.format === 'fill-blank' && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-5 py-2.5 rounded-full text-sm font-bold border border-blue-500/20">
            <span className="material-symbols-outlined text-base">edit_note</span>
            Điền vào chỗ trống ( ______ )
          </div>
        </div>
      )}

      {/* Short-answer / essay / compare — no extra options, just the question text */}
      {(question.format === 'short-answer' || question.format === 'essay' || question.format === 'compare') && (
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 px-5 py-2.5 rounded-full text-sm font-bold border border-purple-500/20">
            <span className="material-symbols-outlined text-base">stylus_note</span>
            {question.format === 'compare'
              ? 'Trình bày so sánh theo bảng'
              : question.format === 'essay'
                ? 'Trả lời tự luận ngắn'
                : 'Trả lời ngắn gọn đủ ý'}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Host-only Answer Section ────────────────────── */
function HostAnswerPanel({ question }: { question: Question }) {
  const [showAnswer, setShowAnswer] = useState(false);

  const hasDirectAnswer =
    question.format === 'mcq' ||
    question.format === 'multi-select' ||
    question.format === 'ordering' ||
    question.format === 'true-false' ||
    question.format === 'fill-blank';

  const hasGradingHints =
    (question.format === 'short-answer' || question.format === 'essay' || question.format === 'compare') &&
    question.gradingHints &&
    question.gradingHints.length > 0;

  if (!hasDirectAnswer && !hasGradingHints) return null;

  return (
    <div className="border-t border-white/10 pt-4 mt-2">
      <button
        className="mx-auto flex items-center gap-2 text-sm text-[#d4af37] font-bold uppercase tracking-widest hover:text-[#d4af37]/80 transition-colors"
        onClick={() => setShowAnswer(!showAnswer)}
      >
        <span className="material-symbols-outlined text-base">
          {showAnswer ? 'visibility_off' : 'key'}
        </span>
        {showAnswer
          ? 'Ẩn đáp án'
          : hasDirectAnswer
            ? 'Xem đáp án (chỉ quản trò)'
            : 'Xem gợi ý chấm (chỉ quản trò)'}
      </button>

      {showAnswer && (
        <div className="mt-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 max-w-2xl mx-auto animate-in">
          {hasDirectAnswer && question.answer && (
            <p className="text-emerald-400 font-bold text-xl text-center">
              Đáp án: {question.answer}
            </p>
          )}
          {question.explanation && (
            <p className="text-emerald-300/80 text-sm mt-2 text-center">{question.explanation}</p>
          )}
          {hasGradingHints && question.gradingHints && (
            <ul className="mt-3 space-y-2 text-left">
              {question.gradingHints.map((hint, i) => (
                <li key={i} className="text-sm text-[#d4af37]/90 flex items-start gap-2">
                  <span className="material-symbols-outlined text-xs mt-0.5 shrink-0">arrow_right</span>
                  <span>{hint}</span>
                </li>
              ))}
            </ul>
          )}
          {question.correctOrder && (
            <p className="text-emerald-300/80 text-sm mt-2 text-center">
              Thứ tự: {question.correctOrder.join(' → ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Main Overlay
   ═══════════════════════════════════════════════════════ */
export default function QuestionOverlay({
  vali,
  holder,
  decision,
  starActive,
  onQuestionResult,
}: QuestionOverlayProps) {
  const question = vali.questionId ? getQuestionById(vali.questionId) : undefined;
  const timeLimit = TIME_LIMITS[vali.difficulty] || 45;
  const [seconds, setSeconds] = useState(timeLimit);
  const [paused, setPaused] = useState(false);
  const [expired, setExpired] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer logic
  useEffect(() => {
    setSeconds(timeLimit);
    setExpired(false);
    setPaused(false);
  }, [vali.id, timeLimit]);

  useEffect(() => {
    if (paused || expired) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setExpired(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, expired]);

  const togglePause = useCallback(() => setPaused((p) => !p), []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in">
      {/* Outer container — takes most of the viewport */}
      <div className="relative w-[95vw] max-w-5xl max-h-[92vh] flex flex-col bg-gradient-to-br from-[#1a0a0a] via-[#211111] to-[#1a0808] rounded-2xl border border-[#ea2a33]/20 shadow-2xl shadow-[#ea2a33]/10 overflow-hidden">

        {/* ─── Top Bar: metadata + timer ────────────── */}
        <div className="shrink-0 flex items-center gap-4 px-6 py-4 border-b border-white/10 bg-black/30">
          {/* Left: Difficulty + Points */}
          <div className="flex items-center gap-3 flex-1">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-black tracking-widest uppercase ${DIFF_COLORS[vali.difficulty]}`}
            >
              {DIFF_LABELS[vali.difficulty]}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white">{starActive ? '×2 ' : '+'}{starActive ? vali.points * 2 : vali.points}</span>
              <span className="text-sm text-slate-400 font-bold uppercase">điểm</span>
              {starActive && <span className="text-2xl ml-1">⭐</span>}
            </div>
            {question && (
              <span className="hidden sm:inline-flex items-center gap-1 bg-white/5 text-[#d4af37] text-xs font-bold px-3 py-1 rounded-full border border-white/5">
                <span className="material-symbols-outlined text-sm">category</span>
                {FORMAT_LABELS[question.format]}
              </span>
            )}
          </div>

          {/* Center: Timer */}
          <div className="shrink-0">
            <CircularTimer
              seconds={seconds}
              total={timeLimit}
              paused={paused}
              difficulty={vali.difficulty}
            />
          </div>

          {/* Right: Holder + Code + Pause */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <button
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-white/10"
              onClick={togglePause}
            >
              <span className="material-symbols-outlined text-base">
                {paused ? 'play_arrow' : 'pause'}
              </span>
              {paused ? 'Tiếp tục' : 'Tạm dừng'}
            </button>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Người giữ vali</p>
              <p className="text-white font-bold text-sm">{holder?.name || '—'}</p>
            </div>
            <div className="bg-white/5 rounded-lg px-2.5 py-1.5 border border-white/5">
              <p className="text-[10px] text-slate-500 font-mono">{vali.code}</p>
            </div>
          </div>
        </div>

        {/* ─── Question Content (scrollable) ────────── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-8 py-8">
          {/* Divider */}
          <div className="flex items-center gap-3 text-[#ea2a33]/50 mb-6">
            <span className="h-px flex-1 bg-[#ea2a33]/15"></span>
            <span className="material-symbols-outlined text-lg">menu_book</span>
            <span className="text-xs uppercase tracking-[0.3em] font-bold text-[#ea2a33]/50">Câu hỏi</span>
            <span className="h-px flex-1 bg-[#ea2a33]/15"></span>
          </div>

          {question ? (
            <div className="space-y-6">
              {/* Question text — large, centered, very readable */}
              <h2 className="text-slate-50 text-xl sm:text-2xl lg:text-3xl leading-relaxed font-bold text-center whitespace-pre-line max-w-3xl mx-auto">
                {question.content}
              </h2>

              {/* Format-specific renderings */}
              <QuestionBody question={question} />

              {/* Host answer panel */}
              <HostAnswerPanel question={question} />
            </div>
          ) : (
            <div className="text-center space-y-4 py-12">
              <span className="material-symbols-outlined text-6xl text-slate-600">help_center</span>
              <p className="text-slate-400 text-lg italic">
                Chưa cấu hình câu hỏi cho mã {vali.code}
              </p>
              <p className="text-white text-xl font-bold">
                Quản trò đọc câu hỏi từ phong bì và chấm thủ công
              </p>
            </div>
          )}

          {/* Time expired overlay within content */}
          {expired && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-center animate-in">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <span className="material-symbols-outlined text-2xl">timer_off</span>
                <span className="text-xl font-black uppercase tracking-wider">Hết giờ!</span>
              </div>
              <p className="text-red-300/70 text-sm mt-1">Quản trò chấm dựa trên phần đã trả lời</p>
            </div>
          )}
        </div>

        {/* ─── Bottom: Actions ──────────────────────── */}
        <div className="shrink-0 border-t border-white/10 bg-black/40 p-5 space-y-3">
          <div className="flex gap-4 max-w-2xl mx-auto">
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-2xl py-5 shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.97] group"
              onClick={() => onQuestionResult(true)}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                  check_circle
                </span>
                <span className="text-2xl font-black uppercase tracking-wider">ĐÚNG</span>
              </div>
              <span className="text-sm font-bold opacity-80">
                +{starActive ? vali.points * 2 : vali.points} điểm{starActive ? ' ⭐' : ''}
              </span>
            </button>
            <button
              className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#ea2a33] hover:bg-red-500 active:bg-red-700 text-white rounded-2xl py-5 shadow-lg shadow-[#ea2a33]/20 transition-all active:scale-[0.97] group"
              onClick={() => onQuestionResult(false)}
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">
                  cancel
                </span>
                <span className="text-2xl font-black uppercase tracking-wider">SAI</span>
              </div>
              <span className="text-sm font-bold opacity-80">
                {starActive ? `${-(vali.points * 2)} điểm ⭐` : '0 điểm'}
              </span>
            </button>
          </div>
          {starActive && (
            <div className="flex items-center justify-center gap-2 bg-amber-500/15 py-2.5 rounded-xl border border-amber-500/30 max-w-2xl mx-auto">
              <span className="text-xl">⭐</span>
              <p className="text-amber-400 text-sm font-black uppercase tracking-widest">
                Ngôi sao hi vọng — Sai = trừ gấp đôi!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
