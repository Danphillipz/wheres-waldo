import { useState } from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import StartScreen from './components/StartScreen/StartScreen';

export function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');

  const handleStart = (name: string) => {
    setPlayerName(name);
    setHasStarted(true);
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  return <GameBoard playerName={playerName} />;
}

export default App;
