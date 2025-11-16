import { useEffect, useRef } from 'react';
import styles from './SuccessModal.module.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  isLastImage: boolean;
  message?: string; // Custom congratulation message
}

export function SuccessModal({
  isOpen,
  onClose,
  onNext,
  isLastImage,
  message = 'Congratulations!',
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
      {/* Firework animations */}
      <div className={styles.firework} style={{ left: '20%', top: '20%', animationDelay: '0s' }}></div>
      <div className={styles.firework} style={{ left: '80%', top: '30%', animationDelay: '0.3s' }}></div>
      <div className={styles.firework} style={{ left: '50%', top: '10%', animationDelay: '0.6s' }}></div>
      <div className={styles.firework} style={{ left: '10%', top: '60%', animationDelay: '0.9s' }}></div>
      <div className={styles.firework} style={{ left: '90%', top: '70%', animationDelay: '1.2s' }}></div>
      
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h2 id="modal-title" className={styles.modalTitle}>
          {message}
        </h2>
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
