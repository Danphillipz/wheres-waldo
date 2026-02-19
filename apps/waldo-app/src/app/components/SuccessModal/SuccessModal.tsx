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
  message = 'You found them!',
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
      {/* Floating hearts animation */}
      {Array.from({ length: 12 }).map((_, i) => (
        <span
          key={i}
          className={styles.floatingHeart}
          style={{
            left: `${8 + Math.random() * 84}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2.5 + Math.random() * 2}s`,
            fontSize: `${1 + Math.random() * 1.5}rem`,
            opacity: 0.4 + Math.random() * 0.4,
          }}
        >
          ♥
        </span>
      ))}
      
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.successIcon}>♥</div>
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
              See Results
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
            Next Image →
          </button>
        )}
      </div>
    </div>
  );
}

export default SuccessModal;
