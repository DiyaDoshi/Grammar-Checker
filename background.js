chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "grammarCheck") {
      fetch("http://127.0.0.1:5000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: message.text }),
      })
      .then(response => response.json())
      .then(data => {
        let result = data.response.split("\n"); // Assuming response has "Corrected text\nExplanation"
        let correctedText = result[0] || message.text;
        let explanation = result.slice(1).join("\n") || "No explanation provided.";
  
        chrome.tabs.sendMessage(sender.tab.id, {
          action: "showCorrection",
          correctedText,
          explanation
        });
      })
      .catch(error => console.error("Grammar API Error:", error));
    }
  });
  
  