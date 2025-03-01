chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "grammarCheck") {
    fetch("http://127.0.0.1:5000", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message.text }),
    })
    .then(response => response.json())
    .then(data => {
      let result = data.response.split("\n");
      let correctedText = result[0] || message.text;
      let explanation = result.slice(1).join("\n") || "No explanation provided.";
      
      // Parse corrections from the API response
      let corrections = parseCorrections(result);

      chrome.tabs.sendMessage(sender.tab.id, {
        action: "showCorrection",
        correctedText,
        explanation,
        corrections
      });
    })
    .catch(error => console.error("Grammar API Error:", error));
  }
});

//parses the response from the grammar checking API into a structured format.
function parseCorrections(result) {
  let corrections = [];
  let currentCorrection = {};
  
  result.forEach(line => {
    if (line.startsWith('Original:')) {
      currentCorrection.original = line.replace('Original:', '').trim();
    } else if (line.startsWith('Correction:')) {
      currentCorrection.correction = line.replace('Correction:', '').trim();
    } else if (line.startsWith('Explanation:')) {
      currentCorrection.explanation = line.replace('Explanation:', '').trim();
      corrections.push({...currentCorrection});
      currentCorrection = {};
    }
  });
  
  return corrections;
}
  
  
