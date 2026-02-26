/* =====================================================
   types.ts — All TypeScript types for the game
   "Cướp Hay Bỏ Vali – Lịch sử Đảng"
   ===================================================== */

// ─── Vali Types ─────────────────────────────────────
export type ValiType = 'question' | 'penalty' | 'challenge' | 'perk' | 'twist';
export type ValiStatus = 'hidden' | 'pending' | 'revealed';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

/** Base vali definition (shared fields) */
interface ValiBase {
  id: number;           // 1..20
  code: string;         // e.g. Q-EASY-01, P-10, R1, D1, T1
  status: ValiStatus;
}

/** Vali câu hỏi */
export interface QuestionVali extends ValiBase {
  type: 'question';
  difficulty: Difficulty;
  points: 5 | 10 | 15 | 20;
  questionId?: string;  // optional, link to questionBank
}

/** Vali phạt trực tiếp */
export interface PenaltyVali extends ValiBase {
  type: 'penalty';
  penaltyPoints: number; // negative, e.g. -5, -10, -15
}

/** Vali thử thách rủi ro */
export interface ChallengeVali extends ValiBase {
  type: 'challenge';
  successPoints: number;  // e.g. +10, +15
  failPoints: number;     // e.g. -5, -10
  label: string;          // "R1" or "R2"
}

/** Vali đặc quyền */
export interface PerkVali extends ValiBase {
  type: 'perk';
  perkType: 'shield' | 'star'; // D1=shield, D2=star (Ngôi sao hi vọng)
  label: string;
}

/** Vali twist */
export interface TwistVali extends ValiBase {
  type: 'twist';
  maxSteal: number; // 10
}

export type Vali = QuestionVali | PenaltyVali | ChallengeVali | PerkVali | TwistVali;

// ─── Question (for future use) ──────────────────────

/** Loại hình câu hỏi */
export type QuestionFormat =
  | 'mcq'           // Trắc nghiệm 1 đáp án
  | 'multi-select'  // Nhiều lựa chọn (chọn TẤT CẢ đáp án đúng)
  | 'fill-blank'    // Điền khuyết
  | 'true-false'    // Đúng / Sai + giải thích
  | 'short-answer'  // Trả lời ngắn (nhiều ý)
  | 'compare'       // So sánh dạng bảng
  | 'essay'         // Tự luận ngắn
  | 'ordering';     // Sắp xếp thứ tự

export interface QuestionOption {
  label: string;    // "A", "B", "C", ...
  text: string;     // Nội dung đáp án
}

export interface Question {
  id: string;
  difficulty: Difficulty;
  format: QuestionFormat;
  content: string;         // Nội dung câu hỏi chính
  imageUrl?: string;       // Optional image
  /** Đáp án hiển thị cho quản trò (text) */
  answer?: string;
  explanation?: string;    // Giải thích
  /** MCQ / multi-select options */
  options?: QuestionOption[];
  /** Gợi ý chấm cho câu tự luận / ngắn / so sánh */
  gradingHints?: string[];
  /** Thứ tự đúng cho câu ordering (labels) */
  correctOrder?: string[];
}

// ─── Player ─────────────────────────────────────────
export interface Player {
  id: string;
  name: string;
  score: number;
  stealTokens: number;
  consecutiveSteals: number; // track consecutive steals for this player
  shields: number;           // Lá chắn count
  stars: number;             // Ngôi sao hi vọng count
  // Stats
  totalSteals: number;
  correctAnswers: number;
  totalAnswers: number;
}

// ─── Turn State Machine ─────────────────────────────
export type TurnPhase =
  | 'idle'              // chưa chọn vali
  | 'pendingDecision'   // đã chọn vali, chưa chốt cướp/bỏ
  | 'pendingReveal'     // đã chốt cướp/bỏ, chờ reveal
  | 'resolvingQuestion' // đã reveal vali câu hỏi, chờ chấm đúng/sai
  | 'resolvingChallenge'// đã reveal vali thử thách, chờ chọn thành công/thất bại
  | 'resolved'          // xử lý xong lượt, chờ lượt mới
  | 'finished';         // hết 20 vali

export type StealDecision = 'steal' | 'pass';

export interface TurnState {
  phase: TurnPhase;
  selectedValiId: number | null;
  p1Id: string | null;       // người chơi 1 (người giữ vali gốc)
  p2Id: string | null;       // người chơi 2 (người quyết định cướp/bỏ)
  decision: StealDecision | null;
  holderId: string | null;   // ai giữ vali sau quyết định
  /** Whether shield prompt is active (for penalty valis) */
  shieldPromptActive: boolean;
  /** Whether P1 activated a star for this turn */
  starActive: boolean;
}

// ─── Log Entry ──────────────────────────────────────
export interface LogEntry {
  turnNumber: number;
  valiId: number;
  valiCode: string;
  valiType: ValiType;
  p1Name: string;
  p2Name: string;
  decision: StealDecision;
  holderName: string;
  result?: string;      // "Đúng", "Sai", "Thành công", "Thất bại", etc.
  scoreChange: Record<string, number>; // playerId -> delta
  description: string;
}

// ─── Game State ─────────────────────────────────────
export type AppScreen = 'setup' | 'game' | 'end';

export interface GameState {
  screen: AppScreen;
  players: Player[];
  valis: Vali[];
  turn: TurnState;
  turnNumber: number;
  log: LogEntry[];
  defaultStealTokens: number;
  /** Undo: snapshots of previous states */
  undoStack: string[]; // JSON serialized snapshots
}
