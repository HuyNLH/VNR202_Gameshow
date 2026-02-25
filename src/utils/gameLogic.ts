/* =====================================================
   gameLogic.ts — Pure functions for game rules
   "Cướp Hay Bỏ Vali – Lịch sử Đảng"
   
   All functions are pure: they take state and return new state.
   No side effects, no UI logic.
   ===================================================== */

import type {
  GameState,
  Player,
  Vali,
  TurnState,
  LogEntry,
  QuestionVali,
  PenaltyVali,
  ChallengeVali,
  PerkVali,
  TwistVali,
  StealDecision,
} from '../types';

// ─── Helper: deep clone ─────────────────────────────
export function cloneState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

// ─── Helper: save undo snapshot ─────────────────────
export function pushUndo(state: GameState): GameState {
  const s = cloneState(state);
  // Save current state (without undoStack to avoid infinite nesting)
  const snapshot = { ...state, undoStack: [] };
  s.undoStack = [...state.undoStack, JSON.stringify(snapshot)];
  return s;
}

// ─── Undo ───────────────────────────────────────────
export function undo(state: GameState): GameState {
  if (state.undoStack.length === 0) return state;
  const stack = [...state.undoStack];
  const lastSnapshot = stack.pop()!;
  const restored: GameState = JSON.parse(lastSnapshot);
  restored.undoStack = stack;
  return restored;
}

// ─── Initial Turn State ─────────────────────────────
export function createInitialTurn(): TurnState {
  return {
    phase: 'idle',
    selectedValiId: null,
    p1Id: null,
    p2Id: null,
    decision: null,
    holderId: null,
    shieldPromptActive: false,
  };
}

// ─── Create Player ──────────────────────────────────
export function createPlayer(name: string, stealTokens: number): Player {
  return {
    id: crypto.randomUUID(),
    name,
    score: 0,
    stealTokens,
    consecutiveSteals: 0,
    shields: 0,
    peeks: 0,
    totalSteals: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  };
}

// ─── Validation Functions ───────────────────────────

/** Check if P2 can steal */
export function canSteal(player: Player): { ok: boolean; reason?: string } {
  if (player.stealTokens <= 0) {
    return { ok: false, reason: 'Người chơi này đã hết lượt cướp' };
  }
  // Không được cướp quá 2 lượt liên tiếp
  if (player.consecutiveSteals >= 2) {
    return { ok: false, reason: 'Không được cướp quá 2 lượt liên tiếp' };
  }
  return { ok: true };
}

/** Validate selecting a vali */
export function canSelectVali(
  state: GameState,
  valiId: number
): { ok: boolean; reason?: string } {
  if (state.turn.phase !== 'idle') {
    return { ok: false, reason: 'Đang trong lượt chơi, không thể chọn vali mới' };
  }
  if (!state.turn.p1Id || !state.turn.p2Id) {
    return { ok: false, reason: 'Chưa chọn P1/P2' };
  }
  if (state.turn.p1Id === state.turn.p2Id) {
    return { ok: false, reason: 'P1 và P2 không được là cùng một người' };
  }
  const vali = state.valis.find((v) => v.id === valiId);
  if (!vali) {
    return { ok: false, reason: 'Vali không tồn tại' };
  }
  if (vali.status !== 'hidden') {
    return { ok: false, reason: 'Vali này đã được mở hoặc đang chọn' };
  }
  return { ok: true };
}

// ─── Action: Select Vali ────────────────────────────
export function selectVali(state: GameState, valiId: number): GameState {
  const s = pushUndo(state);
  // Set vali to pending
  s.valis = s.valis.map((v) =>
    v.id === valiId ? { ...v, status: 'pending' as const } : v
  );
  s.turn = {
    ...s.turn,
    phase: 'pendingDecision',
    selectedValiId: valiId,
  };
  return s;
}

// ─── Action: Apply Steal Decision ───────────────────
export function applyStealDecision(
  state: GameState,
  decision: StealDecision
): GameState {
  const s = pushUndo(state);
  const p2 = s.players.find((p) => p.id === s.turn.p2Id)!;

  if (decision === 'steal') {
    // Tiêu hao 1 token cướp
    p2.stealTokens -= 1;
    // Phí cướp: -2 điểm ngay lập tức (lá chắn KHÔNG chặn được phí cướp)
    p2.score -= 2;
    // Người giữ vali = P2
    s.turn.holderId = s.turn.p2Id;
    s.turn.decision = 'steal';
    // Tăng consecutive steals cho P2
    p2.consecutiveSteals += 1;
    // Tăng stats
    p2.totalSteals += 1;
  } else {
    // Bỏ: người giữ vali = P1
    s.turn.holderId = s.turn.p1Id;
    s.turn.decision = 'pass';
    // Reset consecutive steals cho P2 vì không cướp
    p2.consecutiveSteals = 0;
  }

  s.turn.phase = 'pendingReveal';
  return s;
}

