# Hybrid-AI-Code-Studio
## 🎮 Game Code Iterator Pro 
### _A full-stack web tool for rapid, AI-assisted code improvement_

---

## 🧩 Description

**Game Code Iterator Pro** is a professional-grade full-stack web tool that empowers developers to **iterate, refine, and enhance** their code using AI assistance.  
It features a **hybrid AI engine** that seamlessly switches between **cloud-based (Groq + Llama 3)** and **offline (Ollama)** models for flexibility, speed, and privacy.

---

## ✨ Features

- **Hybrid AI Engine**
  - 🌩️ **Cloud Mode:** Uses Groq API for lightning-fast, high-quality **Llama 3** responses.  
  - 🧠 **Offline Mode:** Uses your **local Ollama** instance for complete privacy.
- **Visual Diff Checker** – See exact code changes side-by-side, just like GitHub.  
- **Stateful Iteration Loop** – Integrate AI-improved code automatically into the next prompt.  
- **Copy-to-Clipboard** – Instantly copy generated code with one click.  
- **Markdown Rendering** – AI explanations and suggestions are rendered beautifully.  
- **Professional UI** – Includes non-blocking toast notifications for errors (no alert popups).  
- **Structured Codebase** – Clean separation of HTML, CSS, and JavaScript layers.  
- **Code Improvement Suggestions** with explanations
- **100% Free** - Uses open-source LLMs that run locally
- **Privacy-Preserving** - Your code never leaves your machine

---

## 🛠️ Tech Stack


| Layer | Technology |
|:------|:------------|
| **Frontend** | HTML, CSS, JavaScript |
| **Backend** | Flask Web Server |
| **AI Engine** | Ollama with Llama 3 / CodeLlama |


---

## 🧠 How It Works / Architecture Overview

The app connects your browser interface with a **Flask backend** that manages AI inference requests.  
Depending on your selected mode:
- **Cloud Mode:** Sends prompts to the **Groq Llama 3 API**.
- **Offline Mode:** Communicates with your **local Ollama** instance.  

Each iteration passes the AI’s output back into the editor, creating a **continuous improvement loop**.  
A **visual diff engine** compares old vs. new code for easy review.

---

## 📂 Data or Input Files

- `game_code_iterator_pro.py` — Flask backend server  
- `templates/` — HTML files  
- `static/` — JavaScript, CSS, and icons  
- `requirements.txt` — Python dependencies  

---

## 💻 Getting Started

### Prerequisites

- **Python 3.7+**
- **[Ollama](https://ollama.com/)** (for offline mode)
- **Groq Account** (for cloud mode)

---

### ▶️ Running the Application

1. **Ensure Ollama is running** in the background (if you're using Offline Mode).  
   - You can start it manually or let it run automatically if already configured.

2. **Start the Flask server:**
   ```bash
   python game_code_iterator_pro.py

3. **Open your browser and go to:**
👉 http://127.0.0.1:5000

---
### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Hybrid-AI-Code-Studio.git
cd Hybrid-AI-Code-Studio

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate  # For Windows
# source venv/bin/activate  # For macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up Groq (Cloud Mode)
# - Get your free API key from https://groq.com/keys
# - Paste it into 'GROQ_API_KEY' in game_code_iterator_pro.py

# 5. Set up Ollama (Offline Mode)
# - Install Ollama from https://ollama.com/
ollama pull phi3:mini
# Optional:
ollama pull llama3:8b-q3-k-m

```

### 💻 Usage

1. **Select AI Model** – Choose from “Cloud: Llama 3” or “Offline: Ollama”.  
2. **Paste Code** – Add your game code in the “Original Code” box.  
3. **Enter Prompt** – Describe the change (e.g., “add double jump”, “improve physics”).  
4. **Click Improve Code** – Let the AI generate better code.  
5. **Review Tabs** –  
   - **Improved Code:** View new version  
   - **Diff:** See what changed  
   - **Explanation:** Read AI’s notes  
6. **Integrate Changes** – Apply updates automatically for the next iteration.


---


## Example

**Original Code:**
```python
class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 32
        self.height = 32
        self.velocity_x = 0
        self.velocity_y = 0
        self.is_jumping = False
    def update(self):
        # Apply gravity
        if self.is_jumping:
            self.velocity_y += 0.5
        
        # Update position
        self.x += self.velocity_x
        self.y += self.velocity_y
        
        # Simple ground collision
        if self.y > 400:
            self.y = 400
            self.velocity_y = 0
            self.is_jumping = False
    
    def jump(self):
        if not self.is_jumping:
            self.velocity_y = -10
            self.is_jumping = True
    
    def move_left(self):
        self.velocity_x = -5
    
    def move_right(self):
        self.velocity_x = 5
    
    def stop(self):
        self.velocity_x = 0
```

**Prompt:**
"Improve the physics and add double jump capability in Python"

**Improved Code:**
```python
class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.width = 32
        self.height = 32
        self.velocity_x = 0
        self.velocity_y = 0
        self.is_jumping = False
        self.can_double_jump = False
        self.gravity = 0.5
        self.jump_strength = 10
        self.double_jump_strength = 7
        self.terminal_velocity = 12
        self.ground_friction = 0.15
        self.air_resistance = 0.02
    
    def update(self, delta_time=1.0):
        # Apply gravity with delta time scaling
        self.velocity_y += self.gravity * delta_time
        
        # Apply terminal velocity
        if self.velocity_y > self.terminal_velocity:
            self.velocity_y = self.terminal_velocity
        
        # Apply air/ground friction
        if self.is_jumping:
            # Air resistance
            if self.velocity_x > 0:
                self.velocity_x -= self.air_resistance * delta_time
            elif self.velocity_x < 0:
                self.velocity_x += self.air_resistance * delta_time
        else:
            # Ground friction
            if self.velocity_x > 0:
                self.velocity_x -= self.ground_friction * delta_time
                if self.velocity_x < 0:
                    self.velocity_x = 0
            elif self.velocity_x < 0:
                self.velocity_x += self.ground_friction * delta_time
                if self.velocity_x > 0:
                    self.velocity_x = 0
        
        # Update position with delta time scaling
        self.x += self.velocity_x * delta_time
        self.y += self.velocity_y * delta_time
        
        # Simple ground collision
        if self.y > 400:
            self.y = 400
            self.velocity_y = 0
            self.is_jumping = False
            self.can_double_jump = False  # Reset double jump when landing
    
    def jump(self):
        if not self.is_jumping:
            # First jump
            self.velocity_y = -self.jump_strength
            self.is_jumping = True
            self.can_double_jump = True  # Enable double jump
        elif self.can_double_jump:
            # Double jump
            self.velocity_y = -self.double_jump_strength
            self.can_double_jump = False  # Use up double jump
    
    def move_left(self):
        self.velocity_x = -5
    
    def move_right(self):
        self.velocity_x = 5
    
    def stop(self):
        self.velocity_x = 0
```

---

 ## Credit
 #### - Vikas Kushwaha
 #### - connect with me on linkedln www.linkedin.com/in/vikaskushwaha5424











