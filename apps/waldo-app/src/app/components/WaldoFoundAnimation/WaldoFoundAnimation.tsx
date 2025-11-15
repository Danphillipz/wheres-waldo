import { useEffect, useState } from 'react';
import styles from './WaldoFoundAnimation.module.css';

interface WaldoFoundAnimationProps {
  targetX: number; // Percentage (0-100)
  targetY: number; // Percentage (0-100)
  onComplete: () => void;
}

export function WaldoFoundAnimation({
  targetX,
  targetY,
  onComplete,
}: WaldoFoundAnimationProps) {
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    // Create fireworks at random positions around the target
    const createFireworks = () => {
      const newFireworks = [];
      for (let i = 0; i < 8; i++) {
        // Spread fireworks around the target location
        const offsetX = (Math.random() - 0.5) * 20; // ±10% offset
        const offsetY = (Math.random() - 0.5) * 20; // ±10% offset
        newFireworks.push({
          id: i,
          x: targetX + offsetX,
          y: targetY + offsetY,
        });
      }
      setFireworks(newFireworks);
    };

    createFireworks();

    // Complete animation after 2 seconds
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [targetX, targetY, onComplete]);

  return (
    <div className={styles.animationOverlay}>
      {/* Zoom focus indicator at target location */}
      <div
        className={styles.zoomIndicator}
        style={{
          left: `${targetX}%`,
          top: `${targetY}%`,
        }}
      >
        <div className={styles.zoomRing} />
        <div className={styles.zoomRing} style={{ animationDelay: '0.2s' }} />
        <div className={styles.zoomRing} style={{ animationDelay: '0.4s' }} />
      </div>

      {/* Fireworks particles */}
      {fireworks.map((firework) => (
        <div
          key={firework.id}
          className={styles.firework}
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            animationDelay: `${firework.id * 0.1}s`,
          }}
        >
          {/* Create star burst effect */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((particleIndex) => (
            <div
              key={particleIndex}
              className={styles.particle}
              style={{
                transform: `rotate(${particleIndex * 45}deg)`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Success message */}
      <div className={styles.successMessage}>
        <span role="img" aria-label="celebration" className={styles.successIcon}>🎉</span>
        <span className={styles.successText}>Found!</span>
        <span role="img" aria-label="celebration" className={styles.successIcon}>🎉</span>
      </div>
    </div>
  );
}

export default WaldoFoundAnimation;
