// Content script for Jira pages
interface JiraInfo {
  ticketNumber: string;
  url: string;
}

// Function to get Jira ticket information
function getJiraInfo(): JiraInfo | null {
  // Try multiple selectors for different Jira versions
  const selectors = [
    '[data-test-id="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
    '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
    '#key-val',
    '[data-test-id="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]',
    '.issue-link'
  ];

  let ticketElement: Element | null = null;
  
  for (const selector of selectors) {
    ticketElement = document.querySelector(selector);
    if (ticketElement) break;
  }

  // Fallback: try to extract from URL
  if (!ticketElement) {
    const match = window.location.pathname.match(/\/browse\/([A-Z]+-\d+)/);
    if (match) {
      return {
        ticketNumber: match[1],
        url: window.location.href
      };
    }
    return null;
  }

  const ticketNumber = ticketElement.textContent?.trim() || '';
  const url = window.location.href;

  return ticketNumber ? { ticketNumber, url } : null;
}

// Function to create markdown link
function createMarkdownLink(info: JiraInfo): string {
  return `[${info.ticketNumber}](${info.url})`;
}

// Function to copy to clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    
    // Fallback method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (error) {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

// Function to show notification
function showNotification(message: string, isSuccess: boolean = true) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background-color: ${isSuccess ? '#36B37E' : '#FF5630'};
    color: white;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    font-size: 14px;
    font-weight: 500;
    transition: opacity 0.3s;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

// Function to handle copy action
async function handleCopyAction() {
  const jiraInfo = getJiraInfo();
  
  if (!jiraInfo) {
    showNotification('Could not find Jira ticket information', false);
    return;
  }
  
  const markdownLink = createMarkdownLink(jiraInfo);
  const success = await copyToClipboard(markdownLink);
  
  if (success) {
    showNotification(`Copied: ${markdownLink}`);
  } else {
    showNotification('Failed to copy to clipboard', false);
  }
}

// Function to create and inject the copy button
function injectCopyButton() {
  // Check if button already exists
  if (document.getElementById('jira-md-copy-btn')) {
    return;
  }

  // Try multiple locations to inject the button
  const targetSelectors = [
    '[data-test-id="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
    '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
    '#key-val',
    '[data-test-id="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]'
  ];

  let targetElement: Element | null = null;
  
  for (const selector of targetSelectors) {
    targetElement = document.querySelector(selector);
    if (targetElement) break;
  }

  if (!targetElement) {
    console.log('Jira MD Copy: Could not find target element for button injection');
    return;
  }

  // Create the button
  const button = document.createElement('button');
  button.id = 'jira-md-copy-btn';
  button.innerHTML = '📋';
  button.title = 'Copy as Markdown link (Ctrl+J)';
  button.style.cssText = `
    margin-left: 0px;
    padding: 2px 4px;
    background-color: transparent;
    color: white;
    border: none;
    border-radius: 2px;
    cursor: pointer;
    font-size: 14px;
    line-height: 1;
    transition: background-color 0.2s;
    vertical-align: middle;
  `;
  
  button.addEventListener('mouseenter', () => {
    button.style.backgroundColor = '#0066ff50';
  });

  button.addEventListener('mouseleave', () => {
    button.style.backgroundColor = 'transparent';
  });

  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await handleCopyAction();
  });

  // Insert button after the ticket number
  targetElement.parentElement?.insertBefore(button, targetElement.nextSibling);
  
  console.log('Jira MD Copy: Button injected successfully');
}

// Initialize when DOM is ready
function initialize() {
  // Wait a bit for Jira's dynamic content to load
  setTimeout(() => {
    injectCopyButton();
  }, 250);

  // Re-inject button when navigating within Jira (SPA navigation)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // Check if the ticket number element exists but button doesn't
        const hasTicket = document.querySelector('[data-test-id="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]') ||
                         document.querySelector('[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]') ||
                         document.querySelector('#key-val');
        const hasButton = document.getElementById('jira-md-copy-btn');
        
        if (hasTicket && !hasButton) {
          setTimeout(() => {
            injectCopyButton();
          }, 250);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Listen for messages from background script (for keyboard shortcut)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyMarkdownLink') {
    handleCopyAction();
    sendResponse({ success: true });
  }
});

// Start the extension
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
