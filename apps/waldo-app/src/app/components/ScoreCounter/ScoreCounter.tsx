import styles from './ScoreCounter.module.css';

interface ScoreCounterProps {
  attempts: number;
  currentGame: number;
  totalGames: number;
  onSkip?: () => void;
  canSkip?: boolean;
}

export function ScoreCounter({ 
  attempts, 
  currentGame, 
  totalGames,
  onSkip,
  canSkip = true
}: ScoreCounterProps) {
  return (
    <div className={styles.scoreCounter}>
      <div className={styles.scoreItem}>
        <span className={styles.scoreLabel}>Attempts:</span>
        <span className={styles.scoreValue}>{attempts}</span>
      </div>
      <div className={styles.scoreItem}>
        <span className={styles.scoreLabel}>Game:</span>
        <span className={styles.scoreValue}>{currentGame} of {totalGames}</span>
      </div>
      {onSkip && (
        <button
          className={styles.skipButton}
          onClick={onSkip}
          disabled={!canSkip}
          aria-label="Skip this image"
        >
          Skip
        </button>
      )}
    </div>
  );
}

export default ScoreCounter;
