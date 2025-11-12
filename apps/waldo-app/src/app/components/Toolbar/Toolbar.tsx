import styles from './Toolbar.module.css';

interface ToolbarProps {
  attempts: number;
  currentGame: number;
  totalGames: number;
  onSkip?: () => void;
  canSkip?: boolean;
  onExit: () => void;
}

export function Toolbar({ 
  attempts, 
  currentGame, 
  totalGames,
  onSkip,
  canSkip = true,
  onExit
}: ToolbarProps) {
  return (
    <div className={styles.toolbar}>
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
      <button
        className={styles.exitButton}
        onClick={onExit}
        aria-label="Exit game"
      >
        Exit
      </button>
    </div>
  );
}

export default Toolbar;
