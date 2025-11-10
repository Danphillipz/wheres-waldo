import { useState } from 'react';
import { waldoImages } from '../../utils/imageData';
import { useGameState } from '../../hooks/useGameState';
import ImageViewer from '../ImageViewer/ImageViewer';
import GameControls from '../GameControls/GameControls';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import SuccessModal from '../SuccessModal/SuccessModal';
import styles from './GameBoard.module.css';

export function GameBoard() {
  const {
    state,
    nextImage,
    skipImage,
    foundWaldo,
    recordAttempt,
    reset,
  } = useGameState(waldoImages.length);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const currentImage = waldoImages[state.currentImageIndex];
  const imageIds = waldoImages.map((img) => img.id);

  const handleWaldoFound = () => {
    foundWaldo(currentImage.id);
    setShowSuccessModal(true);
  };

  const handleImageClick = () => {
    recordAttempt();
  };

  const handleSkip = () => {
    skipImage(currentImage.id);
  };

  const handleNext = () => {
    nextImage();
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const handleRestart = () => {
    reset();
    setShowSuccessModal(false);
  };

  if (state.isComplete) {
    return (
      <div className={styles.completionScreen}>
        <h1 className={styles.completionTitle}>
          <span role="img" aria-label="celebration">
            🎉
          </span>{' '}
          Game Complete!{' '}
          <span role="img" aria-label="celebration">
            🎉
          </span>
        </h1>
        <p className={styles.completionMessage}>
          You've completed all {waldoImages.length} images!
        </p>
        <div className={styles.completionStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Images Found:</span>
            <span className={styles.statValue}>{state.foundImages.size}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Images Skipped:</span>
            <span className={styles.statValue}>{state.skippedImages.size}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Attempts:</span>
            <span className={styles.statValue}>{state.attempts}</span>
          </div>
        </div>
        <button className={styles.restartButton} onClick={handleRestart}>
          Play Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.gameBoard}>
      <header className={styles.gameHeader}>
        <h1 className={styles.gameTitle}>Where's Waldo?</h1>
        <ProgressIndicator
          currentIndex={state.currentImageIndex}
          total={waldoImages.length}
          foundImages={state.foundImages}
          imageIds={imageIds}
        />
      </header>

      <main className={styles.gameMain}>
        <ImageViewer
          image={currentImage}
          onWaldoFound={handleWaldoFound}
          onImageClick={handleImageClick}
        />
      </main>

      <footer className={styles.gameFooter}>
        <GameControls
          onSkip={handleSkip}
          onNext={handleNext}
          canSkip={!state.isComplete}
          canNext={!state.isComplete}
        />
      </footer>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseModal}
        onNext={handleNext}
        isLastImage={state.currentImageIndex === waldoImages.length - 1}
      />
    </div>
  );
}

export default GameBoard;
