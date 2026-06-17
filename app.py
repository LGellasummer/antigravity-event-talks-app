import os
import urllib.request
import xml.etree.ElementTree as ET
from flask import Flask, jsonify, render_template

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
ATOM_NS = {"atom": "http://www.w3.org/2005/Atom"}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/release-notes")
def get_release_notes():
    try:
        # Fetch the XML feed using urllib to minimize package requirements
        req = urllib.request.Request(
            FEED_URL, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            xml_data = response.read()
            
        root = ET.fromstring(xml_data)
        
        entries = []
        for entry in root.findall("atom:entry", ATOM_NS):
            title_el = entry.find("atom:title", ATOM_NS)
            updated_el = entry.find("atom:updated", ATOM_NS)
            id_el = entry.find("atom:id", ATOM_NS)
            
            # Content or summary
            content_el = entry.find("atom:content", ATOM_NS)
            if content_el is None:
                content_el = entry.find("atom:summary", ATOM_NS)
                
            title = title_el.text if title_el is not None else "No Title"
            updated = updated_el.text if updated_el is not None else ""
            note_id = id_el.text if id_el is not None else ""
            content = content_el.text if content_el is not None else ""
            
            entries.append({
                "id": note_id,
                "title": title,
                "updated": updated,
                "content": content
            })
            
        return jsonify({"success": True, "notes": entries})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
