let startTime;
let isTracking = false;
let activeTabId = null;
let lastUpdateTime = null;

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  activeTabId = activeInfo.tabId;
  handleTabChange(tab);
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId) {
    handleTabChange(tab);
  }
});

// Listen for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId && isTracking) {
    updateTimeSpent();
    stopTracking();
    activeTabId = null;
  }
});

// Listen for windows focus change
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    if (isTracking) {
      updateTimeSpent();
      stopTracking();
    }
  } else {
    const tabs = await chrome.tabs.query({ active: true, windowId: windowId });
    if (tabs[0]) {
      activeTabId = tabs[0].id;
      handleTabChange(tabs[0]);
    }
  }
});

async function handleTabChange(tab) {
  const isTwitter =
    tab.url && (tab.url.includes("twitter.com") || tab.url.includes("x.com"));

  if (isTracking && !isTwitter) {
    updateTimeSpent();
    stopTracking();
  } else if (!isTracking && isTwitter) {
    startTracking();
  }
}

function startTracking() {
  if (!isTracking) {
    isTracking = true;
    startTime = Date.now();
    lastUpdateTime = startTime;
    console.log("Started tracking at:", new Date(startTime).toISOString());
  }
}

function stopTracking() {
  if (!isTracking) return;

  isTracking = false;
  startTime = null;
  lastUpdateTime = null;
  console.log("Stopped tracking");
}

function updateTimeSpent() {
  if (!isTracking || !lastUpdateTime) return;

  const currentTime = Date.now();
  const timeSpent = currentTime - lastUpdateTime;

  chrome.storage.local.get(["totalTime"], (result) => {
    const newTotal = (result.totalTime || 0) + timeSpent;
    chrome.storage.local.set({ totalTime: newTotal });
    console.log("Updated total time:", newTotal);
  });

  lastUpdateTime = currentTime;
}

// Update time periodically while tracking
setInterval(() => {
  if (isTracking) {
    updateTimeSpent();
  }
}, 1000);

// Check initial tab on extension load
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  if (tabs[0]) {
    activeTabId = tabs[0].id;
    handleTabChange(tabs[0]);
  }
});
