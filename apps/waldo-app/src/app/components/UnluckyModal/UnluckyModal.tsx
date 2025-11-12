import { useEffect } from 'react';
import styles from './UnluckyModal.module.css';

interface UnluckyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  isLastImage: boolean;
}

export function UnluckyModal({
  isOpen,
  onClose,
  onNext,
  isLastImage,
}: UnluckyModalProps) {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleNext = () => {
    onNext();
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <span role="img" aria-label="disappointed">
              😔
            </span>
          </h2>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.unluckyMessage}>
            Unlucky, you didn't find Waldo!
          </p>
          <p className={styles.encouragementMessage}>
            Better luck on the next one!
          </p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.nextButton} onClick={handleNext}>
            {isLastImage ? 'Finish Game' : 'Next Image'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UnluckyModal;
