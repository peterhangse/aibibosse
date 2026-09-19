class InputComponent {
    constructor(containerId, onSend, onRecord) {
        this.container = document.getElementById(containerId);
        this.onSend = onSend;
        this.onRecord = onRecord;
        this.isTyping = false;
        this.render();
        this.bindEvents();
    }
    render() {
        this.container.innerHTML = `
            <div class="input-wrapper">
                <button id="micBtn" class="mic-btn" aria-label="Spela in">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
                <input type="text" id="userInput" placeholder="Skriv här..." autocomplete="off">
                <button id="sendBtn" class="send-btn" aria-label="Skicka">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            <button id="humanBtn" class="human-btn" type="button">Prata med en bibliotekarie</button>
            <div class="status-bar"><span class="status-dot" id="statusDot"></span><span class="status-text" id="statusText">Ansluter...</span></div>`;
        this.input = this.container.querySelector('#userInput');
        this.btn = this.container.querySelector('#sendBtn');
        this.micBtn = this.container.querySelector('#micBtn');
        this.humanBtn = this.container.querySelector('#humanBtn');
        this.statusDot = this.container.querySelector('#statusDot');
        this.statusText = this.container.querySelector('#statusText');
    }
    bindEvents() {
        this.btn.addEventListener('click', () => this.send());
        this.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this.send(); });
        this.micBtn.addEventListener('click', () => this.onRecord && this.onRecord());
        this.humanBtn.addEventListener('click', () => this.requestHuman());
    }
    async requestHuman() {
        this.humanBtn.disabled = true;
        this.humanBtn.textContent = 'Skickar...';
        try {
            const r = await fetch('/api/human', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: localStorage.getItem('bosse_session_id') || '',
                    message: this.input.value.trim() || 'Besökaren vill prata med personal'
                })
            });
            const d = await r.json();
            this.humanBtn.textContent = d.message || 'En bibliotekarie kontaktar dig snart!';
            this.humanBtn.classList.add('sent');
        } catch (e) {
            console.warn('Kunde inte begära personal:', e);
            this.humanBtn.disabled = false;
            this.humanBtn.textContent = 'Det gick inte just nu - försök igen';
        }
    }
    send() { const t = this.input.value.trim(); if (!t || this.isTyping) return; this.input.value = ''; this.onSend(t); }
    setTyping(t) { this.isTyping = t; this.btn.disabled = t; this.input.disabled = t; }
    focus() { this.input.focus(); }
    setStatus(mode, modelName) {
        this.statusDot.className = 'status-dot';
        if (mode === 'ollama') { this.statusDot.classList.add('online'); this.statusText.textContent = 'Bosse är här'; }
        else if (mode === 'dummy') { this.statusDot.classList.add('dummy'); this.statusText.textContent = 'Bosse är här (övar)'; }
        else { this.statusDot.classList.add('offline'); this.statusText.textContent = 'Bosse har gått på rast'; }
    }
    setRecording(rec) { if (rec) this.micBtn.classList.add('recording'); else this.micBtn.classList.remove('recording'); }
    setText(text) { this.input.value = text; }
}

