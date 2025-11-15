import { useState } from 'react';
import styles from './StartScreen.module.css';

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStart(playerName.trim());
    }
  };

  return (
    <div className={styles.startScreen}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Where's <span className={styles.strikethrough}>Waldo</span> Amy and Dan?
        </h1>
        
        <p className={styles.description}>
          We hope you're enjoying our day, why not take a few minutes to see if you can find the bride and groom in our version of Where's Waldo?
        </p>

        <div className={styles.howToPlay}>
          <button 
            className={styles.howToPlayToggle}
            onClick={() => setIsHowToPlayOpen(!isHowToPlayOpen)}
            aria-expanded={isHowToPlayOpen}
          >
            <h2 className={styles.howToPlayTitle}>How to Play?</h2>
            <span className={styles.toggleIcon}>{isHowToPlayOpen ? '−' : '+'}</span>
          </button>
          {isHowToPlayOpen && (
            <ol className={styles.instructions}>
              <li>Somewhere in the picture Amy and/or Dan are hiding.</li>
              <li>Zoom in to get a closer look at the picture.</li>
              <li>If you think you've found them, click on their location.</li>
              <li>Try to find them in as few attempts as possible.</li>
              <li>If you've not found them in 5 attempts, game over!</li>
            </ol>
          )}
        </div>

        <form className={styles.nameForm} onSubmit={handleSubmitName}>
          <label htmlFor="playerName" className={styles.nameLabel}>
            Enter Your Name:
          </label>
          <input
            type="text"
            id="playerName"
            className={styles.nameInput}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            autoFocus
            required
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!playerName.trim()}
          >
            Let's Find Waldo!
          </button>
        </form>
      </div>
    </div>
  );
}

export default StartScreen;
