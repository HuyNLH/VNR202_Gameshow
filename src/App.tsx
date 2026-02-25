/* =====================================================
   App.tsx — Root component with screen routing
   ===================================================== */

import { useGameState } from './hooks/useGameState';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';

export default function App() {
  const game = useGameState();

  switch (game.state.screen) {
    case 'setup':
      return <SetupScreen onStart={game.startGame} />;

    case 'game':
      return (
        <GameScreen
          state={game.state}
          onSelectVali={game.handleSelectVali}
          onSetP1={game.setP1}
          onSetP2={game.setP2}
          onDecision={game.handleDecision}
          onReveal={game.handleReveal}
          onQuestionResult={game.handleQuestionResult}
          onPenaltyShield={game.handlePenaltyShield}
          onChallengeResult={game.handleChallengeResult}
          onNextTurn={game.handleNextTurn}
          onUndo={game.handleUndo}
          onEndGame={game.handleEndGame}
        />
      );

    case 'end':
      return <EndScreen state={game.state} onRestart={game.handleRestart} />;

    default:
      return null;
  }
}
