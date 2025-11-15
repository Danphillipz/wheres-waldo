import { useState, useEffect } from 'react';
import { waldoImages, getCongratulationMessage } from '../../utils/imageData';
import { useGameState } from '../../hooks/useGameState';
import { getLeaderboard, updateLeaderboardScore } from '../../utils/leaderboard';
import ImageViewer from '../ImageViewer/ImageViewer';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import SuccessModal from '../SuccessModal/SuccessModal';
import UnluckyModal from '../UnluckyModal/UnluckyModal';
import Leaderboard from '../Leaderboard/Leaderboard';
import Toolbar from '../Toolbar/Toolbar';
import styles from './GameBoard.module.css';

const MAX_ATTEMPTS_PER_IMAGE = 5;

interface GameBoardProps {
  playerName: string;
  onExit: () => void;
}

export function GameBoard({ playerName, onExit }: GameBoardProps) {
  const {
    state,
    nextImage,
    skipImage,
    foundWaldo,
    recordAttempt,
    reset,
  } = useGameState(waldoImages.length);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUnluckyModal, setShowUnluckyModal] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState(getLeaderboard());
  const [scoreAdded, setScoreAdded] = useState(false);

  const currentImage = waldoImages[state.currentImageIndex];
  const nextImageData = state.currentImageIndex < waldoImages.length - 1 
    ? waldoImages[state.currentImageIndex + 1] 
    : undefined;
  const imageIds = waldoImages.map((img) => img.id);

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

  const handleImageClick = () => {
    recordAttempt();
  };

  const handleSkip = () => {
    skipImage(currentImage.id);
  };

  const handleNext = () => {
    nextImage();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // If this was the last image, advance to completion screen
    if (state.currentImageIndex === waldoImages.length - 1) {
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

  // Add score to leaderboard when game completes
  useEffect(() => {
    if (state.isComplete && playerName && !scoreAdded) {
      updateLeaderboardScore(playerName, state.attempts, state.foundImages.size);
      setLeaderboardEntries(getLeaderboard());
      setScoreAdded(true);
    }
  }, [state.isComplete, playerName, state.attempts, state.foundImages.size, scoreAdded]);

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
        
        <Leaderboard entries={leaderboardEntries} currentPlayerName={playerName} />
        
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
          total={waldoImages.length}
          foundImages={state.foundImages}
          imageIds={imageIds}
        />
        <Toolbar
          attempts={state.currentImageAttempts}
          maxAttempts={MAX_ATTEMPTS_PER_IMAGE}
          currentGame={state.currentImageIndex + 1}
          totalGames={waldoImages.length}
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
        isLastImage={state.currentImageIndex === waldoImages.length - 1}
        message={getCongratulationMessage(currentImage)}
      />

      <UnluckyModal
        isOpen={showUnluckyModal}
        onClose={handleCloseUnluckyModal}
        onNext={handleUnluckyNext}
        isLastImage={state.currentImageIndex === waldoImages.length - 1}
      />
    </div>
  );
}

export default GameBoard;
