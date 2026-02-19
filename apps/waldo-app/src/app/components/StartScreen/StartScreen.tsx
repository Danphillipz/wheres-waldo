import { useState, useEffect } from 'react';
import styles from './StartScreen.module.css';

interface StartScreenProps {
  onStart: (playerName: string) => void;
}

function getWeddingCountdown() {
  const weddingDate = new Date('2026-07-11T14:00:00');
  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [playerName, setPlayerName] = useState('');
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [countdown, setCountdown] = useState(getWeddingCountdown());

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getWeddingCountdown());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmitName = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onStart(playerName.trim());
    }
  };

  return (
    <div className={styles.startScreen}>
      {/* Floating decorative elements */}
      <div className={styles.floatingElement} style={{ top: '8%', left: '5%', animationDelay: '0s' }}>
        <span className={styles.floatingHeart}>♥</span>
      </div>
      <div className={styles.floatingElement} style={{ top: '15%', right: '10%', animationDelay: '3s' }}>
        <span className={styles.floatingRing} role="img" aria-label="ring">💍</span>
      </div>
      <div className={styles.floatingElement} style={{ bottom: '20%', left: '8%', animationDelay: '6s' }}>
        <span className={styles.floatingHeart}>♥</span>
      </div>
      <div className={styles.floatingElement} style={{ top: '45%', right: '5%', animationDelay: '1.5s' }}>
        <span className={styles.floatingFlower}>✿</span>
      </div>
      <div className={styles.floatingElement} style={{ bottom: '10%', right: '15%', animationDelay: '4.5s' }}>
        <span className={styles.floatingHeart}>♥</span>
      </div>

      <div className={styles.content}>
        <div className={styles.monogram}>A &amp; D</div>
        <div className={styles.divider}>
          <span className={styles.dividerLine}></span>
          <span className={styles.dividerIcon}>♥</span>
          <span className={styles.dividerLine}></span>
        </div>
        <h1 className={styles.title}>
          Where's <span className={styles.strikethrough}>Waldo</span> Amy &amp; Dan?
        </h1>
        
        <p className={styles.description}>
          We hope you're enjoying our day! Why not take a few minutes to see if you can find the bride and groom hiding in our photos?
        </p>

        {countdown && (
          <div className={styles.countdown}>
            <p className={styles.countdownLabel}>Counting down to the big day</p>
            <div className={styles.countdownTimer}>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{countdown.days}</span>
                <span className={styles.countdownText}>Days</span>
              </div>
              <span className={styles.countdownSeparator}>·</span>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{countdown.hours}</span>
                <span className={styles.countdownText}>Hours</span>
              </div>
              <span className={styles.countdownSeparator}>·</span>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{countdown.minutes}</span>
                <span className={styles.countdownText}>Min</span>
              </div>
              <span className={styles.countdownSeparator}>·</span>
              <div className={styles.countdownUnit}>
                <span className={styles.countdownNumber}>{countdown.seconds}</span>
                <span className={styles.countdownText}>Sec</span>
              </div>
            </div>
          </div>
        )}

        <div className={styles.howToPlay}>
          <button 
            className={styles.howToPlayToggle}
            onClick={() => setIsHowToPlayOpen(!isHowToPlayOpen)}
            aria-expanded={isHowToPlayOpen}
          >
            <h2 className={styles.howToPlayTitle}>How to Play</h2>
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
          <label htmlFor="playerName" className={styles.nameLabel}>
            Enter Your Name
          </label>
          <input
            type="text"
            id="playerName"
            className={styles.nameInput}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            autoFocus
            required
          />
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={!playerName.trim()}
          >
            Start the Search ♥
          </button>
        </form>
      </div>
    </div>
  );
}

export default StartScreen;
