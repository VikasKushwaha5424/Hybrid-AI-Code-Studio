// Wait for the DOM to be fully loaded before running script
document.addEventListener('DOMContentLoaded', function() {
    
    // --- Get All DOM Elements ---
    const codeInput = document.getElementById('code-input');
    const promptInput = document.getElementById('prompt-input');
    const submitBtn = document.getElementById('submit-btn');
    const integrateBtn = document.getElementById('integrate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const loadingIndicator = document.getElementById('loading-indicator');
    const resultContainer = document.getElementById('result-container');
    const finalOutput = document.getElementById('final-output');
    
    // Output Displays
    const improvedCodeDisplay = document.getElementById('improved-code-display');
    const explanationDisplay = document.getElementById('explanation-display');
    const suggestionsDisplay = document.getElementById('suggestions-display');
    const finalCodeDisplay = document.getElementById('final-code-display');
    
    // Tabs
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // --- NEW: New Feature Elements ---
    const modelSelect = document.getElementById('model-select');
    const modelDisplayName = document.getElementById('model-display-name');
    const copyBtn = document.getElementById('copy-btn');
    const diffDisplay = document.getElementById('diff-display');
    const toast = document.getElementById('toast-notification');

    // --- App State ---
    let lastResponse = null;
    let originalCodeForDiff = ""; // Store the original code for diffing

    // --- NEW: showToast Function (Replaces alert()) ---
    function showToast(message, isError = false) {
        toast.textContent = message;
        toast.style.backgroundColor = isError ? '#ff4081' : '#00ffc3'; // Red for error, green for success
        toast.classList.add('active');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    // --- NEW: generateDiff Function ---
    function generateDiff(originalText, improvedText) {
        // Use JsDiff library
        const diff = JsDiff.diffLines(originalText, improvedText || "");
        let html = '';
        
        diff.forEach(part => {
            if (part.added) {
                html += `<ins>${part.value}</ins>`;
            } else if (part.removed) {
                html += `<del>${part.value}</del>`;
            } else {
                // Add a span for consistent styling (optional)
                html += `<span>${part.value}</span>`;
            }
        });
        
        diffDisplay.innerHTML = html;
    }

    // --- NEW: Copy to Clipboard Function ---
    // Uses the recommended `execCommand` for iFrame compatibility
    function copyToClipboard() {
        const textToCopy = improvedCodeDisplay.textContent;
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = textToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        try {
            document.execCommand('copy');
            showToast('Code copied to clipboard!', false);
        } catch (err) {
            showToast('Failed to copy code.', true);
            console.error('Fallback: Oops, unable to copy', err);
        }
        document.body.removeChild(tempTextArea);
    }

    // --- Event Listeners ---
    
    // Main Submit Button
    submitBtn.addEventListener('click', async function() {
        const code = codeInput.value; // Get full code for diff
        const prompt = promptInput.value.trim();
        const model = modelSelect.value;
        
        if (!code.trim()) {
            showToast('Please enter some code to improve.', true);
            return;
        }
        if (!prompt) {
            showToast('Please describe what improvements you want.', true);
            return;
        }
        
        originalCodeForDiff = code; // Save for diff
        loadingIndicator.style.display = 'block';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/process_code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code.trim(),
                    prompt: prompt,
                    model: model // Send the selected model
                })
            });
            
            const responseData = await response.json();

            if (!response.ok) {
                const errorMsg = responseData.error || 'Unknown server error';
                throw new Error(errorMsg);
            }
            
            lastResponse = responseData;
            
            // Update displays
            improvedCodeDisplay.textContent = lastResponse.improved_code || "No code provided.";
            explanationDisplay.innerHTML = marked.parse(lastResponse.explanation || "No explanation provided.");
            suggestionsDisplay.innerHTML = marked.parse(lastResponse.additional_suggestions || "No suggestions provided.");
            
            // Generate the new diff
            generateDiff(originalCodeForDiff, lastResponse.improved_code);
            
            integrateBtn.style.display = 'block';
            
        } catch (error) {
            console.error('Error:', error);
            showToast('Error: ' + error.message, true);
        } finally {
            loadingIndicator.style.display = 'none';
            submitBtn.disabled = false;
        }
    });
    
    // Integrate Button
    integrateBtn.addEventListener('click', function() {
        if (lastResponse) {
            finalCodeDisplay.textContent = lastResponse.improved_code;
            resultContainer.style.display = 'none';
            finalOutput.style.display = 'block';
        }
    });
    
    // Reset Button
    resetBtn.addEventListener('click', function() {
        codeInput.value = finalCodeDisplay.textContent;
        promptInput.value = '';
        lastResponse = null;
        finalOutput.style.display = 'none';
        resultContainer.style.display = 'block';
        integrateBtn.style.display = 'none';
        
        // Reset tab content
        improvedCodeDisplay.textContent = 'Your improved code will appear here.';
        explanationDisplay.innerHTML = '<div class="explanation-content">Explanation will appear here.</div>';
        suggestionsDisplay.innerHTML = '<div class="explanation-content">Additional suggestions will appear here.</div>';
        diffDisplay.innerHTML = 'Changes will appear here.';
        
        // Reset to the first tab
        tabs.forEach(t => t.classList.remove('active'));
        tabs[0].classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        tabContents[0].classList.add('active');
    });
    
    // Tab functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // --- NEW: Listener for Copy Button ---
    copyBtn.addEventListener('click', copyToClipboard);

    // --- NEW: Listener for Model Select ---
    modelSelect.addEventListener('change', function() {
        const selectedText = this.options[this.selectedIndex].text;
        modelDisplayName.textContent = selectedText;
    });
});