// ─── Action: Reveal Vali ────────────────────────────
export function revealVali(state: GameState): GameState {
  const s = pushUndo(state);
  const valiId = s.turn.selectedValiId!;
  const vali = s.valis.find((v) => v.id === valiId)!;

  // Mark vali as revealed
  s.valis = s.valis.map((v) =>
    v.id === valiId ? { ...v, status: 'revealed' as const } : v
  );

  // Determine next phase based on vali type
  switch (vali.type) {
    case 'question':
      s.turn.phase = 'resolvingQuestion';
      break;
    case 'challenge':
      s.turn.phase = 'resolvingChallenge';
      break;
    case 'penalty': {
      // Check if holder has shield
      const holder = s.players.find((p) => p.id === s.turn.holderId)!;
      if (holder.shields > 0) {
        // Activate shield prompt
        s.turn.shieldPromptActive = true;
        s.turn.phase = 'resolvingChallenge'; // reuse phase for shield decision
      } else {
        // Apply penalty immediately
        return applyPenalty(s, false);
      }
      break;
    }
    case 'perk':
      return applyPerk(s);
    case 'twist':
      return applyTwist(s);
  }

  return s;
}

// ─── Action: Apply Question Result ──────────────────
export function applyQuestionResult(
  state: GameState,
  correct: boolean
): GameState {
  const s = pushUndo(state);
  const valiId = s.turn.selectedValiId!;
  const vali = s.valis.find((v) => v.id === valiId)! as QuestionVali;
  const holder = s.players.find((p) => p.id === s.turn.holderId)!;
  const scoreChanges: Record<string, number> = {};

  // Track answer stats
  holder.totalAnswers += 1;

  if (correct) {
    // Cộng điểm theo vali
    holder.score += vali.points;
    holder.correctAnswers += 1;
    scoreChanges[holder.id] = vali.points;
  } else {
    // Sai: 0 điểm bình thường
    let penalty = 0;
    // Nếu người giữ là P2 và đã cướp → phạt thêm -3
    if (s.turn.decision === 'steal' && s.turn.holderId === s.turn.p2Id) {
      // Check nếu có lá chắn, cho phép dùng để chặn -3
      // (Ở MVP, tự động hỏi dùng lá chắn nếu có)
      if (holder.shields > 0) {
        // Dùng lá chắn chặn -3
        holder.shields -= 1;
        penalty = 0;
      } else {
        penalty = -3;
      }
      holder.score += penalty;
    }
    scoreChanges[holder.id] = penalty;
  }

  // Add phí cướp to scoreChanges for log
  if (s.turn.decision === 'steal') {
    const p2Id = s.turn.p2Id!;
    scoreChanges[p2Id] = (scoreChanges[p2Id] || 0) - 2; // -2 already applied
    // Correct: -2 was already applied in applyStealDecision, so just note it
    // Actually we should NOT add it again — it's already in the score
    // Let's just record the question-related changes here
    // Remove the -2 we just erroneously added:
    scoreChanges[p2Id] = (scoreChanges[p2Id] || 0) + 2; // undo the erroneous addition
  }

  // Log entry
  const p1 = s.players.find((p) => p.id === s.turn.p1Id)!;
  const p2 = s.players.find((p) => p.id === s.turn.p2Id)!;
  const logEntry: LogEntry = {
    turnNumber: s.turnNumber,
    valiId,
    valiCode: vali.code,
    valiType: 'question',
    p1Name: p1.name,
    p2Name: p2.name,
    decision: s.turn.decision!,
    holderName: holder.name,
    result: correct ? 'Đúng' : 'Sai',
    scoreChange: scoreChanges,
    description: correct
      ? `${holder.name} trả lời đúng → +${vali.points} điểm`
      : s.turn.decision === 'steal' && s.turn.holderId === s.turn.p2Id
        ? `${holder.name} cướp & trả lời sai → -3 điểm`
        : `${holder.name} trả lời sai → 0 điểm`,
  };
  s.log.push(logEntry);

  return finishTurn(s);
}

