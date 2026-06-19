// Content script for Jira pages
interface JiraInfo {
  ticketNumber: string;
  url: string;
}

// CSS class used for every injected button (id can't be reused across the
// multiple breadcrumb containers that exist in floating-card mode).
const BUTTON_CLASS = 'jira-md-copy-btn';

// Containers that hold the current issue's breadcrumb (full page and floating card).
const CONTAINER_SELECTORS = [
  '[data-testid="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
  '[data-test-id="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]',
  '#key-val'
];

// The anchor inside a container that points at the issue itself.
const ISSUE_LINK_SELECTORS = [
  '[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]',
  '[data-test-id="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"]',
  'a[href*="/browse/"]'
];

function getContainers(): Element[] {
  return Array.from(document.querySelectorAll(CONTAINER_SELECTORS.join(',')));
}

// Get Jira ticket info from a specific breadcrumb container. The issue's own
// link (`/browse/TICKET-123`) is preferred over window.location, because in
// floating-card mode the page URL is the board URL, not the issue URL.
function getInfoFromContainer(container: Element): JiraInfo | null {
  let anchor: HTMLAnchorElement | null = null;
  for (const selector of ISSUE_LINK_SELECTORS) {
    anchor = container.querySelector<HTMLAnchorElement>(selector);
    if (anchor) break;
  }

  if (anchor) {
    const ticketNumber = anchor.textContent?.trim() || '';
    const href = anchor.getAttribute('href') || '';
    if (ticketNumber) {
      const url = href
        ? new URL(href, window.location.origin).href
        : window.location.href;
      return { ticketNumber, url };
    }
  }

  const ticketNumber = container.textContent?.trim() || '';
  return ticketNumber ? { ticketNumber, url: window.location.href } : null;
}

// Get info for the issue the user is most likely looking at. Prefer a visible
// container (the floating card sits on top of / instead of the board).
function getActiveJiraInfo(): JiraInfo | null {
  const containers = getContainers();
  const visible = containers.filter((c) => (c as HTMLElement).offsetParent !== null);
  const ordered = (visible.length ? visible : containers).reverse();

  for (const container of ordered) {
    const info = getInfoFromContainer(container);
    if (info) return info;
  }

  const match = window.location.pathname.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/);
  if (match) {
    return { ticketNumber: match[1], url: window.location.href };
  }
  return null;
}

function createMarkdownLink(info: JiraInfo): string {
  return `[${info.ticketNumber}](${info.url})`;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);

    // Fallback for browsers/contexts where the async clipboard API is unavailable.
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

async function copyJiraInfo(jiraInfo: JiraInfo | null) {
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

function createCopyButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = BUTTON_CLASS;
  button.type = 'button';
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
    // Resolve info from this button's own container so the floating card and
    // the full page each copy their own ticket.
    const container = button.closest(CONTAINER_SELECTORS.join(','));
    const info = container ? getInfoFromContainer(container) : getActiveJiraInfo();
    await copyJiraInfo(info);
  });

  return button;
}

function injectCopyButtons() {
  const containers = getContainers();

  if (!containers.length) {
    return;
  }

  for (const container of containers) {
    // Scope the "already injected" check to this container — multiple
    // containers (e.g. floating card + page) can coexist.
    if (container.querySelector(`.${BUTTON_CLASS}`)) {
      continue;
    }

    if (!getInfoFromContainer(container)) {
      continue;
    }

    const button = createCopyButton();
    container.appendChild(button);
  }
}

function initialize() {
  // Wait for Jira's dynamic content to render before injecting.
  setTimeout(() => {
    injectCopyButtons();
  }, 250);

  // Re-inject button when navigating within Jira (SPA navigation) or when a
  // floating issue card opens/closes.
  const observer = new MutationObserver(() => {
    const needsButton = getContainers().some(
      (container) => !container.querySelector(`.${BUTTON_CLASS}`)
    );
    if (needsButton) {
      injectCopyButtons();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Triggered by the keyboard shortcut, relayed from the background script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'copyMarkdownLink') {
    copyJiraInfo(getActiveJiraInfo());
    sendResponse({ success: true });
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
