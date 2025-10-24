from flask import Flask, render_template, request, jsonify
import os
import logging
import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)

# --- API SETTINGS ---
# 1. Get your free API key from https://groq.com/
# 2. Paste your key here:
GROQ_API_KEY = "PASTE_YOUR_API_KEY_HERE"  # e.g., "gsk_..."
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
OLLAMA_API_URL = "http://localhost:11434/api/generate"

@app.route('/')
def index():
    # This now just serves the main HTML skeleton
    return render_template('index.html')

@app.route('/process_code', methods=['POST'])
def process_code():
    try:
        data = request.json
        original_code = data.get('code', '')
        prompt = data.get('prompt', '')
        # Get the new model choice from the frontend
        model_choice = data.get('model', 'phi3-local')
        
        logger.info(f"Received prompt: {prompt[:50]}... for model: {model_choice}")
        
        full_prompt = f"""You are a game development code assistant. Your task is to improve the following code based on the user's request.

Original Code:
{original_code}

User Request: {prompt}

Please provide:
1. The improved code
2. A clear explanation of the changes made and why they improve the code
3. Any additional suggestions for further improvement

Format your response as follows:
<improved_code>
// Place the improved code here
</improved_code>

<explanation>
// Place your explanation here
</explanation>

<additional_suggestions>
// Place any additional suggestions here
</additional_suggestions>
"""
        
        content = ""
        
        # --- NEW: Model Selection Logic ---
        if model_choice == "llama3-cloud":
            logger.info("Using Groq Cloud API (llama3-8b-8192)")
            api_headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            api_payload = {
                "model": "llama3-8b-8192",
                "messages": [{"role": "user", "content": full_prompt}],
                "temperature": 0.7
            }
            response = requests.post(GROQ_API_URL, headers=api_headers, json=api_payload)
            
            if response.status_code != 200:
                raise Exception(f"Error from Groq API: {response.text}")
            content = response.json()['choices'][0]['message']['content']
        
        else:
            # Use local Ollama for "phi3-local" or "llama3-local"
            logger.info(f"Using local Ollama API ({model_choice})")
            response = requests.post(OLLAMA_API_URL, json={
                "model": model_choice, # Pass the selected model
                "prompt": full_prompt,
                "stream": False
            })
            
            if response.status_code != 200:
                raise Exception(f"Error from Ollama API: {response.text}")
            content = response.json().get("response", "")
        # --- END: Model Selection Logic ---

        
        improved_code = extract_section(content, "improved_code")
        explanation = extract_section(content, "explanation")
        suggestions = extract_section(content, "additional_suggestions")

        # Fallback logic (same as before)
        if not improved_code and "```" in content:
            code_blocks = content.split("```")
            if len(code_blocks) > 1:
                improved_code = code_blocks[1]
                # Clean up language name (e.g., "python\n")
                if improved_code.startswith(("python", "java", "c#", "cpp", "c++", "javascript", "ts")):
                    improved_code = improved_code.split("\n", 1)[1]
                improved_code = improved_code.strip()


        if not explanation:
            explanation = extract_fallback(content, "explanation", "additional suggestions")

        if not suggestions:
            suggestions = "None provided."

        return jsonify({
            "improved_code": improved_code,
            "explanation": explanation,
            "additional_suggestions": suggestions,
            "original_code": original_code
        })

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# --- Helper Functions (unchanged) ---
def extract_section(content, section_name):
    start_tag = f"<{section_name}>"
    end_tag = f"</{section_name}>"
    start = content.find(start_tag)
    if start == -1:
        return ""
    end = content.find(end_tag, start)
    return content[start + len(start_tag):end].strip() if end != -1 else content[start + len(start_tag):].strip()

def extract_fallback(content, start_key, end_key):
    lower = content.lower()
    start = lower.find(start_key)
    end = lower.find(end_key)
    if start == -1:
        return ""
    return content[start:end].strip() if end != -1 else content[start:].strip()

def check_ollama_connection():
    # Now this just prints the status, it doesn't stop the app
    try:
        res = requests.get("http://localhost:11434/api/tags")
        if res.status_code == 200:
            models = res.json().get("models", [])
            if models:
                print("✅ Ollama is running with models:")
                for m in models:
                    print(f" - {m['name']}")
            else:
                print("⚠️ Ollama is running but has no models installed.")
        else:
            print("❌ Ollama not responding.")
    except:
        print("❌ Unable to connect to Ollama. Local models will fail.")

if __name__ == '__main__':
    # This just needs to check for the 'templates' folder
    # index.html, style.css, and script.js should be in a
    # 'static' folder or served by Flask, but for simplicity
    # we will keep index.html in 'templates'.
    # We also need a 'static' folder for css and js.
    
    os.makedirs("templates", exist_ok=True)
    os.makedirs("static", exist_ok=True) # Create static folder
    
    # Check if files exist, if not, create placeholders
    if not os.path.exists("templates/index.html"):
        with open("templates/index.html", "w", encoding="utf-8") as f:
            f.write("<!-- Main HTML file goes here -->")
    if not os.path.exists("static/style.css"):
        with open("static/style.css", "w", encoding="utf-8") as f:
            f.write("/* CSS styles go here */")
    if not os.path.exists("static/script.js"):
        with open("static/script.js", "w", encoding="utf-8") as f:
            f.write("// JavaScript logic goes here")
            
    check_ollama_connection()
    # Host on 0.0.0.0 to make it accessible on your network if you want
    app.run(debug=True, host="0.0.0.0", port=5000)
