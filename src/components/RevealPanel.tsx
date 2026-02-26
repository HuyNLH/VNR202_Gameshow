/* =====================================================
   RevealPanel.tsx — Hiển thị nội dung vali sau Reveal
   Hỗ trợ nhiều hình thức câu hỏi:
   mcq, multi-select, fill-blank, true-false,
   short-answer, compare, essay, ordering
   ===================================================== */

import { useState } from 'react';
import type { Vali, QuestionVali, PenaltyVali, ChallengeVali, Player, TurnPhase, Question } from '../types';
import { getQuestionById } from '../data/questionBank';
import { getValiDisplayInfo } from '../utils/gameLogic';

interface RevealPanelProps {
  vali: Vali | null;
  phase: TurnPhase;
  holder: Player | null;
  decision: 'steal' | 'pass' | null;
  shieldPromptActive: boolean;
  onQuestionResult: (correct: boolean) => void;
  onChallengeResult: (success: boolean) => void;
  onPenaltyShield: (useShield: boolean) => void;
}

/* ─── Format labels ──────────────────────────────── */
const FORMAT_LABELS: Record<string, string> = {
  mcq: 'Trắc nghiệm 1 đáp án',
  'multi-select': 'Nhiều lựa chọn (chọn tất cả đáp án đúng)',
  'fill-blank': 'Điền khuyết',
  'true-false': 'Đúng / Sai',
  'short-answer': 'Trả lời ngắn',
  compare: 'So sánh dạng bảng',
  essay: 'Tự luận ngắn',
  ordering: 'Sắp xếp thứ tự',
};

