# Jira Markdown Link Copier

A simple Chromium extension to copy Jira ticket numbers as embedded markdown links for use in commit descriptions and documentation.

**Available on [Google Chrome Web Store](https://chromewebstore.google.com/detail/ejdaeniffapecgfioodfpadglkgpfkdl?utm_source=item-share-cb)**

## Features

- 📋 **One-Click Copy**: Adds a button next to the Jira ticket number to copy it as a markdown link
- ⌨️ **Keyboard Shortcut**: Use `Ctrl+J` (or `Cmd+J` on Mac) to quickly copy the markdown link (configurable)
- 🔗 **Markdown Format**: Copies in the format `[TICKET-123](https://your-jira.atlassian.net/browse/TICKET-123)`
- ✅ **Visual Feedback**: Shows a notification when the link is copied successfully

## Installation

1. **Download the latest release**:
   - Go to the [Releases page](https://github.com/Victor-IX/md-jira-number/releases)
   - Download the latest `md-jira-number-vX.X.X.zip` file

2. **Extract the archive**:
   - Extract the ZIP file to a folder on your computer
   - Remember this location (you'll need to keep the files there)

3. **Load the extension in Chrome/Edge**:
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode" (toggle in the top-right corner)
   - Click "Load unpacked"
   - Select the extracted folder containing the extension files

4. **Start using it**:
   - Navigate to any Jira ticket page
   - Look for the 📋 button next to the ticket number
   - Click it or press `Ctrl+J` to copy the markdown link!

> **Note**: Keep the extracted folder on your computer. If you delete it, the extension will stop working and you'll need to reinstall it.

## Development

1. Clone this repository:
   ```bash
   git clone https://github.com/Victor-IX/md-jira-number.git
   cd md-jira-number
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome/Edge:
   - Open `chrome://extensions/` (or `edge://extensions/`)
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder from this project

### Bump Version

run `.\scripts\bump-version.ps1` to automatically update the version in both `manifest.json` and `package.json`.

## Usage

### Using the Button

1. Navigate to any Jira ticket page (e.g., `https://your-company.atlassian.net/browse/PROJ-123`)
2. Look for the 📋 button next to the ticket number at the top
3. Click the button to copy the markdown link
4. Paste it anywhere you need (Git commits, documentation, etc.)

### Using the Keyboard Shortcut

1. While on a Jira ticket page, press `Ctrl+J` (Windows/Linux) or `Cmd+J` (Mac)
2. The markdown link will be copied to your clipboard
3. A notification will confirm the action

## Compatibility

- Chromium based browsers (Manifest V3)


## Troubleshooting

### Button doesn't appear
- Make sure you're on a Jira ticket page (URL contains `/browse/`)
- Try refreshing the page
- Check if the extension is enabled in `chrome://extensions/`

### Keyboard shortcut doesn't work
- Check if `Ctrl+J` is already used by another extension
- You can change the shortcut in `chrome://extensions/shortcuts`

### Copy fails
- Make sure the page has permission to access the clipboard
- Try clicking the button instead of using the shortcut

## Logo

- Blender 5.0+