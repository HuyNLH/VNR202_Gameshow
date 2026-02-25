/* =====================================================
   seedValis.ts — 20 vali seed data (no questions seeded)
   
   Cấu trúc 20 vali:
   - 12 vali câu hỏi: 4 dễ (+5), 4 vừa (+10), 3 khó (+15), 1 siêu khó (+20)
   - 3 vali phạt: -5, -10, -15
   - 2 vali thử thách: R1 (+10/-5), R2 (+15/-10)
   - 2 vali đặc quyền: D1 (lá chắn), D2 (xem trộm)
   - 1 vali twist: cướp 10 điểm người dẫn đầu
   
   Thứ tự ID 1-20 được shuffle ngẫu nhiên mỗi game.
   ===================================================== */

import type { Vali, QuestionVali, PenaltyVali, ChallengeVali, PerkVali, TwistVali } from '../types';

type ValiDef =
  | Omit<QuestionVali, 'id' | 'status'>
  | Omit<PenaltyVali, 'id' | 'status'>
  | Omit<ChallengeVali, 'id' | 'status'>
  | Omit<PerkVali, 'id' | 'status'>
  | Omit<TwistVali, 'id' | 'status'>;

/**
 * Creates the base 20 vali definitions.
 * IDs will be assigned 1-20 after shuffling.
 */
function createValiDefinitions(): ValiDef[] {
  return [
    // 4 vali dễ (+5) — mapped to C1-C4
    { type: 'question', code: 'Q-EASY-01', difficulty: 'easy', points: 5, questionId: 'C1' },
    { type: 'question', code: 'Q-EASY-02', difficulty: 'easy', points: 5, questionId: 'C2' },
    { type: 'question', code: 'Q-EASY-03', difficulty: 'easy', points: 5, questionId: 'C3' },
    { type: 'question', code: 'Q-EASY-04', difficulty: 'easy', points: 5, questionId: 'C4' },
    // 4 vali vừa (+10) — mapped to C5-C8
    { type: 'question', code: 'Q-MED-01', difficulty: 'medium', points: 10, questionId: 'C5' },
    { type: 'question', code: 'Q-MED-02', difficulty: 'medium', points: 10, questionId: 'C6' },
    { type: 'question', code: 'Q-MED-03', difficulty: 'medium', points: 10, questionId: 'C7' },
    { type: 'question', code: 'Q-MED-04', difficulty: 'medium', points: 10, questionId: 'C8' },
    // 3 vali khó (+15) — mapped to C9-C11
    { type: 'question', code: 'Q-HARD-01', difficulty: 'hard', points: 15, questionId: 'C9' },
    { type: 'question', code: 'Q-HARD-02', difficulty: 'hard', points: 15, questionId: 'C10' },
    { type: 'question', code: 'Q-HARD-03', difficulty: 'hard', points: 15, questionId: 'C11' },
    // 1 vali siêu khó (+20) — mapped to C12
    { type: 'question', code: 'Q-EXPERT-01', difficulty: 'expert', points: 20, questionId: 'C12' },
    // 3 vali phạt
    { type: 'penalty', code: 'P-5', penaltyPoints: -5 },
    { type: 'penalty', code: 'P-10', penaltyPoints: -10 },
    { type: 'penalty', code: 'P-15', penaltyPoints: -15 },
    // 2 vali thử thách
    { type: 'challenge', code: 'R1', successPoints: 10, failPoints: -5, label: 'R1' },
    { type: 'challenge', code: 'R2', successPoints: 15, failPoints: -10, label: 'R2' },
    // 2 vali đặc quyền
    { type: 'perk', code: 'D1', perkType: 'shield', label: 'Lá chắn' },
    { type: 'perk', code: 'D2', perkType: 'peek', label: 'Xem trộm' },
    // 1 vali twist
    { type: 'twist', code: 'T1', maxSteal: 10 },
  ];
}

/** Fisher-Yates shuffle */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate 20 vali with shuffled order and IDs 1-20.
 * All start with status = 'hidden'.
 */
export function generateValis(): Vali[] {
  const defs = shuffle(createValiDefinitions());
  return defs.map((def, index) => ({
    ...def,
    id: index + 1,
    status: 'hidden' as const,
  })) as Vali[];
}
