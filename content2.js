(function() {
    if (!chrome.runtime?.id) {
        console.warn("Chrome runtime context invalidated. Extension might be reloaded.");
        return;
    }

    setTimeout(() => {
        if (document.getElementById("grammar-check-btn")) return; // Prevent duplicates

        // Create floating button
        let btn = document.createElement("button");
        btn.innerText = "G";
        btn.id = "grammar-check-btn";
        Object.assign(btn.style, {
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "10px 15px",
            background: "#818cf8",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: "9999"
        });

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

        // Add a variable to store the last selection
        let lastSelection = null;

        // Function to debounce events
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Single mouseup event listener with debounce
        document.addEventListener('mouseup', debounce(function() {
            let selectedText = window.getSelection().toString().trim();
            if (selectedText && selectedText.length > 1) {
                let selection = window.getSelection();
                let range = selection.getRangeAt(0);
                // Store the range
                lastSelection = range.cloneRange();
                console.log("Text selected:", selectedText);
                console.log("Selection stored:", lastSelection);
                chrome.runtime.sendMessage({ 
                    action: "grammarCheck", 
                    text: selectedText,
                    rangeData: {
                        startOffset: range.startOffset,
                        endOffset: range.endOffset
                    }
                });
            }
        }, 500));

        // Listen for Response from Backend
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === "showCorrection") {
                // Handle inline highlighting immediately
                if (message.corrections) {
                    console.log("Corrections received:", message.corrections);
                    highlightErrors(message.corrections);
                    
                    // Show popup immediately when corrections are received
                    popup.style.display = "block";
                }
                
                // Send data to popup
                popup.contentWindow.postMessage({
                    action: "showCorrection",
                    correctedText: message.correctedText,
                    explanation: message.explanation,
                    corrections: message.corrections
                }, "*");
            } else if (message.action === "replaceText" && lastSelection) {
                // First, remove any existing highlights
                const existingHighlights = document.querySelectorAll('.grammar-highlight-container');
                existingHighlights.forEach(highlight => {
                    const parent = highlight.parentNode;
                    parent.removeChild(highlight);
                });

                // Then insert the new text
                lastSelection.deleteContents();
                lastSelection.insertNode(document.createTextNode(message.correctedText));
                
                // Clear the stored selection and hide popup after replacement
                lastSelection = null;
                popup.style.display = "none";
            }
        });

        // Button click now just toggles popup visibility
        btn.addEventListener('click', function() {
            if (popup.style.display === "block") {
                popup.style.display = "none";
            }
        });

        // Listen for messages from iframe (like close button click)
        window.addEventListener("message", (event) => {
            if (event.data.action === "closePopup") {
                popup.style.display = "none";
            }
        });

        // Function to highlight errors in the text
        function highlightErrors(corrections) {
            if (!lastSelection) return;
            
            console.log("Attempting to highlight:", corrections);
            console.log("Using selection:", lastSelection);
            
            let span = document.createElement('span');
            span.className = 'grammar-highlight-container';
            
            try {
                // Use the stored selection for highlighting
                lastSelection.surroundContents(span);
                
                // Add highlighting and tooltips for each correction
                corrections.forEach(correction => {
                    const text = span.textContent;
                    const markedText = text.replace(
                        correction.original,
                        `<span class="grammar-error" 
                               data-correction="${correction.correction}"
                               data-explanation="${correction.explanation}"
                               title="${correction.correction}: ${correction.explanation}"
                        >${correction.original}</span>`
                    );
                    span.innerHTML = markedText;
                });
            } catch (error) {
                console.error("Error in highlighting:", error);
            }
        }

        // Add styles for highlights and tooltips
        const style = document.createElement('style');
        style.textContent = `
            .grammar-highlight-container {
                display: inline;
            }
            .grammar-error {
                background-color:rgb(219, 211, 250);
                border-bottom: 2px solid #c4b5fd;
                cursor: help;
                position: relative;
                display: inline;
            }
            
            .grammar-error:hover::after {
                content: attr(title);
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: #333;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 14px;
                white-space: nowrap;
                z-index: 10001;
            }
        `;
        document.head.appendChild(style);

    }, 1000); // Delay to ensure DOM is loaded
})();
