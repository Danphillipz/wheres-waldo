import styles from './LoadingSpinner.module.css';

export function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.waldoCharacter}>
          {/* Simple Waldo-inspired character */}
          <div className={styles.waldoHead}>
            <div className={styles.waldoHat}></div>
            <div className={styles.waldoGlasses}></div>
          </div>
          <div className={styles.waldoBody}>
            <div className={styles.waldoStripes}></div>
          </div>
        </div>
      </div>
      <p className={styles.loadingText}>Looking for Waldo...</p>
    </div>
  );
}

export default LoadingSpinner;
