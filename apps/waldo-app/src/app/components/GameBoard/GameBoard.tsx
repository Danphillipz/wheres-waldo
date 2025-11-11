import { useState, useEffect } from 'react';
import { waldoImages } from '../../utils/imageData';
import { useGameState } from '../../hooks/useGameState';
import { getLeaderboard, updateLeaderboardScore } from '../../utils/leaderboard';
import ImageViewer from '../ImageViewer/ImageViewer';
import GameControls from '../GameControls/GameControls';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import SuccessModal from '../SuccessModal/SuccessModal';
import Leaderboard from '../Leaderboard/Leaderboard';
import ScoreCounter from '../ScoreCounter/ScoreCounter';
import styles from './GameBoard.module.css';

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
  const [leaderboardEntries, setLeaderboardEntries] = useState(getLeaderboard());
  const [scoreAdded, setScoreAdded] = useState(false);

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
    // If this was the last image, advance to completion screen
    if (state.currentImageIndex === waldoImages.length - 1) {
      nextImage();
    }
  };

  const handleRestart = () => {
    reset();
    setShowSuccessModal(false);
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
        <ScoreCounter
          attempts={state.attempts}
          currentGame={state.currentImageIndex + 1}
          totalGames={waldoImages.length}
        />
        <button className={styles.exitButtonHeader} onClick={onExit}>
          Exit
        </button>
      </header>

      <main className={styles.gameMain}>
        <ImageViewer
          image={currentImage}
          onWaldoFound={handleWaldoFound}
          onImageClick={handleImageClick}
          clearMarkers={true}
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
