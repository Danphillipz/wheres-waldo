import { LeaderboardEntry } from '../../utils/firestoreLeaderboard';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import styles from './Leaderboard.module.css';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerName?: string;
  loading?: boolean;
}

const MEDALS = ['🥇', '🥈', '🥉'];

export function Leaderboard({
  entries,
  currentPlayerName,
  loading,
}: LeaderboardProps) {
  if (loading) {
    return (
      <div className={styles.leaderboard}>
        <h2 className={styles.title}>
          <span role="img" aria-label="trophy">🏆</span> Leaderboard
        </h2>
        <LoadingSpinner />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className={styles.leaderboard}>
        <h2 className={styles.title}>
          <span role="img" aria-label="trophy">🏆</span> Leaderboard
        </h2>
        <p className={styles.emptyMessage}>
          No scores yet — be the first to play!
        </p>
      </div>
    );
  }

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const currentNameLower = currentPlayerName?.trim().toLowerCase();

  return (
    <div className={styles.leaderboard}>
      <h2 className={styles.title}>
        <span role="img" aria-label="trophy">🏆</span> Leaderboard
      </h2>

      <div className={styles.podium}>
        {podium.map((entry, index) => {
          const isCurrentPlayer =
            currentNameLower === entry.name.trim().toLowerCase();
          return (
            <div
              key={entry.name}
              className={`${styles.podiumEntry} ${isCurrentPlayer ? styles.currentPlayer : ''}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <span className={styles.medal}>{MEDALS[index]}</span>
              <div className={styles.podiumDetails}>
                <span className={styles.podiumName}>{entry.name}</span>
                <span className={styles.podiumStats}>
                  {entry.foundImages}/{entry.totalImages} found · {entry.score} misses
                  {entry.hintsUsed > 0 && ` · 💡${entry.hintsUsed}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className={styles.restList}>
          {rest.map((entry, index) => {
            const rank = index + 4;
            const isCurrentPlayer =
              currentNameLower === entry.name.trim().toLowerCase();
            return (
              <div
                key={entry.name}
                className={`${styles.restEntry} ${isCurrentPlayer ? styles.currentPlayer : ''}`}
              >
                <span className={styles.rank}>{rank}</span>
                <span className={styles.restName}>{entry.name}</span>
                <span className={styles.restStats}>
                  {entry.foundImages}/{entry.totalImages} · {entry.score} miss.
                  {entry.hintsUsed > 0 && ` · 💡${entry.hintsUsed}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Leaderboard;
