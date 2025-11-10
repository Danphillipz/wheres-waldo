import { useEffect, useRef } from 'react';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  isLastImage: boolean;
}

export function SuccessModal({
  isOpen,
  onClose,
  onNext,
  isLastImage,
}: SuccessModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className={styles.modalTitle}>
          <span role="img" aria-label="celebration">
            🎉
          </span>{' '}
          Congratulations!{' '}
          <span role="img" aria-label="celebration">
            🎉
          </span>
        </h2>
        <p className={styles.modalMessage}>You found Waldo!</p>
        {isLastImage ? (
          <>
            <p className={styles.modalSubtext}>
              You've completed all the images!
            </p>
            <button
              ref={closeButtonRef}
              className={styles.modalButton}
              onClick={onClose}
            >
              Close
            </button>
          </>
        ) : (
          <button
            ref={closeButtonRef}
            className={styles.modalButton}
            onClick={() => {
              onClose();
              onNext();
            }}
          >
            Next Image
          </button>
        )}
      </div>
    </div>
  );
}

export default SuccessModal;
