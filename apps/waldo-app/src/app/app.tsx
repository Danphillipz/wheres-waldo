import { useState } from 'react';
import GameBoard from './components/GameBoard/GameBoard';
import StartScreen from './components/StartScreen/StartScreen';

export function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [playerFirstName, setPlayerFirstName] = useState('');
  const [playerLastName, setPlayerLastName] = useState('');

  const handleStart = (firstName: string, lastName: string) => {
    setPlayerFirstName(firstName);
    setPlayerLastName(lastName);
    setHasStarted(true);
  };

  const handleExit = () => {
    setHasStarted(false);
    setPlayerFirstName('');
    setPlayerLastName('');
  };

  if (!hasStarted) {
    return <StartScreen onStart={handleStart} />;
  }

  const playerName = `${playerFirstName} ${playerLastName}`;
  return (
    <GameBoard
      playerName={playerName}
      playerFirstName={playerFirstName}
      playerLastName={playerLastName}
      onExit={handleExit}
    />
  );
}

export default App;
