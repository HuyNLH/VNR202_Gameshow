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
    // Thứ tự đã xáo sẵn 1 lần — cố định cho phong bì
    { type: 'question', code: 'Q-MED-02', difficulty: 'medium', points: 10, questionId: 'C6' },   // 01
    { type: 'penalty', code: 'P-10', penaltyPoints: -10 },                                        // 02
    { type: 'question', code: 'Q-EASY-03', difficulty: 'easy', points: 5, questionId: 'C3' },      // 03
    { type: 'question', code: 'Q-HARD-01', difficulty: 'hard', points: 15, questionId: 'C9' },     // 04
    { type: 'perk', code: 'D2', perkType: 'peek', label: 'Xem trộm' },                            // 05
    { type: 'question', code: 'Q-EASY-01', difficulty: 'easy', points: 5, questionId: 'C1' },      // 06
    { type: 'challenge', code: 'R2', successPoints: 15, failPoints: -10, label: 'R2' },            // 07
    { type: 'question', code: 'Q-MED-04', difficulty: 'medium', points: 10, questionId: 'C8' },    // 08
    { type: 'question', code: 'Q-HARD-03', difficulty: 'hard', points: 15, questionId: 'C11' },    // 09
    { type: 'penalty', code: 'P-5', penaltyPoints: -5 },                                          // 10
    { type: 'question', code: 'Q-EXPERT-01', difficulty: 'expert', points: 20, questionId: 'C12' },// 11
    { type: 'question', code: 'Q-EASY-02', difficulty: 'easy', points: 5, questionId: 'C2' },      // 12
    { type: 'twist', code: 'T1', maxSteal: 10 },                                                  // 13
    { type: 'question', code: 'Q-MED-03', difficulty: 'medium', points: 10, questionId: 'C7' },    // 14
    { type: 'challenge', code: 'R1', successPoints: 10, failPoints: -5, label: 'R1' },             // 15
    { type: 'question', code: 'Q-HARD-02', difficulty: 'hard', points: 15, questionId: 'C10' },    // 16
    { type: 'perk', code: 'D1', perkType: 'shield', label: 'Lá chắn' },                           // 17
    { type: 'question', code: 'Q-EASY-04', difficulty: 'easy', points: 5, questionId: 'C4' },      // 18
    { type: 'penalty', code: 'P-15', penaltyPoints: -15 },                                        // 19
    { type: 'question', code: 'Q-MED-01', difficulty: 'medium', points: 10, questionId: 'C5' },    // 20
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
 * Generate 20 vali with FIXED order and IDs 1-20.
 * Không shuffle — để quản trò chuẩn bị phong bì cố định.
 * All start with status = 'hidden'.
 */
export function generateValis(): Vali[] {
  const defs = createValiDefinitions();
  return defs.map((def, index) => ({
    ...def,
    id: index + 1,
    status: 'hidden' as const,
  })) as Vali[];
}