// ─── Action: Apply Penalty ──────────────────────────
export function applyPenalty(
  state: GameState,
  useShield: boolean
): GameState {
  const s = useShield ? pushUndo(state) : state; // if called from revealVali, already pushed
  const valiId = s.turn.selectedValiId!;
  const vali = s.valis.find((v) => v.id === valiId)! as PenaltyVali;
  const holder = s.players.find((p) => p.id === s.turn.holderId)!;
  const scoreChanges: Record<string, number> = {};

  if (useShield && holder.shields > 0) {
    // Dùng lá chắn chặn phạt
    holder.shields -= 1;
    scoreChanges[holder.id] = 0;
  } else {
    holder.score += vali.penaltyPoints;
    scoreChanges[holder.id] = vali.penaltyPoints;
  }

  const p1 = s.players.find((p) => p.id === s.turn.p1Id)!;
  const p2 = s.players.find((p) => p.id === s.turn.p2Id)!;
  const logEntry: LogEntry = {
    turnNumber: s.turnNumber,
    valiId,
    valiCode: vali.code,
    valiType: 'penalty',
    p1Name: p1.name,
    p2Name: p2.name,
    decision: s.turn.decision!,
    holderName: holder.name,
    result: useShield ? 'Dùng lá chắn' : `${vali.penaltyPoints} điểm`,
    scoreChange: scoreChanges,
    description: useShield
      ? `${holder.name} dùng Lá chắn chặn phạt ${vali.penaltyPoints}`
      : `${holder.name} bị phạt ${vali.penaltyPoints} điểm`,
  };
  s.log.push(logEntry);

  return finishTurn(s);
}

// ─── Action: Apply Challenge Result ─────────────────
export function applyChallengeResult(
  state: GameState,
  success: boolean
): GameState {
  const s = pushUndo(state);
  const valiId = s.turn.selectedValiId!;
  const vali = s.valis.find((v) => v.id === valiId)! as ChallengeVali;
  const holder = s.players.find((p) => p.id === s.turn.holderId)!;
  const scoreChanges: Record<string, number> = {};

  const delta = success ? vali.successPoints : vali.failPoints;
  holder.score += delta;
  scoreChanges[holder.id] = delta;

  const p1 = s.players.find((p) => p.id === s.turn.p1Id)!;
  const p2 = s.players.find((p) => p.id === s.turn.p2Id)!;
  const logEntry: LogEntry = {
    turnNumber: s.turnNumber,
    valiId,
    valiCode: vali.code,
    valiType: 'challenge',
    p1Name: p1.name,
    p2Name: p2.name,
    decision: s.turn.decision!,
    holderName: holder.name,
    result: success ? 'Thành công' : 'Thất bại',
    scoreChange: scoreChanges,
    description: success
      ? `${holder.name} thử thách thành công → +${vali.successPoints} điểm`
      : `${holder.name} thử thách thất bại → ${vali.failPoints} điểm`,
  };
  s.log.push(logEntry);

  return finishTurn(s);
}

// ─── Action: Apply Perk ─────────────────────────────
export function applyPerk(state: GameState): GameState {
  const s = state; // already pushed undo in revealVali
  const valiId = s.turn.selectedValiId!;
  const vali = s.valis.find((v) => v.id === valiId)! as PerkVali;
  const holder = s.players.find((p) => p.id === s.turn.holderId)!;

  if (vali.perkType === 'shield') {
    // D1: Lá chắn — chặn 1 lần bị trừ điểm trực tiếp
    holder.shields += 1;
  } else {
    // D2: Xem trộm — ghi nhận đặc quyền
    holder.peeks += 1;
  }

  const p1 = s.players.find((p) => p.id === s.turn.p1Id)!;
  const p2 = s.players.find((p) => p.id === s.turn.p2Id)!;
  const logEntry: LogEntry = {
    turnNumber: s.turnNumber,
    valiId,
    valiCode: vali.code,
    valiType: 'perk',
    p1Name: p1.name,
    p2Name: p2.name,
    decision: s.turn.decision!,
    holderName: holder.name,
    result: vali.perkType === 'shield' ? 'Lá chắn' : 'Xem trộm',
    scoreChange: {},
    description: `${holder.name} nhận đặc quyền: ${vali.label}`,
  };
  s.log.push(logEntry);

  return finishTurn(s);
}

