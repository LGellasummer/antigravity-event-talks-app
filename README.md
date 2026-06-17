# BigQuery Release Notes Hub

A modern, high-fidelity web application built with **Python Flask** and **Vanilla Frontend (HTML/CSS/JS)** to monitor, filter, and share Google Cloud's BigQuery release notes.

![Aesthetics](https://img.shields.io/badge/Aesthetics-Glassmorphism-blueviolet)
![Tech Stack](https://img.shields.io/badge/Tech%20Stack-Flask%20%7C%20HTML5%20%7C%20CSS3%20%7C%20JS-blue)

---

## ✨ Features

- **Backend RSS/Atom Proxy**: Safely requests and parses official BigQuery XML release notes from Google Cloud without facing CORS restrictions.
- **Glassmorphic UI**: Sleek dark mode visual layout built on vanilla CSS with interactive card hover/selection states.
- **Dynamic Content Formatting**: Renders rich text updates safely, retaining formatting for code elements, links, and lists.
- **Tweet Composer (X Integration)**: Instantly compiles selected release notes into a shareable tweet structure, trimming snippets automatically to fit the 280-character limit.
- **Character Counter**: Real-time counter featuring warning and danger states mimicking X's composer guidelines.
- **Loading & Error Indicators**: Smooth rotating refresh indicator, error handling, and manual retry functions.

---

## 🛠️ Project Structure

```text
├── app.py                 # Flask Server & API Endpoint
├── templates/
│   └── index.html         # Application layout & UI structures
├── static/
│   ├── css/
│   │   └── style.css      # Core styles & dark theme definitions
│   └── js/
│       └── app.js         # Fetch logic, card selection, and Tweet compiler
├── .gitignore             # Configured git ignore mappings
└── README.md              # Project overview & guidelines
```

---

## 🚀 Setup & Installation

### Prerequisites
Make sure you have Python 3.x installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/LGellasummer/antigravity-event-talks-app.git
cd antigravity-event-talks-app
```

### 2. Install dependencies
Install the required packages (Flask):
```bash
pip install flask
```

### 3. Run the development server
Start the Flask application:
```bash
python app.py
```

Open your browser and navigate to **[http://127.0.0.1:5000](http://127.0.0.1:5000)**.

---

## 🔄 How it Works (Data Flow)

1. **Get notes**: When you click the **Refresh Feed** button, a `GET` request is made to `/api/release-notes`.
2. **Retrieve XML**: The Flask server downloads the feed from `docs.cloud.google.com`.
3. **Parse XML**: Flask parses the XML structure (`atom:entry` data) into standard JSON.
4. **Interactive selection**: Clicking any release note card highlights it and copies its text to the Tweet Composer.
5. **Tweet**: Clicking **Post on X** triggers a secure external Web Intent redirection.
