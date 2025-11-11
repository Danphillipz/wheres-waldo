import { useState, useRef } from 'react';
import { percentToPixels } from '@wheres-waldo/shared-ui';
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
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [fileExtension, setFileExtension] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store original file and extract extension
    setOriginalFile(file);
    const extension = file.name.substring(file.name.lastIndexOf('.'));
    setFileExtension(extension);

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setWaldoPosition(null);
      // Set default name without extension
      setImageName(file.name.replace(/\.[^/.]+$/, ''));
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

  const handleConfirm = async () => {
    if (!waldoPosition || !imageName || !originalFile || !selectedImage) return;

    const imageId = `image-${Date.now()}`;
    const fileName = `${imageName}${fileExtension}`;

    // Create the new entry for imageData.ts
    const newEntry = `  {
    id: '${imageId}',
    src: \`\${BASE_URL}images/${fileName}\`,
    alt: 'Find Amy and Dan in this ${imageOrientation} scene!',
    waldoLocation: { x: ${waldoPosition.x.toFixed(2)}, y: ${waldoPosition.y.toFixed(2)}, tolerance: ${waldoPosition.tolerance} },
    orientation: '${imageOrientation}',
  },`;

    // Download the renamed image file
    const imageBlob = await fetch(selectedImage).then(r => r.blob());
    const imageUrl = URL.createObjectURL(imageBlob);
    const imageLink = document.createElement('a');
    imageLink.href = imageUrl;
    imageLink.download = fileName;
    imageLink.click();
    URL.revokeObjectURL(imageUrl);

    // Download the imageData entry as a text file
    const textBlob = new Blob([newEntry], { type: 'text/plain' });
    const textUrl = URL.createObjectURL(textBlob);
    const textLink = document.createElement('a');
    textLink.href = textUrl;
    textLink.download = `${imageName}-entry.txt`;
    textLink.click();
    URL.revokeObjectURL(textUrl);

    // Show instructions
    alert(`Files downloaded successfully!\n\nNext steps:\n1. Move "${fileName}" to: apps/waldo-app/public/images/\n2. Add the content from "${imageName}-entry.txt" to the waldoImages array in: apps/waldo-app/src/app/utils/imageData.ts\n\nThe new entry has been saved to your downloads folder.`);
  };

  const handleReset = () => {
    setSelectedImage(null);
    setWaldoPosition(null);
    setImageName('');
    setOriginalFile(null);
    setFileExtension('');
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
                <p className={styles.controlHint}>
                  File will be saved as: {imageName}{fileExtension}
                </p>
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
                Confirm & Download Files
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

