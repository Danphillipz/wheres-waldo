import { useState, useEffect, useMemo, useCallback } from 'react';
import { waldoImages, getCongratulationMessage, Difficulty } from '../../utils/imageData';
import { useGameState } from '../../hooks/useGameState';
import { getAttemptHistory, addAttempt } from '../../utils/attemptHistory';
import { saveProgress, hasPlayerSubmitted, subscribeToLeaderboard, LeaderboardEntry } from '../../utils/firestoreLeaderboard';
import ImageViewer from '../ImageViewer/ImageViewer';
import ProgressIndicator from '../ProgressIndicator/ProgressIndicator';
import SuccessModal from '../SuccessModal/SuccessModal';
import UnluckyModal from '../UnluckyModal/UnluckyModal';
import AttemptHistory from '../AttemptHistory/AttemptHistory';
import Leaderboard from '../Leaderboard/Leaderboard';
import Toolbar from '../Toolbar/Toolbar';
import styles from './GameBoard.module.css';

const MAX_ATTEMPTS_PER_IMAGE = 5;

interface GameBoardProps {
  playerName: string;
  playerFirstName: string;
  playerLastName: string;
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

export function GameBoard({ playerName, playerFirstName, playerLastName, onExit }: GameBoardProps) {
  // Memoize the organized images so they don't shuffle on every render
  const organizedImages = useMemo(() => organizeImages(), []);
  
  const {
    state,
    nextImage,
    skipImage,
    foundWaldo,
    recordAttempt,
    recordHint,
    reset,
  } = useGameState(organizedImages.length);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUnluckyModal, setShowUnluckyModal] = useState(false);
  const [attemptEntries, setAttemptEntries] = useState(getAttemptHistory());
  const [scoreAdded, setScoreAdded] = useState(false);
  const [hintRequested, setHintRequested] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [hasExistingEntry, setHasExistingEntry] = useState<boolean | null>(null);

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

  const handleHint = useCallback(() => {
    if (!hintRequested) {
      recordHint();
      setHintRequested(true);
    }
  }, [hintRequested, recordHint]);

  const handleHintAnimationComplete = useCallback(() => {
    setHintRequested(false);
  }, []);

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
    setHintRequested(false);
    setAlreadySubmitted(false);
  };

  // Check if player already has a leaderboard entry
  useEffect(() => {
    hasPlayerSubmitted(playerFirstName, playerLastName).then((submitted) => {
      setHasExistingEntry(submitted);
    });
  }, [playerFirstName, playerLastName]);

  // Save progress to cloud leaderboard after each image is completed
  const imagesAttempted = state.foundImages.size + state.skippedImages.size;
  useEffect(() => {
    if (imagesAttempted > 0 && playerName && hasExistingEntry === false) {
      saveProgress({
        name: playerName,
        firstName: playerFirstName,
        lastName: playerLastName,
        score: state.attempts,
        foundImages: state.foundImages.size,
        totalImages: imagesAttempted,
        hintsUsed: state.hintsUsed,
      });
    }
  }, [imagesAttempted, playerName, playerFirstName, playerLastName, hasExistingEntry, state.attempts, state.foundImages.size, state.hintsUsed]);

  // Subscribe to cloud leaderboard
  useEffect(() => {
    const unsubscribe = subscribeToLeaderboard((entries) => {
      setLeaderboardEntries(entries);
      setLeaderboardLoading(false);
    });
    if (!unsubscribe) {
      setLeaderboardLoading(false);
    }
    return () => unsubscribe?.();
  }, []);

  // Add attempt to local history when game completes
  useEffect(() => {
    if (state.isComplete && playerName && !scoreAdded) {
      addAttempt({
        name: playerName,
        score: state.attempts,
        foundImages: state.foundImages.size,
        totalImages: state.foundImages.size + state.skippedImages.size,
        hintsUsed: state.hintsUsed,
      });
      setAttemptEntries(getAttemptHistory());

      if (hasExistingEntry) {
        setAlreadySubmitted(true);
      }

      setScoreAdded(true);
    }
  }, [state.isComplete, playerName, state.attempts, state.foundImages.size, state.skippedImages.size, state.hintsUsed, scoreAdded, hasExistingEntry]);

  if (state.isComplete) {
    return (
      <div className={styles.completionScreen}>
        <div className={styles.floatingWaldo} style={{ top: '10%', left: '5%', animationDelay: '0s' }}>
          <div className={styles.waldoCharacter}>
            <div className={styles.waldoHead}>
              <div className={styles.waldoHat}><div className={styles.waldoHatStripe}></div></div>
              <div className={styles.waldoGlasses}></div>
            </div>
            <div className={styles.waldoBody}><div className={styles.waldoStripes}></div></div>
          </div>
        </div>
        <div className={styles.floatingWaldo} style={{ top: '60%', right: '8%', animationDelay: '2s' }}>
          <div className={styles.waldoCharacter}>
            <div className={styles.waldoHead}>
              <div className={styles.waldoHat}><div className={styles.waldoHatStripe}></div></div>
              <div className={styles.waldoGlasses}></div>
            </div>
            <div className={styles.waldoBody}><div className={styles.waldoStripes}></div></div>
          </div>
        </div>
        <div className={styles.floatingWaldo} style={{ bottom: '15%', left: '10%', animationDelay: '4s' }}>
          <div className={styles.waldoCharacter}>
            <div className={styles.waldoHead}>
              <div className={styles.waldoHat}><div className={styles.waldoHatStripe}></div></div>
              <div className={styles.waldoGlasses}></div>
            </div>
            <div className={styles.waldoBody}><div className={styles.waldoStripes}></div></div>
          </div>
        </div>
        <h1 className={styles.completionTitle}>
          Game Complete!
        </h1>
        <p className={styles.completionMessage}>
          You've completed all {organizedImages.length} images!
        </p>
        <div className={styles.completionStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Times Found Amy or Dan:</span>
            <span className={styles.statValue}>{state.foundImages.size}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Times Not Found Either:</span>
            <span className={styles.statValue}>{state.skippedImages.size}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Misses:</span>
            <span className={styles.statValue}>{state.attempts}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Hints Used:</span>
            <span className={styles.statValue}>{state.hintsUsed}</span>
          </div>
        </div>
        
        {alreadySubmitted && (
          <p className={styles.alreadySubmittedMessage}>
            Only your first attempt counted for the leaderboard!
          </p>
        )}

        <Leaderboard
          entries={leaderboardEntries}
          currentPlayerName={playerName}
          loading={leaderboardLoading}
        />

        <div className={styles.attemptHistoryWrapper}>
          <AttemptHistory entries={attemptEntries} currentPlayerName={playerName} />
        </div>
        
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
          onHint={handleHint}
          hintDisabled={hintRequested}
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
          hintRequested={hintRequested}
          onHintAnimationComplete={handleHintAnimationComplete}
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
