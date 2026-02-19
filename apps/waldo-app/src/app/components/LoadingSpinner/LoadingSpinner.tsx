import styles from './LoadingSpinner.module.css';

export function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <span className={styles.heartIcon}>♥</span>
      </div>
      <p className={styles.loadingText}>Finding the happy couple...</p>
    </div>
  );
}

export default LoadingSpinner;
