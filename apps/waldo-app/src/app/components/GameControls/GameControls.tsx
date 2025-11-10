import styles from './GameControls.module.css';

interface GameControlsProps {
  onSkip: () => void;
  onNext: () => void;
  canSkip: boolean;
  canNext: boolean;
  skipLabel?: string;
  nextLabel?: string;
}

export function GameControls({
  onSkip,
  onNext,
  canSkip,
  canNext,
  skipLabel = 'Skip',
  nextLabel = 'Next Image',
}: GameControlsProps) {
  return (
    <div className={styles.gameControls}>
      <button
        className={`${styles.controlButton} ${styles.skipButton}`}
        onClick={onSkip}
        disabled={!canSkip}
        aria-label="Skip this image"
      >
        {skipLabel}
      </button>
      <button
        className={`${styles.controlButton} ${styles.nextButton}`}
        onClick={onNext}
        disabled={!canNext}
        aria-label="Go to next image"
      >
        {nextLabel}
      </button>
    </div>
  );
}

export default GameControls;
