# Installation Guide

## Quick Start

### 1. Build the Extension

First, ensure you have Node.js installed (version 14 or higher).

```powershell
# Install dependencies
npm install

# Build the extension
npm run build
```

This will create a `dist` folder with the compiled extension.

### 2. Load in Chrome/Edge

1. Open your browser and navigate to:
   - **Chrome**: `chrome://extensions/`
   - **Edge**: `edge://extensions/`
   - **Brave**: `brave://extensions/`

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**:
   - Click "Load unpacked"
   - Navigate to the `dist` folder inside your project directory
   - Select the folder and click "Select Folder"

4. The extension should now appear in your extensions list!

### 3. Test the Extension

1. Navigate to any Jira ticket page, for example:
   - `https://your-company.atlassian.net/browse/PROJ-123`

2. You should see a 📋 button next to the ticket number

3. Click the button or press `Ctrl+J` to copy the markdown link

4. Paste it somewhere to verify: `[PROJ-123](https://your-company.atlassian.net/browse/PROJ-123)`

## Development Mode

For development with auto-rebuild on file changes:

```powershell
npm run watch
```

After making changes, reload the extension:
1. Go to `chrome://extensions/`
2. Click the refresh icon on your extension card

## Customizing the Keyboard Shortcut

If `Ctrl+J` conflicts with another shortcut:

1. Go to `chrome://extensions/shortcuts`
2. Find "Jira Markdown Link Copier"
3. Click the pencil icon next to "Copy Jira ticket as markdown link"
4. Press your desired key combination
5. Click "OK"

## Adding Custom Icons

The extension works without icons, but you can add them:

1. Create three PNG icons:
   - `icon16.png` (16×16 pixels)
   - `icon48.png` (48×48 pixels)
   - `icon128.png` (128×128 pixels)

2. Place them in the `icons` folder

3. Rebuild: `npm run build`

4. Reload the extension in your browser

### Quick Icon Creation Tips

- Use a simple design (letter "J" or "MD" on colored background)
- Free icon tools:
  - [Figma](https://www.figma.com/) (free)
  - [GIMP](https://www.gimp.org/) (free)
  - [Photopea](https://www.photopea.com/) (online, free)
  
## Troubleshooting

### Extension doesn't load
- Make sure you built the extension first (`npm run build`)
- Verify the `dist` folder exists
- Check for error messages in `chrome://extensions/`

### Button doesn't appear
- Verify you're on a Jira ticket page (URL contains `/browse/`)
- Refresh the page
- Check browser console for errors (F12)

### Keyboard shortcut doesn't work
- Check if another extension is using `Ctrl+J`
- Change the shortcut in `chrome://extensions/shortcuts`
- Make sure you're on a Jira ticket page

### Copy to clipboard fails
- Make sure the page has clipboard permissions
- Try the button instead of the keyboard shortcut
- Check if your browser is blocking clipboard access

## Publishing (Optional)

To publish to Chrome Web Store:

1. Create a production build: `npm run build`
2. Zip the `dist` folder
3. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Upload the zip file
5. Fill in the required details
6. Submit for review

Note: Publishing requires a one-time $5 developer fee.
