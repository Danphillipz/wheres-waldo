import { useState, useEffect } from 'react';
import { subscribeToLeaderboard, LeaderboardEntry } from '../../utils/firestoreLeaderboard';
import Leaderboard from '../Leaderboard/Leaderboard';
import styles from './StartScreen.module.css';

interface StartScreenProps {
  onStart: (firstName: string, lastName: string) => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

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

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      onStart(firstName.trim(), lastName.trim());
    }
  };

  return (
    <div className={styles.startScreen}>
      {/* Floating Waldos in background */}
      <div className={styles.floatingWaldo} style={{ top: '10%', left: '5%', animationDelay: '0s' }}>
        <div className={styles.waldoCharacter}>
          <div className={styles.waldoHead}>
            <div className={styles.waldoHat}>
              <div className={styles.waldoHatStripe}></div>
            </div>
            <div className={styles.waldoGlasses}></div>
          </div>
          <div className={styles.waldoBody}>
            <div className={styles.waldoStripes}></div>
          </div>
        </div>
      </div>
      <div className={styles.floatingWaldo} style={{ top: '60%', right: '8%', animationDelay: '2s' }}>
        <div className={styles.waldoCharacter}>
          <div className={styles.waldoHead}>
            <div className={styles.waldoHat}>
              <div className={styles.waldoHatStripe}></div>
            </div>
            <div className={styles.waldoGlasses}></div>
          </div>
          <div className={styles.waldoBody}>
            <div className={styles.waldoStripes}></div>
          </div>
        </div>
      </div>
      <div className={styles.floatingWaldo} style={{ bottom: '15%', left: '10%', animationDelay: '4s' }}>
        <div className={styles.waldoCharacter}>
          <div className={styles.waldoHead}>
            <div className={styles.waldoHat}>
              <div className={styles.waldoHatStripe}></div>
            </div>
            <div className={styles.waldoGlasses}></div>
          </div>
          <div className={styles.waldoBody}>
            <div className={styles.waldoStripes}></div>
          </div>
        </div>
      </div>
      <div className={styles.content}>
        <h1 className={styles.title}>
          Where's <span className={styles.strikethrough}>Waldo</span> Amy and Dan?
        </h1>
        
        <p className={styles.description}>
          We hope you're enjoying our day, why not take a few minutes to see if you can find the bride and groom in our version of Where's Waldo?
        </p>

        <div className={styles.howToPlay}>
          <button 
            className={styles.howToPlayToggle}
            onClick={() => setIsHowToPlayOpen(!isHowToPlayOpen)}
            aria-expanded={isHowToPlayOpen}
          >
            <h2 className={styles.howToPlayTitle}>How to Play?</h2>
            <span className={styles.toggleIcon}>{isHowToPlayOpen ? '−' : '+'}</span>
          </button>
          {isHowToPlayOpen && (
            <ol className={styles.instructions}>
              <li>Somewhere in the picture Amy and/or Dan are hiding.</li>
              <li>Zoom in to get a closer look at the picture.</li>
              <li>If you think you've found them, click on their location.</li>
              <li>Try to find them in as few attempts as possible.</li>
              <li>If you've not found them in 5 attempts, game over!</li>
            </ol>
          )}
        </div>

        <form className={styles.nameForm} onSubmit={handleSubmitName}>
          <label htmlFor="firstName" className={styles.nameLabel}>
            Enter Your Name:
          </label>
          <div className={styles.nameInputRow}>
            <input
              type="text"
              id="firstName"
              className={styles.nameInput}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              autoFocus
              required
            />
            <input
              type="text"
              id="lastName"
              className={styles.nameInput}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
            />
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={!firstName.trim() || !lastName.trim()}
          >
            Let's Find Amy and Dan!
          </button>
        </form>

        <button
          type="button"
          className={styles.leaderboardButton}
          onClick={() => setShowLeaderboard(!showLeaderboard)}
        >
          {showLeaderboard ? 'Hide Leaderboard' : '🏆 View Leaderboard'}
        </button>

        {showLeaderboard && (
          <div className={styles.leaderboardSection}>
            <Leaderboard
              entries={leaderboardEntries}
              loading={leaderboardLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default StartScreen;
