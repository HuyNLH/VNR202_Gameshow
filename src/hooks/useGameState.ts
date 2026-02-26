/* =====================================================
   useGameState.ts — Central game state hook
   ===================================================== */

import { useState, useCallback } from 'react';
import type { GameState, StealDecision } from '../types';
import { generateValis } from '../data/seedValis';
import {
  createInitialTurn,
  createPlayer,
  canSelectVali,
  canSteal,
  selectVali,
  activateStar,
  applyStealDecision,
  revealVali,
  applyQuestionResult,
  applyPenalty,
  applyChallengeResult,
  resetTurn,
  undo as undoAction,
  cloneState,
} from '../utils/gameLogic';

function createInitialState(): GameState {
  return {
    screen: 'setup',
    players: [],
    valis: [],
    turn: createInitialTurn(),
    turnNumber: 1,
    log: [],
    defaultStealTokens: 3,
    undoStack: [],
  };
}

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);

  // ─── Setup Actions ──────────────────────────────
  const setDefaultTokens = useCallback((tokens: number) => {
    setState((s) => ({ ...s, defaultStealTokens: tokens }));
  }, []);

  const startGame = useCallback((playerNames: string[], tokens: number) => {
    setState((s) => ({
      ...s,
      screen: 'game',
      players: playerNames.map((name) => createPlayer(name, tokens)),
      valis: generateValis(),
      turn: createInitialTurn(),
      turnNumber: 1,
      log: [],
      undoStack: [],
      defaultStealTokens: tokens,
    }));
  }, []);

  // ─── Turn Actions ───────────────────────────────
  const setP1 = useCallback((playerId: string) => {
    setState((s) => ({
      ...s,
      turn: { ...s.turn, p1Id: playerId },
    }));
  }, []);

  const setP2 = useCallback((playerId: string) => {
    setState((s) => ({
      ...s,
      turn: { ...s.turn, p2Id: playerId },
    }));
  }, []);

  const handleActivateStar = useCallback((): { ok: boolean; reason?: string } => {
    let result: { ok: boolean; reason?: string } = { ok: false, reason: '' };
    setState((s) => {
      if (s.turn.phase !== 'idle') {
        result = { ok: false, reason: 'Chỉ được dùng ⭐ trước khi chọn vali' };
        return s;
      }
      if (!s.turn.p1Id) {
        result = { ok: false, reason: 'Chưa chọn P1' };
        return s;
      }
      const p1 = s.players.find((p) => p.id === s.turn.p1Id);
      if (!p1 || p1.stars <= 0) {
        result = { ok: false, reason: 'P1 không có ⭐ để dùng' };
        return s;
      }
      if (s.turn.starActive) {
        result = { ok: false, reason: '⭐ đã được bật rồi' };
        return s;
      }
      result = { ok: true };
      return activateStar(cloneState(s));
    });
    return result;
  }, []);

  const handleSelectVali = useCallback((valiId: number): { ok: boolean; reason?: string } => {
    let result: { ok: boolean; reason?: string } = { ok: false, reason: '' };
    setState((s) => {
      const check = canSelectVali(s, valiId);
      result = check;
      if (!check.ok) return s;
      return selectVali(s, valiId);
    });
    return result;
  }, []);

  const handleDecision = useCallback((decision: StealDecision): { ok: boolean; reason?: string } => {
    let result = { ok: true as boolean, reason: '' as string | undefined };
    setState((s) => {
      if (s.turn.phase !== 'pendingDecision') {
        result = { ok: false, reason: 'Chưa chọn vali' };
        return s;
      }
      if (decision === 'steal') {
        const p2 = s.players.find((p) => p.id === s.turn.p2Id);
        if (!p2) {
          result = { ok: false, reason: 'Chưa chọn P2' };
          return s;
        }
        const check = canSteal(p2);
        if (!check.ok) {
          result = { ok: false, reason: check.reason };
          return s;
        }
      }
      return applyStealDecision(cloneState(s), decision);
    });
    return result;
  }, []);

  const handleReveal = useCallback((): { ok: boolean; reason?: string } => {
    let result = { ok: true as boolean, reason: '' as string | undefined };
    setState((s) => {
      if (s.turn.phase !== 'pendingReveal') {
        result = { ok: false, reason: 'Chưa chốt Cướp/Bỏ' };
        return s;
      }
      return revealVali(cloneState(s));
    });
    return result;
  }, []);

  const handleQuestionResult = useCallback((correct: boolean) => {
    setState((s) => {
      if (s.turn.phase !== 'resolvingQuestion') return s;
      return applyQuestionResult(cloneState(s), correct);
    });
  }, []);

  const handlePenaltyShield = useCallback((useShield: boolean) => {
    setState((s) => {
      return applyPenalty(cloneState(s), useShield);
    });
  }, []);

  const handleChallengeResult = useCallback((success: boolean) => {
    setState((s) => {
      if (s.turn.phase !== 'resolvingChallenge') return s;
      // Check if this is actually a shield prompt for penalty
      if (s.turn.shieldPromptActive) {
        return applyPenalty(cloneState(s), success); // success = useShield
      }
      return applyChallengeResult(cloneState(s), success);
    });
  }, []);

  const handleNextTurn = useCallback(() => {
    setState((s) => {
      if (s.turn.phase !== 'resolved') return s;
      return resetTurn(s);
    });
  }, []);

  const handleUndo = useCallback(() => {
    setState((s) => undoAction(s));
  }, []);

  const handleRestart = useCallback(() => {
    setState(createInitialState());
  }, []);

  const handleEndGame = useCallback(() => {
    setState((s) => ({ ...s, screen: 'end' }));
  }, []);

  return {
    state,
    // Setup
    setDefaultTokens,
    startGame,
    // Turn
    setP1,
    setP2,
    handleActivateStar,
    handleSelectVali,
    handleDecision,
    handleReveal,
    handleQuestionResult,
    handlePenaltyShield,
    handleChallengeResult,
    handleNextTurn,
    handleUndo,
    handleRestart,
    handleEndGame,
  };
}
