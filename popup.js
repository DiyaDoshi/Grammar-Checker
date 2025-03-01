// Listen for messages from the content script
window.addEventListener("message", (event) => {
    console.log("Received message in popup:", event.data); // Debug log
    if (event.data.action === "showCorrection") {
        // Update the popup content
        document.getElementById("correction").innerText = event.data.correctedText;
        document.getElementById("explanation").innerText = event.data.explanation || "No explanation provided.";
    }
});

// Handle Accept button click
document.getElementById("accept-btn").addEventListener("click", function() {
    console.log("Accept button clicked"); // Debug log
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const correctedText = document.getElementById("correction").innerText;
        chrome.tabs.sendMessage(tabs[0].id, {
            action: "replaceText",
            correctedText: correctedText
        });
        // Close the popup
        window.parent.postMessage({ action: "closePopup" }, "*");
    });
});

// Handle Dismiss button click
document.getElementById("dismiss-btn").addEventListener("click", function() {
    console.log("Dismiss button clicked"); // Debug log
    window.parent.postMessage({ action: "closePopup" }, "*");
});

// Add error handling
window.addEventListener('error', function(event) {
    console.error('Error in popup.js:', event.error);
});

// Log when popup.js is loaded
console.log("Popup.js loaded");

function replaceSelectedText(newText) {
  // Find the highlighted container
  const highlightContainer = document.querySelector('.grammar-highlight-container');
  if (highlightContainer) {
      // Replace the content and remove the highlighting
      highlightContainer.textContent = newText;
      // Remove the highlight container by replacing it with its text content
      const parent = highlightContainer.parentNode;
      const textNode = document.createTextNode(newText);
      parent.replaceChild(textNode, highlightContainer);
  } else {
      // Fallback to original selection replacement if no highlight container found
      let selection = window.getSelection();
      if (!selection.rangeCount) return;
      let range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(newText));
  }
}

// function replaceSelectedText(newText) {
//   let selection = window.getSelection();
//   if (!selection.rangeCount) return;

//   let range = selection.getRangeAt(0);
//   range.deleteContents();
//   range.insertNode(document.createTextNode(newText));
// }
