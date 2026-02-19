import { useState, useEffect, useMemo, useCallback } from 'react';
import { waldoImages, getCongratulationMessage, Difficulty } from '../../utils/imageData';
import { useGameState } from '../../hooks/useGameState';
import { getAttemptHistory, addAttempt } from '../../utils/attemptHistory';
import ImageViewer from '../ImageViewer/ImageViewer';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import SuccessModal from '../SuccessModal/SuccessModal';
import UnluckyModal from '../UnluckyModal/UnluckyModal';
import AttemptHistory from '../AttemptHistory/AttemptHistory';
import Toolbar from '../Toolbar/Toolbar';
import styles from './GameBoard.module.css';

const MAX_ATTEMPTS_PER_IMAGE = 5;

interface GameBoardProps {
  playerName: string;
  onExit: () => void;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Organize images with Practice images first, then randomized others
 */
function organizeImages() {
  const practiceImages = waldoImages.filter(img => img.difficulty === Difficulty.Practice);
  const otherImages = waldoImages.filter(img => img.difficulty !== Difficulty.Practice);
  const shuffledOthers = shuffleArray(otherImages);
  return [...practiceImages, ...shuffledOthers];
}

export function GameBoard({ playerName, onExit }: GameBoardProps) {
  // Memoize the organized images so they don't shuffle on every render
  const organizedImages = useMemo(() => organizeImages(), []);
  
  const {
    state,
    nextImage,
    skipImage,
    foundWaldo,
    recordAttempt,
    reset,
  } = useGameState(organizedImages.length);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUnluckyModal, setShowUnluckyModal] = useState(false);
  const [attemptEntries, setAttemptEntries] = useState(getAttemptHistory());
  const [scoreAdded, setScoreAdded] = useState(false);

  const currentImage = organizedImages[state.currentImageIndex];
  const nextImageData = state.currentImageIndex < organizedImages.length - 1 
    ? organizedImages[state.currentImageIndex + 1] 
    : undefined;
  const imageIds = useMemo(() => organizedImages.map((img) => img.id), [organizedImages]);

  // Check if max attempts reached
  useEffect(() => {
    if (state.currentImageAttempts >= MAX_ATTEMPTS_PER_IMAGE && !showSuccessModal) {
      setShowUnluckyModal(true);
    }
  }, [state.currentImageAttempts, showSuccessModal]);

  const handleWaldoFound = () => {
    foundWaldo(currentImage.id);
    setShowSuccessModal(true);
  };

  const handleImageClick = useCallback(() => {
    recordAttempt();
  }, [recordAttempt]);

  const handleSkip = () => {
    skipImage(currentImage.id);
  };

  const handleNext = () => {
    nextImage();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // If this was the last image, advance to completion screen
    if (state.currentImageIndex === organizedImages.length - 1) {
      nextImage();
    }
  };

  const handleCloseUnluckyModal = () => {
    setShowUnluckyModal(false);
  };

  const handleUnluckyNext = () => {
    skipImage(currentImage.id);
    setShowUnluckyModal(false);
  };

  const handleRestart = () => {
    reset();
    setShowSuccessModal(false);
    setShowUnluckyModal(false);
    setScoreAdded(false);
  };

  // Add attempt to history when game completes
  useEffect(() => {
    if (state.isComplete && playerName && !scoreAdded) {
      addAttempt({
        name: playerName,
        score: state.attempts,
        foundImages: state.foundImages.size,
        totalImages: organizedImages.length,
      });
      setAttemptEntries(getAttemptHistory());
      setScoreAdded(true);
    }
  }, [state.isComplete, playerName, state.attempts, state.foundImages.size, scoreAdded, organizedImages.length]);

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
          You've completed all {organizedImages.length} images!
        </p>
        <div className={styles.completionStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Waldos Found:</span>
            <span className={styles.statValue}>{state.foundImages.size}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Waldos Missed:</span>
            <span className={styles.statValue}>{state.skippedImages.size}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Attempts:</span>
            <span className={styles.statValue}>{state.attempts}</span>
          </div>
        </div>
        
        <AttemptHistory entries={attemptEntries} currentPlayerName={playerName} />
        
        <div className={styles.buttonGroup}>
          <button className={styles.restartButton} onClick={handleRestart}>
            Play Again
          </button>
          <button className={styles.exitButton} onClick={onExit}>
            Exit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gameBoard}>
      <header className={styles.gameHeader}>
        <h1 className={styles.gameTitle}>Where's Amy and Dan?</h1>
        <ProgressIndicator
          currentIndex={state.currentImageIndex}
          total={organizedImages.length}
          foundImages={state.foundImages}
          imageIds={imageIds}
        />
        <Toolbar
          attempts={state.currentImageAttempts}
          maxAttempts={MAX_ATTEMPTS_PER_IMAGE}
          currentGame={state.currentImageIndex + 1}
          totalGames={organizedImages.length}
          difficulty={currentImage.difficulty}
          onSkip={handleSkip}
          canSkip={!state.isComplete && state.currentImageAttempts < MAX_ATTEMPTS_PER_IMAGE}
          onExit={onExit}
        />
      </header>

      <main className={styles.gameMain}>
        <ImageViewer
          image={currentImage}
          nextImage={nextImageData}
          onWaldoFound={handleWaldoFound}
          onImageClick={handleImageClick}
          clearMarkers={true}
        />
      </main>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleCloseSuccessModal}
        onNext={handleNext}
        isLastImage={state.currentImageIndex === organizedImages.length - 1}
        message={getCongratulationMessage(currentImage)}
      />

      <UnluckyModal
        isOpen={showUnluckyModal}
        onClose={handleCloseUnluckyModal}
        onNext={handleUnluckyNext}
        isLastImage={state.currentImageIndex === organizedImages.length - 1}
      />
    </div>
  );
}

export default GameBoard;
