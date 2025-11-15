import { useState, useRef } from 'react';
import { percentToPixels } from '@wheres-waldo/shared-ui';
import styles from './app.module.css';

interface WaldoPosition {
  x: number;
  y: number;
  tolerance: number;
}

interface RectanglePosition {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

type DetectionType = 'circle' | 'rectangle';
type CharacterType = 'Amy' | 'Dan' | 'Both';
type Difficulty = 'Practice' | 'Easy' | 'Hard' | 'Really Hard';

export function App() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [waldoPosition, setWaldoPosition] = useState<WaldoPosition | null>(null);
  const [rectanglePosition, setRectanglePosition] = useState<RectanglePosition | null>(null);
  const [firstCorner, setFirstCorner] = useState<{ x: number; y: number } | null>(null);
  const [detectionType, setDetectionType] = useState<DetectionType>('circle');
  const [imageOrientation, setImageOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [characterType, setCharacterType] = useState<CharacterType>('Amy');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [imageName, setImageName] = useState('');
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [fileExtension, setFileExtension] = useState('');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
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
      setRectanglePosition(null);
      setFirstCorner(null);
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

    const normalizedX = Math.max(0, Math.min(100, xPercent));
    const normalizedY = Math.max(0, Math.min(100, yPercent));

    if (detectionType === 'circle') {
      setWaldoPosition({
        x: normalizedX,
        y: normalizedY,
        tolerance: 30, // Default tolerance
      });
      setRectanglePosition(null);
      setFirstCorner(null);
    } else {
      // Rectangle mode - two clicks required
      if (!firstCorner) {
        // First click - store corner
        setFirstCorner({ x: normalizedX, y: normalizedY });
        setWaldoPosition(null);
        setRectanglePosition(null);
      } else {
        // Second click - complete rectangle
        setRectanglePosition({
          x1: firstCorner.x,
          y1: firstCorner.y,
          x2: normalizedX,
          y2: normalizedY,
        });
        setFirstCorner(null);
        setWaldoPosition(null);
      }
    }
  };