/* ─── Sub-component: render question body by format ─ */
function QuestionBody({ question }: { question: Question }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="space-y-4">
      {/* Question content */}
      <h2 className="text-slate-100 text-xl lg:text-2xl leading-relaxed font-bold whitespace-pre-line">
        {question.content}
      </h2>

      {/* Format-specific rendering */}
      {/* MCQ or multi-select — show option cards */}
      {(question.format === 'mcq' || question.format === 'multi-select') && question.options && (
        <div className="grid gap-2 mt-3">
          {question.options.map((opt) => (
            <div
              key={opt.label}
              className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-base"
            >
              <span className="shrink-0 size-8 rounded-full bg-[#ea2a33]/20 text-[#ea2a33] flex items-center justify-center font-black text-sm">
                {opt.label}
              </span>
              <span className="text-slate-200 leading-snug">{opt.text}</span>
            </div>
          ))}
          {question.format === 'multi-select' && (
            <p className="text-amber-400 text-xs font-bold mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">info</span>
              Chọn TẤT CẢ đáp án đúng
            </p>
          )}
        </div>
      )}

      {/* Ordering — show items to sort */}
      {question.format === 'ordering' && question.options && (
        <div className="grid gap-2 mt-3">
          {question.options.map((opt) => (
            <div
              key={opt.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 text-base"
            >
              <span className="shrink-0 size-8 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                {opt.label}
              </span>
              <span className="text-slate-200">{opt.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* True/False format hint */}
      {question.format === 'true-false' && (
        <p className="text-amber-400 text-sm font-bold flex items-center gap-1 mt-2">
          <span className="material-symbols-outlined text-sm">help</span>
          Người chơi trả lời Đúng hoặc Sai, giải thích ngắn nếu Sai.
        </p>
      )}

      {/* Fill-blank format hint */}
      {question.format === 'fill-blank' && (
        <p className="text-amber-400 text-sm font-bold flex items-center gap-1 mt-2">
          <span className="material-symbols-outlined text-sm">edit_note</span>
          Điền vào chỗ trống (______)
        </p>
      )}

      {/* Short-answer / essay / compare — show grading hints for host */}
      {(question.format === 'short-answer' || question.format === 'essay' || question.format === 'compare') &&
        question.gradingHints &&
        question.gradingHints.length > 0 && (
          <div className="mt-3">
            <button
              className="text-xs text-[#d4af37] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <span className="material-symbols-outlined text-sm">
                {showAnswer ? 'visibility_off' : 'visibility'}
              </span>
              {showAnswer ? 'Ẩn gợi ý chấm' : 'Xem gợi ý chấm (chỉ quản trò)'}
            </button>
            {showAnswer && (
              <ul className="mt-2 space-y-1.5 pl-2 border-l-2 border-[#d4af37]/30">
                {question.gradingHints.map((hint, i) => (
                  <li key={i} className="text-sm text-[#d4af37]/90 flex items-start gap-2">
                    <span className="material-symbols-outlined text-xs mt-0.5">arrow_right</span>
                    {hint}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      {/* Show answer toggle (host-only) — for MCQ/ordering/true-false/fill-blank */}
      {(question.format === 'mcq' ||
        question.format === 'multi-select' ||
        question.format === 'ordering' ||
        question.format === 'true-false' ||
        question.format === 'fill-blank') &&
        question.answer && (
          <div className="mt-3">
            <button
              className="text-xs text-[#d4af37] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline"
              onClick={() => setShowAnswer(!showAnswer)}
            >
              <span className="material-symbols-outlined text-sm">
                {showAnswer ? 'visibility_off' : 'key'}
              </span>
              {showAnswer ? 'Ẩn đáp án' : 'Xem đáp án (chỉ quản trò)'}
            </button>
            {showAnswer && (
              <div className="mt-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-emerald-400 font-bold text-lg">
                  Đáp án: {question.answer}
                </p>
                {question.explanation && (
                  <p className="text-emerald-300/80 text-sm mt-1">{question.explanation}</p>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
}

/* ─── Main component ─────────────────────────────── */
export default function RevealPanel({
  vali,
  phase,
  holder,
  decision,
  shieldPromptActive,
  onQuestionResult,
  onChallengeResult,
  onPenaltyShield,
}: RevealPanelProps) {
  if (!vali) return null;

  // Pre-reveal states
  if (phase === 'idle' || phase === 'pendingDecision' || phase === 'pendingReveal') {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-[#2d1a1a] rounded-xl border border-[#ea2a33]/20 min-h-[200px]">
        <span className="material-symbols-outlined text-6xl text-[#d4af37]/40 mb-4">lock</span>
        <h3 className="text-2xl font-bold text-white">
          Vali số {String(vali.id).padStart(2, '0')} đang chờ quyết định
        </h3>
        <p className="text-slate-400 mt-2">
          {phase === 'pendingDecision'
            ? 'Chờ P2 chọn Cướp hoặc Bỏ...'
            : phase === 'pendingReveal'
              ? 'Đã chốt xong! Bấm REVEAL để mở vali.'
              : 'Chọn vali để bắt đầu lượt.'}
        </p>
      </div>
    );
  }

  const info = getValiDisplayInfo(vali);

  // ─── Question Vali ─────────────────────────────
  if (vali.type === 'question' && phase === 'resolvingQuestion') {
    const qVali = vali as QuestionVali;
    const question = qVali.questionId ? getQuestionById(qVali.questionId) : undefined;
    const diffLabels: Record<string, string> = {
      easy: 'DỄ',
      medium: 'TRUNG BÌNH',
      hard: 'KHÓ',
      expert: 'SIÊU KHÓ',
    };
    const diffColors: Record<string, string> = {
      easy: 'bg-emerald-500',
      medium: 'bg-amber-500',
      hard: 'bg-[#ea2a33]',
      expert: 'bg-purple-600',
    };

    return (
      <div className="w-full bg-[#2d1a1a] rounded-xl shadow-2xl border-4 border-[#ea2a33]/30 flex flex-col md:flex-row overflow-hidden max-h-[60vh]">
        {/* Left: Metadata */}
        <div className="w-full md:w-3/12 p-5 border-b md:border-b-0 md:border-r border-[#ea2a33]/10 flex flex-col items-center justify-center bg-[#ea2a33]/5 shrink-0">
          <div className="mb-3">
            <span className={`px-4 py-1.5 rounded-full ${diffColors[qVali.difficulty]} text-white text-sm font-bold tracking-widest uppercase shadow-lg`}>
              {diffLabels[qVali.difficulty]}
            </span>
          </div>
          <div className="text-center mb-3">
            <p className="text-[#ea2a33]/70 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Giá trị</p>
            <p className="text-white text-4xl font-black">+{qVali.points}</p>
            <p className="text-white text-sm font-bold">ĐIỂM</p>
          </div>
          {question && (
            <div className="bg-white/5 rounded-lg px-3 py-1.5 text-center mb-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Hình thức</p>
              <p className="text-xs text-[#d4af37] font-bold">{FORMAT_LABELS[question.format] || question.format}</p>
            </div>
          )}
          <div className="bg-slate-800/50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 font-mono">{qVali.code}</p>
            <p className="text-xs text-white font-bold mt-0.5">
              Người giữ: {holder?.name || '—'}
            </p>
          </div>
        </div>

        {/* Right: Question content + actions */}
        <div className="w-full md:w-9/12 flex flex-col overflow-hidden">
          {/* Scrollable question area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 text-[#ea2a33]/60 mb-4">
              <span className="h-px flex-1 bg-[#ea2a33]/20"></span>
              <span className="material-symbols-outlined text-sm">menu_book</span>
              <span className="h-px flex-1 bg-[#ea2a33]/20"></span>
            </div>
            {question ? (
              <QuestionBody question={question} />
            ) : (
              <div className="text-center space-y-3">
                <p className="text-slate-400 text-lg italic">Chưa cấu hình câu hỏi cho mã {qVali.code}</p>
                <p className="text-white text-xl font-bold">Quản trò đọc câu hỏi từ phong bì và chấm thủ công</p>
              </div>
            )}
          </div>

          {/* Fixed action buttons */}
          <div className="shrink-0 p-4 border-t border-white/10 bg-[#211111]/80 space-y-3">
            <div className="flex gap-3">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-4 shadow-lg transition-transform active:scale-95 group"
                onClick={() => onQuestionResult(true)}
              >
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">check_circle</span>
                <span className="text-xl font-bold uppercase tracking-wider">ĐÚNG</span>
              </button>
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-[#ea2a33] hover:bg-red-500 text-white rounded-xl py-4 shadow-lg transition-transform active:scale-95 group"
                onClick={() => onQuestionResult(false)}
              >
                <span className="material-symbols-outlined text-2xl group-hover:scale-110 transition-transform">cancel</span>
                <span className="text-xl font-bold uppercase tracking-wider">SAI</span>
              </button>
            </div>
            {decision === 'steal' && (
              <div className="flex items-center justify-center gap-2 bg-[#ea2a33]/10 py-2 rounded-lg border border-[#ea2a33]/20">
                <span className="material-symbols-outlined text-[#ea2a33] text-sm">warning</span>
                <p className="text-[#ea2a33] text-xs font-bold uppercase tracking-widest">
                  Phí cướp: -2 điểm (đã trừ)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Penalty Vali (with shield prompt) ─────────
  if (vali.type === 'penalty') {
    const pVali = vali as PenaltyVali;
    if (shieldPromptActive && holder && holder.shields > 0) {
      return (
        <div className="bg-[#2d1a1a] rounded-xl border-4 border-[#ea2a33]/50 p-8 text-center space-y-6">
          <span className="material-symbols-outlined text-7xl text-[#ea2a33]">gavel</span>
          <h3 className="text-3xl font-black text-white">PHẠT: {pVali.penaltyPoints} ĐIỂM</h3>
          <p className="text-xl text-slate-300">
            {holder.name} có <span className="text-blue-400 font-bold">{holder.shields} Lá chắn</span>. Dùng để chặn phạt?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-8 py-4 text-xl font-bold transition-transform active:scale-95"
              onClick={() => onPenaltyShield(true)}
            >
              <span className="material-symbols-outlined text-2xl">shield</span>
              DÙNG LÁ CHẮN
            </button>
            <button
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl px-8 py-4 text-xl font-bold transition-transform active:scale-95"
              onClick={() => onPenaltyShield(false)}
            >
              KHÔNG DÙNG
            </button>
          </div>
        </div>
      );
    }
    return null;
  }

  // ─── Challenge Vali ────────────────────────────
  if (vali.type === 'challenge' && phase === 'resolvingChallenge' && !shieldPromptActive) {
    const cVali = vali as ChallengeVali;
    return (
      <div className="bg-[#2d1a1a] rounded-xl border-4 border-amber-500/50 p-8 text-center space-y-6">
        <span className="material-symbols-outlined text-7xl text-amber-500">casino</span>
        <h3 className="text-3xl font-black text-white">THỬ THÁCH {cVali.label}</h3>
        <p className="text-xl text-slate-300">
          Thành công: <span className="text-emerald-400 font-bold">+{cVali.successPoints}</span> &nbsp;|&nbsp;
          Thất bại: <span className="text-[#ea2a33] font-bold">{cVali.failPoints}</span>
        </p>
        <p className="text-lg text-white font-bold">Người giữ: {holder?.name || '—'}</p>
        <div className="flex gap-4 justify-center">
          <button
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-8 py-4 text-xl font-bold transition-transform active:scale-95"
            onClick={() => onChallengeResult(true)}
          >
            <span className="material-symbols-outlined text-2xl">emoji_events</span>
            THÀNH CÔNG
          </button>
          <button
            className="flex items-center gap-2 bg-[#ea2a33] hover:bg-red-500 text-white rounded-xl px-8 py-4 text-xl font-bold transition-transform active:scale-95"
            onClick={() => onChallengeResult(false)}
          >
            <span className="material-symbols-outlined text-2xl">dangerous</span>
            THẤT BẠI
          </button>
        </div>
      </div>
    );
  }

  // ─── Resolved state summary ────────────────────
  if (phase === 'resolved') {
    return (
      <div className="bg-[#2d1a1a] rounded-xl border border-white/10 p-6 text-center space-y-4">
        <span className="material-symbols-outlined text-5xl text-emerald-500">task_alt</span>
        <h3 className="text-2xl font-bold text-white">Lượt đã hoàn thành!</h3>
        <p className="text-slate-400">
          Vali {String(vali.id).padStart(2, '0')} — {info.title}: {info.description}
        </p>
        <p className="text-slate-500 text-sm">Bấm "Lượt mới" để tiếp tục.</p>
      </div>
    );
  }

  // ─── Perk / Twist auto-resolved ───────────────
  return (
    <div className="bg-[#2d1a1a] rounded-xl border border-white/10 p-6 text-center space-y-4">
      <span className="material-symbols-outlined text-5xl text-[#d4af37]">auto_awesome</span>
      <h3 className="text-2xl font-bold text-white">{info.title}</h3>
      <p className="text-xl text-slate-300">{info.description}</p>
    </div>
  );
}
