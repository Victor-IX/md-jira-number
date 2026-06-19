// Background service worker for handling keyboard shortcuts

chrome.commands.onCommand.addListener((command) => {
  if (command === 'copy-markdown-link') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { action: 'copyMarkdownLink' },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
            }
          }
        );
      }
    });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Jira Markdown Link Copier installed!');
  } else if (details.reason === 'update') {
    console.log('Jira Markdown Link Copier updated!');
  }
});