  const handleConfirm = async () => {
    if ((!waldoPosition && !rectanglePosition) || !imageName || !originalFile || !selectedImage) return;

    const imageId = `image-${Date.now()}`;
    const fileName = `${imageName}${fileExtension}`;

    // Determine alt text based on character type
    const getAltText = () => {
      switch (characterType) {
        case 'Both':
          return 'Find Amy and Dan in this';
        case 'Dan':
          return 'Find Dan in this';
        case 'Amy':
          return 'Find Amy in this';
        default:
          return 'Find Amy and Dan in this';
      }
    };

    // Create the waldoLocation based on detection type
    const waldoLocationCode = detectionType === 'circle' && waldoPosition
      ? `{ x: ${waldoPosition.x.toFixed(2)}, y: ${waldoPosition.y.toFixed(2)}, tolerance: ${waldoPosition.tolerance} }`
      : rectanglePosition
      ? `{ x1: ${rectanglePosition.x1.toFixed(2)}, y1: ${rectanglePosition.y1.toFixed(2)}, x2: ${rectanglePosition.x2.toFixed(2)}, y2: ${rectanglePosition.y2.toFixed(2)} }`
      : '{}';

    // Create the new entry for imageData.ts
    const newEntry = `  {
    id: '${imageId}',
    src: \`\${BASE_URL}images/${fileName}\`,
    alt: '${getAltText()} ${imageOrientation} scene!',
    waldoLocation: ${waldoLocationCode},
    detectionType: '${detectionType}',
    orientation: '${imageOrientation}',
    characterType: CharacterType.${characterType},
    difficulty: Difficulty.${difficulty.replace(' ', '')},
  },`;

    // Save image file to project directory using File System Access API
    try {
      // Request directory handle for the project images folder
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const directoryHandle = await (window as any).showDirectoryPicker({
        id: 'wheres-waldo-images',
        mode: 'readwrite',
        startIn: 'documents',
      });

      // Create the file in the selected directory
      const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      // Write the image data
      const imageBlob = await fetch(selectedImage).then(r => r.blob());
      await writable.write(imageBlob);
      await writable.close();

      // Show the code modal instead of downloading
      setGeneratedCode(newEntry);
      setShowCodeModal(true);
    } catch (error) {
      // Fallback to download if File System Access API is not available or user cancels
      console.error('Failed to save file directly:', error);
      
      // Download the image file
      const imageBlob = await fetch(selectedImage).then(r => r.blob());
      const imageUrl = URL.createObjectURL(imageBlob);
      const imageLink = document.createElement('a');
      imageLink.href = imageUrl;
      imageLink.download = fileName;
      imageLink.click();
      URL.revokeObjectURL(imageUrl);

      // Still show the code modal
      setGeneratedCode(newEntry);
      setShowCodeModal(true);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setWaldoPosition(null);
    setRectanglePosition(null);
    setFirstCorner(null);
    setImageName('');
    setOriginalFile(null);
    setFileExtension('');
    setCharacterType('Amy');
    setDifficulty('Easy');
    setDetectionType('circle');
    setShowCodeModal(false);
    setGeneratedCode('');
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
  
  const hasValidLocation = (detectionType === 'circle' && waldoPosition) || 
                           (detectionType === 'rectangle' && rectanglePosition);

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

              <div className={styles.controlGroup}>
                <label>
                  Character(s):
                  <select
                    value={characterType}
                    onChange={(e) => setCharacterType(e.target.value as CharacterType)}
                    className={styles.select}
                  >
                    <option value="Amy">Amy</option>
                    <option value="Dan">Dan</option>
                    <option value="Both">Both (Amy and Dan)</option>
                  </select>
                </label>
              </div>

              <div className={styles.controlGroup}>
                <label>
                  Difficulty:
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className={styles.select}
                  >
                    <option value="Practice">Practice</option>
                    <option value="Easy">Easy</option>
                    <option value="Hard">Hard</option>
                    <option value="Really Hard">Really Hard</option>
                  </select>
                </label>
              </div>

              <div className={styles.controlGroup}>
                <label>
                  Detection Type:
                  <select
                    value={detectionType}
                    onChange={(e) => {
                      setDetectionType(e.target.value as DetectionType);
                      setWaldoPosition(null);
                      setRectanglePosition(null);
                      setFirstCorner(null);
                    }}
                    className={styles.select}
                  >
                    <option value="circle">Circle (Click once)</option>
                    <option value="rectangle">Rectangle (Click twice)</option>
                  </select>
                </label>
              </div>

              {waldoPosition && detectionType === 'circle' && (
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
                {/* Circle detection marker */}
                {waldoPosition && waldoPixels && detectionType === 'circle' && (
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
                {/* Rectangle detection marker */}
                {rectanglePosition && detectionType === 'rectangle' && imageRef.current && (
                  <div
                    className={styles.rectangleMarker}
                    style={{
                      left: `${Math.min(rectanglePosition.x1, rectanglePosition.x2)}%`,
                      top: `${Math.min(rectanglePosition.y1, rectanglePosition.y2)}%`,
                      width: `${Math.abs(rectanglePosition.x2 - rectanglePosition.x1)}%`,
                      height: `${Math.abs(rectanglePosition.y2 - rectanglePosition.y1)}%`,
                    }}
                  />
                )}
                {/* First corner marker for rectangle */}
                {firstCorner && detectionType === 'rectangle' && imageRef.current && (
                  <div
                    className={styles.cornerMarker}
                    style={{
                      left: `${firstCorner.x}%`,
                      top: `${firstCorner.y}%`,
                    }}
                  />
                )}
              </div>
              <p className={styles.instruction}>
                {detectionType === 'circle' 
                  ? waldoPosition 
                    ? `Circle position set at (${waldoPosition.x.toFixed(2)}%, ${waldoPosition.y.toFixed(2)}%). Click to adjust.`
                    : 'Click on the image where Waldo is located'
                  : firstCorner
                    ? `First corner set at (${firstCorner.x.toFixed(2)}%, ${firstCorner.y.toFixed(2)}%). Click again to complete rectangle.`
                    : rectanglePosition
                      ? `Rectangle created. Click to reset and create new rectangle.`
                      : 'Click twice on the image to create a rectangle around Waldo'
                }
              </p>
            </div>

            <div className={styles.actionButtons}>
              <button
                onClick={handleConfirm}
                disabled={!hasValidLocation || !imageName}
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

      {/* Code Modal */}
      {showCodeModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowCodeModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Image Entry Code</h2>
            <p className={styles.modalInstructions}>
              Copy this code and add it to the <code>waldoImages</code> array in:<br />
              <code>apps/waldo-app/src/app/utils/imageData.ts</code>
            </p>
            <pre className={styles.codeBlock}>
              <code>{generatedCode}</code>
            </pre>
            <div className={styles.modalButtons}>
              <button
                className={styles.copyButton}
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  alert('Code copied to clipboard!');
                }}
              >
                Copy to Clipboard
              </button>
              <button
                className={styles.closeButton}
                onClick={() => setShowCodeModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

