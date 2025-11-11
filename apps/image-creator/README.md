# Image Creator Tool

This is a development-only tool for creating and adding new images to the Where's Waldo game.

## Purpose

This tool allows you to:
1. Upload an image file (any format)
2. Click on the location where Waldo is in the image
3. Adjust the tolerance radius for click detection
4. Download the renamed image file and configuration entry

## How to Use

### Running the Tool

```bash
# Run in development mode
npx nx dev @wheres-waldo/image-creator
```

The app will be available at `http://localhost:4200`

### Creating a New Image

1. **Upload Image**: Click "Choose Image File" and select your image
2. **Set Image Name**: Enter a name for the image (e.g., "waldo-3")
   - The tool will preserve the original file extension
   - Preview shows: `waldo-3.svg` (or `.png`, `.jpg`, etc.)
3. **Set Orientation**: Choose "landscape" or "portrait"
4. **Click Waldo Location**: Click on the image where Waldo is located
   - A red circle will appear showing the detection area
5. **Adjust Tolerance**: Fine-tune the tolerance (in pixels) for click detection
   - Default is 30 pixels
   - Larger values make it easier to find Waldo
6. **Confirm & Download**: Click "Confirm & Download Files"
   - Downloads the renamed image file
   - Downloads a `.txt` file with the configuration entry
   - Shows instructions for next steps

### Adding the Image to the Game

After downloading the files:

1. **Move the image file** to: `apps/waldo-app/public/images/[filename]`
2. **Open** `apps/waldo-app/src/app/utils/imageData.ts`
3. **Copy the content** from the downloaded `.txt` file
4. **Paste it** into the `waldoImages` array (add a comma after the previous entry)
5. **Rebuild** the waldo-app: `npx nx build @wheres-waldo/waldo-app`

### Example

If you name your image "waldo-3" and upload a PNG file:
- Downloads: `waldo-3.png` and `waldo-3-entry.txt`
- Move `waldo-3.png` to `apps/waldo-app/public/images/`
- Add content from `waldo-3-entry.txt` to the `waldoImages` array

## Technical Details

- Built with React and Vite
- Uses the shared `@wheres-waldo/shared-ui` library for coordinate detection
- Coordinates are stored as percentages (0-100) for responsive design
- Tolerance is stored in pixels for consistent click detection
- Automatically preserves original file extension
- Downloads files directly to your browser's download folder

## Development Only

This tool should **only** be run in development mode and is **not** included in the production deployment of the main game.
