import styles from './ScoreCounter.module.css';

interface ScoreCounterProps {
  attempts: number;
  currentGame: number;
  totalGames: number;
}

export function ScoreCounter({ attempts, currentGame, totalGames }: ScoreCounterProps) {
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
    </div>
  );
}

export default ScoreCounter;
