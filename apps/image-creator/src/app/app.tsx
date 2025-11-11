import { useState, useRef } from 'react';
import { 
  isClickNearTarget,
  percentToPixels,
  WaldoImage
} from '@wheres-waldo/shared-ui';
import styles from './app.module.css';

interface WaldoPosition {
  x: number;
  y: number;
  tolerance: number;
}

export function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [waldoPosition, setWaldoPosition] = useState<WaldoPosition | null>(null);
  const [imageOrientation, setImageOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [imageName, setImageName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setWaldoPosition(null);
      setImageName(file.name.replace(/\.[^/.]+$/, '')); // Remove file extension
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const imgElement = imageRef.current;
    if (!imgElement) return;

    const rect = imgElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to percentage
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    setWaldoPosition({
      x: Math.max(0, Math.min(100, xPercent)),
      y: Math.max(0, Math.min(100, yPercent)),
      tolerance: 30, // Default tolerance
    });
  };

  const handleConfirm = () => {
    if (!waldoPosition || !imageName) return;

    // Create the image data object
    const imageData: WaldoImage = {
      id: `image-${Date.now()}`,
      src: `/images/${imageName}.svg`, // This would need to be adjusted
      alt: `Find Amy and Dan in this ${imageOrientation} scene!`,
      waldoLocation: waldoPosition,
      orientation: imageOrientation,
    };

    // Generate the code snippet
    const codeSnippet = `{
  id: '${imageData.id}',
  src: '\${BASE_URL}images/${imageName}.svg',
  alt: '${imageData.alt}',
  waldoLocation: { x: ${waldoPosition.x.toFixed(2)}, y: ${waldoPosition.y.toFixed(2)}, tolerance: ${waldoPosition.tolerance} },
  orientation: '${imageOrientation}',
},`;

    // Display the code
    alert(`Copy this code to add to imageData.ts:\n\n${codeSnippet}\n\nDon't forget to save the image file to apps/waldo-app/public/images/${imageName}.svg`);
    
    // Download the position data as JSON
    const dataStr = JSON.stringify(imageData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${imageName}-data.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setWaldoPosition(null);
    setImageName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getWaldoPixelPosition = () => {
    if (!waldoPosition || !imageRef.current) return null;
    const rect = imageRef.current.getBoundingClientRect();
    return percentToPixels(waldoPosition, rect.width, rect.height);
  };

  const waldoPixels = getWaldoPixelPosition();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>Where's Waldo - Image Creator Tool</h1>
        <p className={styles.subtitle}>Upload an image and click where Waldo is located</p>
      </header>

      <main className={styles.main}>
        {!selectedImage ? (
          <div className={styles.uploadSection}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.fileInput}
              id="file-upload"
            />
            <label htmlFor="file-upload" className={styles.uploadButton}>
              Choose Image File
            </label>
            <p className={styles.hint}>Select an SVG or image file to begin</p>
          </div>
        ) : (
          <div className={styles.editorSection}>
            <div className={styles.controls}>
              <div className={styles.controlGroup}>
                <label>
                  Image Name:
                  <input
                    type="text"
                    value={imageName}
                    onChange={(e) => setImageName(e.target.value)}
                    className={styles.textInput}
                    placeholder="e.g., waldo-3"
                  />
                </label>
              </div>
              
              <div className={styles.controlGroup}>
                <label>
                  Orientation:
                  <select
                    value={imageOrientation}
                    onChange={(e) => setImageOrientation(e.target.value as 'landscape' | 'portrait')}
                    className={styles.select}
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </label>
              </div>

              {waldoPosition && (
                <div className={styles.controlGroup}>
                  <label>
                    Tolerance (pixels):
                    <input
                      type="number"
                      value={waldoPosition.tolerance}
                      onChange={(e) => setWaldoPosition({
                        ...waldoPosition,
                        tolerance: parseInt(e.target.value) || 30
                      })}
                      className={styles.numberInput}
                      min="10"
                      max="100"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className={styles.imageContainer}>
              <div className={styles.imageWrapper}>
                <img
                  ref={imageRef}
                  src={selectedImage}
                  alt="Preview"
                  onClick={handleImageClick}
                  className={styles.image}
                />
                {waldoPosition && waldoPixels && (
                  <div
                    className={styles.waldoMarker}
                    style={{
                      left: `${(waldoPosition.x / 100) * (imageRef.current?.clientWidth || 0)}px`,
                      top: `${(waldoPosition.y / 100) * (imageRef.current?.clientHeight || 0)}px`,
                      width: `${waldoPosition.tolerance * 2}px`,
                      height: `${waldoPosition.tolerance * 2}px`,
                    }}
                  />
                )}
              </div>
              <p className={styles.instruction}>
                {waldoPosition 
                  ? `Waldo position set at (${waldoPosition.x.toFixed(2)}%, ${waldoPosition.y.toFixed(2)}%). Click to adjust.`
                  : 'Click on the image where Waldo is located'}
              </p>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={handleConfirm}
                disabled={!waldoPosition || !imageName}
                className={styles.confirmButton}
              >
                Confirm & Export
              </button>
              <button onClick={handleReset} className={styles.resetButton}>
                Reset
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