// ─── Action: Apply Twist ────────────────────────────
export function applyTwist(state: GameState): GameState {
  const s = state; // already pushed undo in revealVali
  const valiId = s.turn.selectedValiId!;
  const vali = s.valis.find((v) => v.id === valiId)! as TwistVali;
  const holder = s.players.find((p) => p.id === s.turn.holderId)!;
  const scoreChanges: Record<string, number> = {};

  // Tìm người dẫn đầu điểm
  // Nếu hòa, chọn người đầu tiên trong danh sách (MVP)
  const sortedPlayers = [...s.players].sort((a, b) => b.score - a.score);
  let leader = sortedPlayers[0];

  // Nếu leader là chính holder, chọn người thứ 2
  if (leader.id === holder.id && sortedPlayers.length > 1) {
    leader = sortedPlayers[1];
  }

  // Trừ tối đa maxSteal (10) điểm từ leader
  const actualSteal = Math.min(vali.maxSteal, Math.max(0, leader.score));
  
  // Find actual player references to modify
  const leaderRef = s.players.find((p) => p.id === leader.id)!;
  leaderRef.score -= actualSteal;
  holder.score += actualSteal;

  scoreChanges[leader.id] = -actualSteal;
  scoreChanges[holder.id] = actualSteal;

  const p1 = s.players.find((p) => p.id === s.turn.p1Id)!;
  const p2 = s.players.find((p) => p.id === s.turn.p2Id)!;
  const logEntry: LogEntry = {
    turnNumber: s.turnNumber,
    valiId,
    valiCode: vali.code,
    valiType: 'twist',
    p1Name: p1.name,
    p2Name: p2.name,
    decision: s.turn.decision!,
    holderName: holder.name,
    result: `Cướp ${actualSteal} điểm từ ${leaderRef.name}`,
    scoreChange: scoreChanges,
    description: `${holder.name} cướp ${actualSteal} điểm từ người dẫn đầu (${leaderRef.name})`,
  };
  s.log.push(logEntry);

  return finishTurn(s);
}

// ─── Finish Turn ────────────────────────────────────
function finishTurn(state: GameState): GameState {
  const s = state;

  // Check if all valis are revealed
  const allRevealed = s.valis.every((v) => v.status === 'revealed');
  if (allRevealed) {
    s.turn = { ...createInitialTurn(), phase: 'finished' };
    s.screen = 'end';
  } else {
    s.turn = { ...createInitialTurn(), phase: 'resolved' };
    s.turnNumber += 1;
  }

  return s;
}

// ─── Reset Turn (go to idle for next turn) ──────────
export function resetTurn(state: GameState): GameState {
  const s = cloneState(state);
  s.turn = createInitialTurn();
  return s;
}

// ─── Get vali description for display ───────────────
export function getValiDisplayInfo(vali: Vali): {
  title: string;
  description: string;
  color: string;
} {
  switch (vali.type) {
    case 'question': {
      const diffLabels: Record<string, string> = {
        easy: 'Dễ',
        medium: 'Trung bình',
        hard: 'Khó',
        expert: 'Siêu khó',
      };
      return {
        title: `Câu hỏi ${diffLabels[vali.difficulty]}`,
        description: `+${vali.points} điểm`,
        color: vali.difficulty === 'easy' ? 'emerald' :
               vali.difficulty === 'medium' ? 'amber' :
               vali.difficulty === 'hard' ? 'red' : 'purple',
      };
    }
    case 'penalty':
      return {
        title: 'Phạt trực tiếp',
        description: `${vali.penaltyPoints} điểm`,
        color: 'red',
      };
    case 'challenge':
      return {
        title: `Thử thách ${vali.label}`,
        description: `Thành công: +${vali.successPoints} / Thất bại: ${vali.failPoints}`,
        color: 'orange',
      };
    case 'perk':
      return {
        title: 'Đặc quyền',
        description: vali.perkType === 'shield' ? 'Lá chắn (chặn 1 lần trừ điểm)' : 'Xem trộm',
        color: 'blue',
      };
    case 'twist':
      return {
        title: 'Twist!',
        description: 'Cướp tối đa 10 điểm từ người dẫn đầu',
        color: 'purple',
      };
  }
}

// ─── Stats for End Screen ───────────────────────────
export function getGameStats(state: GameState) {
  const players = [...state.players];

  // Bảng xếp hạng theo điểm
  const ranking = [...players].sort((a, b) => b.score - a.score);

  // Ai cướp nhiều nhất
  const topStealer = [...players].sort((a, b) => b.totalSteals - a.totalSteals)[0];

  // Ai trả lời đúng nhiều nhất
  const topCorrect = [...players].sort((a, b) => b.correctAnswers - a.correctAnswers)[0];

  return { ranking, topStealer, topCorrect };
}
