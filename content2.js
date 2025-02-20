(function() {
    if (!chrome.runtime?.id) {
        console.warn("Chrome runtime context invalidated. Extension might be reloaded.");
        return;
    }

    setTimeout(() => {
        if (document.getElementById("grammar-check-btn")) return; // Prevent duplicates

        // Create floating button
        let btn = document.createElement("button");
        // btn.innerText = "📝 Check Grammar";
        btn.id = "grammar-check-btn";
        Object.assign(btn.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: "9999"
        });

        // Create image element for logo
        let img = document.createElement("img");
        img.src = "logo.png"; // Replace with the actual path to your logo
        img.alt = "Grammar Check";
        Object.assign(img.style, {
            width: "32px",  // Adjust as needed
            height: "32px", // Adjust as needed
            objectFit: "contain" // Ensures proper scaling
        });

        // Style the button to be round
        Object.assign(btn.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            width: "50px", // Set width and height to the same value
            height: "50px",
            background: "#007bff",
            border: "none",
            borderRadius: "50%", // Makes it a circle
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: "9999",
            padding: "0" // Remove padding to avoid misalignment
        });

        // Append the image inside the button
        btn.appendChild(img);

        document.body.appendChild(btn);

        // Create iframe for chat content
        let popup = document.createElement("iframe");
        popup.src = chrome.runtime.getURL("popup.html");
        Object.assign(popup.style, {
            position: "fixed",
            bottom: "70px",
            right: "20px",
            width: "340px",
            height: "500px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            display: "none",
            zIndex: "10000",
        });
        document.body.appendChild(popup);

        // Button Click Event - Fetch Grammar Correction
        btn.addEventListener("click", function() {
            let selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                chrome.runtime.sendMessage({ action: "grammarCheck", text: selectedText });
            } else {
                alert("Please select text to check.");
            }
        });

        // Listen for Response from Backend
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "showCorrection") {
                popup.contentWindow.postMessage({
                    action: "showCorrection",
                    correctedText: message.correctedText,
                    explanation: message.explanation
                }, "*");
                popup.style.display = "block";
            }
        });

        // Listen for messages from iframe
        window.addEventListener("message", (event) => {
            if (event.data.action === "closePopup") {
                popup.style.display = "none";
            }
        });
    }, 2000); // Delay to ensure DOM is loaded
})();