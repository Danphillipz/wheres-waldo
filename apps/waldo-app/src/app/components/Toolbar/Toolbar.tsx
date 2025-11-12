import { Difficulty } from '../../utils/imageData';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  attempts: number;
  maxAttempts: number;
  currentGame: number;
  totalGames: number;
  difficulty: Difficulty;
  onSkip?: () => void;
  canSkip?: boolean;
  onExit: () => void;
}

export function Toolbar({ 
  attempts,
  maxAttempts,
  currentGame, 
  totalGames,
  difficulty,
  onSkip,
  canSkip = true,
  onExit
}: ToolbarProps) {
  const attemptsRemaining = maxAttempts - attempts;
  
  const getDifficultyClass = () => {
    switch (difficulty) {
      case Difficulty.Easy:
        return styles.easy;
      case Difficulty.Hard:
        return styles.hard;
      case Difficulty.ReallyHard:
        return styles.reallyHard;
      default:
        return styles.easy;
    }
  };

  const getDifficultyIcon = () => {
    switch (difficulty) {
      case Difficulty.Easy:
        return '⭐';
      case Difficulty.Hard:
        return '⭐⭐';
      case Difficulty.ReallyHard:
        return '⭐⭐⭐';
      default:
        return '⭐';
    }
  };

  return (
    <div className={styles.toolbar}>
      {/* Difficulty Indicator - leftmost */}
      <div className={`${styles.difficultyIndicator} ${getDifficultyClass()}`}>
        <span className={styles.difficultyIcon}>{getDifficultyIcon()}</span>
        <span className={styles.difficultyText}>Difficulty: {difficulty}</span>
      </div>

      {/* Attempts Remaining with Waldo avatars */}
      <div className={styles.attemptsRemaining}>
        {Array.from({ length: maxAttempts }).map((_, index) => (
          <div
            key={index}
            className={`${styles.waldoAvatar} ${index >= attemptsRemaining ? styles.waldoAvatarUsed : ''}`}
          >
            <div className={styles.miniWaldoHead}>
              <div className={styles.miniWaldoHat}></div>
              <div className={styles.miniWaldoGlasses}></div>
            </div>
            <div className={styles.miniWaldoBody}>
              <div className={styles.miniWaldoStripes}></div>
            </div>
          </div>
        ))}
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
