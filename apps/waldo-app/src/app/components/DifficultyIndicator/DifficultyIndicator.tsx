import { Difficulty } from '../../utils/imageData';
import styles from './DifficultyIndicator.module.css';

interface DifficultyIndicatorProps {
  difficulty: Difficulty;
}

export function DifficultyIndicator({ difficulty }: DifficultyIndicatorProps) {
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
    <div className={`${styles.difficultyIndicator} ${getDifficultyClass()}`}>
      <span className={styles.difficultyIcon}>{getDifficultyIcon()}</span>
      <span className={styles.difficultyText}>Difficulty: {difficulty}</span>
    </div>
  );
}

export default DifficultyIndicator;
