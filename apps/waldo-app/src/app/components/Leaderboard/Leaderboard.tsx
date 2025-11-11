import { LeaderboardEntry } from '../../utils/leaderboard';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerName?: string;
}

export function Leaderboard({ entries, currentPlayerName }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className={styles.leaderboard}>
        <h2 className={styles.title}>
          <span role="img" aria-label="trophy">🏆</span> Leaderboard
        </h2>
        <p className={styles.emptyMessage}>Be the first to play!</p>
      </div>
    );
  }

  return (
    <div className={styles.leaderboard}>
      <h2 className={styles.title}>
        <span role="img" aria-label="trophy">🏆</span> Leaderboard
      </h2>
      <div className={styles.entriesContainer}>
        {entries.map((entry, index) => {
          const isCurrentPlayer = currentPlayerName && entry.name === currentPlayerName;
          const isTopThree = index < 3;
          
          return (
            <div
              key={`${entry.name}-${entry.timestamp}`}
              className={`${styles.entry} ${isCurrentPlayer ? styles.currentPlayer : ''} ${isTopThree ? styles.topThree : ''}`}
            >
              <div className={styles.rank}>
                {index === 0 && <span role="img" aria-label="first place">🥇</span>}
                {index === 1 && <span role="img" aria-label="second place">🥈</span>}
                {index === 2 && <span role="img" aria-label="third place">🥉</span>}
                {index > 2 && `#${index + 1}`}
              </div>
              <div className={styles.name}>{entry.name}</div>
              <div className={styles.stats}>
                <span className={styles.score}>{entry.score} attempts</span>
                <span className={styles.found}>{entry.foundImages} Waldo's found</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Leaderboard;
