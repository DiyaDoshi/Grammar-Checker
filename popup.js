window.addEventListener("message", (event) => {
  if (event.data.action === "showCorrection") {
      document.getElementById("correction").innerText = event.data.correctedText;
      document.getElementById("explanation").innerText = event.data.explanation;
  }
});

document.getElementById("accept-btn").addEventListener("click", function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: replaceSelectedText,
          args: [document.getElementById("correction").innerText]
      });
  });
});

document.getElementById("dismiss-btn").addEventListener("click", function() {
  window.parent.postMessage({ action: "closePopup" }, "*");
});

function replaceSelectedText(newText) {
  let selection = window.getSelection();
  if (!selection.rangeCount) return;

  let range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(document.createTextNode(newText));
}