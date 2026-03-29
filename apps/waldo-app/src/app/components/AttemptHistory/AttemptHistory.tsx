import { AttemptEntry } from '../../utils/attemptHistory';
import styles from './AttemptHistory.module.css';

interface AttemptHistoryProps {
  entries: AttemptEntry[];
  currentPlayerName?: string;
}

export function AttemptHistory({
  entries,
  currentPlayerName,
}: AttemptHistoryProps) {
  const playerEntries = currentPlayerName
    ? entries.filter((entry) => entry.name === currentPlayerName)
    : entries;

  if (playerEntries.length === 0) {
    return (
      <div className={styles.attemptHistory}>
        <h2 className={styles.title}>
          <span role="img" aria-label="notepad">
            📋
          </span>{' '}
          Your Attempts
        </h2>
        <p className={styles.emptyMessage}>
          No attempts yet — play a game to see your history!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.attemptHistory}>
      <h2 className={styles.title}>
        <span role="img" aria-label="notepad">
          📋
        </span>{' '}
        Your Attempts
      </h2>
      <div className={styles.entriesContainer}>
        {playerEntries.map((entry, index) => {
          const isLatest = index === 0;
          const date = new Date(entry.timestamp);
          const formattedDate = date.toLocaleDateString(undefined, {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={entry.timestamp}
              className={`${styles.entry} ${isLatest ? styles.latest : ''}`}
            >
              <div className={styles.attemptNumber}>
                {isLatest ? (
                  <span role="img" aria-label="new">
                    🆕
                  </span>
                ) : (
                  `#${index + 1}`
                )}
              </div>
              <div className={styles.details}>
                <div className={styles.name}>{entry.name}</div>
                <div className={styles.date}>{formattedDate}</div>
              </div>
              <div className={styles.stats}>
                <span className={styles.score}>{entry.score} misses</span>
                <span className={styles.found}>
                  {entry.foundImages}/{entry.totalImages} found
                </span>
                {(entry.hintsUsed ?? 0) > 0 && (
                  <span className={styles.hints}><span role="img" aria-label="lightbulb">💡</span> {entry.hintsUsed} hints</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AttemptHistory;
