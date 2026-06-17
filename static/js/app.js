document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshIcon = document.getElementById('refresh-icon');
    const notesList = document.getElementById('notes-list');
    const notesCount = document.getElementById('notes-count');
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const retryBtn = document.getElementById('retry-btn');
    
    // Tweet Composer Elements
    const noSelectionState = document.getElementById('no-selection-state');
    const selectionState = document.getElementById('selection-state');
    const previewTitle = document.getElementById('preview-title');
    const previewDate = document.getElementById('preview-date');
    const tweetText = document.getElementById('tweet-text');
    const charUsed = document.getElementById('char-used');
    const tweetBtn = document.getElementById('tweet-btn');

    // Theme Toggle Elements
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    let releaseNotes = [];
    let selectedNote = null;

    // Initialize Theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.className = 'fa-solid fa-moon';
    } else {
        document.documentElement.removeAttribute('data-theme');
        themeIcon.className = 'fa-solid fa-sun';
    }


    // Fetch release notes from Flask API
    async function fetchReleaseNotes() {
        showLoading(true);
        
        try {
            const response = await fetch('/api/release-notes');
            const data = await response.json();
            
            if (data.success) {
                releaseNotes = data.notes;
                renderNotes();
                showLoading(false);
            } else {
                throw new Error(data.error || 'Failed to fetch release notes.');
            }
        } catch (error) {
            console.error('Error fetching release notes:', error);
            showError(error.message);
        }
    }

    // Render notes into the DOM
    function renderNotes() {
        notesList.innerHTML = '';
        notesCount.textContent = `${releaseNotes.length} Updates`;
        
        if (releaseNotes.length === 0) {
            notesList.innerHTML = `
                <div class="glass-card" style="padding: 40px; text-align: center; color: var(--text-secondary);">
                    No release notes found.
                </div>
            `;
            return;
        }

        releaseNotes.forEach(note => {
            const card = document.createElement('div');
            card.className = 'note-card';
            if (selectedNote && selectedNote.id === note.id) {
                card.classList.add('selected');
            }
            
            const dateStr = formatDate(note.updated);
            
            card.innerHTML = `
                <div class="note-meta">
                    <span class="note-date">
                        <i class="fa-regular fa-calendar"></i> ${dateStr}
                    </span>
                    <span class="badge" style="background: rgba(139, 92, 246, 0.1); color: #c084fc; border-color: rgba(139, 92, 246, 0.2);">
                        BigQuery
                    </span>
                </div>
                <h3 class="note-title">${escapeHTML(note.title)}</h3>
                <div class="note-body">${note.content}</div>
            `;
            
            card.addEventListener('click', () => selectNote(note, card));
            notesList.appendChild(card);
        });
    }

    // Select a note
    function selectNote(note, cardElement) {
        // Deselect previous
        document.querySelectorAll('.note-card').forEach(c => c.classList.remove('selected'));
        
        if (selectedNote && selectedNote.id === note.id) {
            // Toggle off
            selectedNote = null;
            updateComposer();
        } else {
            selectedNote = note;
            cardElement.classList.add('selected');
            updateComposer();
            
            // Scroll composer into view on mobile
            if (window.innerWidth <= 1024) {
                selectionState.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    // Update the Tweet Composer panel
    function updateComposer() {
        if (!selectedNote) {
            noSelectionState.classList.add('active');
            noSelectionState.classList.remove('hidden');
            selectionState.classList.add('hidden');
            selectionState.classList.remove('active');
            return;
        }

        noSelectionState.classList.remove('active');
        noSelectionState.classList.add('hidden');
        selectionState.classList.remove('hidden');
        selectionState.classList.add('active');

        previewTitle.textContent = selectedNote.title;
        previewDate.textContent = formatDate(selectedNote.updated);

        // Pre-fill tweet template
        // Strip HTML tags for clean text extraction if any inside content
        const cleanContent = stripHTML(selectedNote.content);
        const tweetLimit = 280;
        
        // Build template: "Title - Details... Link"
        const link = "https://cloud.google.com/bigquery/docs/release-notes";
        const prefix = `BigQuery Update: ${selectedNote.title}\n\n`;
        const suffix = `\n\n#BigQuery #GCP\n${link}`;
        
        // Calculate remaining room for the content snippet
        const availableLength = tweetLimit - prefix.length - suffix.length;
        
        let snippet = cleanContent.trim();
        if (snippet.length > availableLength) {
            snippet = snippet.substring(0, availableLength - 3) + '...';
        }
        
        tweetText.value = `${prefix}${snippet}${suffix}`;
        updateCharCount();
    }

    // Update tweet character counter
    function updateCharCount() {
        const len = tweetText.value.length;
        charUsed.textContent = len;
        
        const counterContainer = charUsed.parentElement;
        counterContainer.className = 'char-counter';
        
        if (len > 280) {
            counterContainer.classList.add('danger');
        } else if (len > 250) {
            counterContainer.classList.add('warning');
        }
    }

    // Post to Twitter via Web Intent
    function postTweet() {
        if (!tweetText.value) return;
        const text = encodeURIComponent(tweetText.value);
        const url = `https://twitter.com/intent/tweet?text=${text}`;
        window.open(url, '_blank');
    }

    // Loading / Spinner helpers
    function showLoading(isLoading) {
        if (isLoading) {
            refreshIcon.classList.add('spinning');
            refreshBtn.disabled = true;
            loadingContainer.classList.remove('hidden');
            notesList.classList.add('hidden');
            errorContainer.classList.add('hidden');
        } else {
            refreshIcon.classList.remove('spinning');
            refreshBtn.disabled = false;
            loadingContainer.classList.add('hidden');
            notesList.classList.remove('hidden');
        }
    }

    function showError(message) {
        refreshIcon.classList.remove('spinning');
        refreshBtn.disabled = false;
        loadingContainer.classList.add('hidden');
        notesList.classList.add('hidden');
        errorContainer.classList.remove('hidden');
        errorMessage.textContent = message;
    }

    // Formatter helpers
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }

    function escapeHTML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function stripHTML(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    // Toggle Theme function
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            document.documentElement.removeAttribute('data-theme');
            themeIcon.className = 'fa-solid fa-sun';
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            themeIcon.className = 'fa-solid fa-moon';
            localStorage.setItem('theme', 'light');
        }
    }

    // Event Listeners
    themeToggle.addEventListener('click', toggleTheme);
    refreshBtn.addEventListener('click', fetchReleaseNotes);
    retryBtn.addEventListener('click', fetchReleaseNotes);
    tweetText.addEventListener('input', updateCharCount);
    tweetBtn.addEventListener('click', postTweet);

    // Initial load
    fetchReleaseNotes();
});
