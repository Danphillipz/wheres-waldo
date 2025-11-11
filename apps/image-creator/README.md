# Image Creator Tool

This is a development-only tool for creating and adding new images to the Where's Waldo game.

## Purpose

This tool allows you to:
1. Upload an image file (SVG recommended)
2. Click on the location where Waldo is in the image
3. Adjust the tolerance radius for click detection
4. Export the image data configuration

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
3. **Set Orientation**: Choose "landscape" or "portrait"
4. **Click Waldo Location**: Click on the image where Waldo is located
   - A red circle will appear showing the detection area
5. **Adjust Tolerance**: Fine-tune the tolerance (in pixels) for click detection
   - Default is 30 pixels
   - Larger values make it easier to find Waldo
6. **Confirm & Export**: Click "Confirm & Export" to:
   - View the code snippet to add to `imageData.ts`
   - Download a JSON file with the image configuration

### Adding the Image to the Game

1. Save your image file to: `apps/waldo-app/public/images/[image-name].svg`
2. Copy the generated code snippet
3. Add it to the `waldoImages` array in `apps/waldo-app/src/app/utils/imageData.ts`
4. Rebuild the waldo-app: `npx nx build @wheres-waldo/waldo-app`

## Technical Details

- Built with React and Vite
- Uses the shared `@wheres-waldo/shared-ui` library for coordinate detection
- Coordinates are stored as percentages (0-100) for responsive design
- Tolerance is stored in pixels for consistent click detection

## Development Only

This tool should **only** be run in development mode and is **not** included in the production deployment of the main game.
