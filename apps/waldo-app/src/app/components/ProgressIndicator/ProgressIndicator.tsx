import styles from './ProgressIndicator.module.css';

interface ProgressIndicatorProps {
  currentIndex: number;
  total: number;
  foundImages: Set<string>;
  imageIds: string[];
}

export function ProgressIndicator({
  currentIndex,
  total,
  foundImages,
  imageIds,
}: ProgressIndicatorProps) {
  return (
    <div className={styles.progressIndicator}>
      <div className={styles.progressText}>
        Image {currentIndex + 1} of {total}
      </div>
      <div className={styles.progressDots}>
        {imageIds.map((id, index) => (
          <span
            key={id}
            className={`${styles.progressDot} ${
              index === currentIndex ? styles.current : ''
            } ${foundImages.has(id) ? styles.found : ''}`}
            aria-label={`Image ${index + 1}${
              foundImages.has(id) ? ' - Waldo found' : ''
            }${index === currentIndex ? ' - current' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

export default ProgressIndicator;
