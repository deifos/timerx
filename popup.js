function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}

function updateTime() {
  chrome.storage.local.get(["totalTime"], (result) => {
    const timeSpent = result.totalTime || 0;
    document.getElementById("timeSpent").textContent = formatTime(timeSpent);
    console.log("Current total time:", timeSpent);
  });
}

// Update time every second when popup is open
setInterval(updateTime, 1000);
updateTime();

// Add reset button functionality
document.addEventListener("DOMContentLoaded", () => {
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset Timer";
  resetButton.style.marginTop = "10px";
  resetButton.onclick = () => {
    chrome.storage.local.set({ totalTime: 0 }, () => {
      updateTime();
    });
  };
  document.body.appendChild(resetButton);
});
