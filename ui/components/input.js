class InputComponent {
    constructor(containerId, onSend, onRecord, options = {}) {
        this.container = document.getElementById(containerId);
        this.onSend = onSend;
        this.onRecord = onRecord;
        this.isStaff = Boolean(options.isStaff);
        this.isTyping = false;
        this.isOffline = false;
        this.render();
        this.bindEvents();
    }
    render() {
        this.container.innerHTML = `
            <div class="offline-notice hidden" id="offlineNotice" role="alert"></div>
            <div class="input-wrapper">
                <button id="micBtn" class="mic-btn" aria-label="Spela in">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
                <input type="text" id="userInput" placeholder="Skriv här..." autocomplete="off" aria-label="Skriv din fråga">
                <button id="sendBtn" class="send-btn" aria-label="Skicka">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
            <button id="humanBtn" class="human-btn" type="button">Prata med en bibliotekarie</button>
            <p class="human-svar hidden" id="humanSvar" role="status"></p>
            <div class="status-row">
                <div class="status-bar"><span class="status-dot" id="statusDot"></span><span class="status-text" id="statusText">Ansluter...</span></div>
                <div class="a11y-plats" id="a11yPlats"></div>
            </div>`;
        this.input = this.container.querySelector('#userInput');
        this.btn = this.container.querySelector('#sendBtn');
        this.micBtn = this.container.querySelector('#micBtn');
        this.humanBtn = this.container.querySelector('#humanBtn');
        this.humanSvar = this.container.querySelector('#humanSvar');
        this.statusDot = this.container.querySelector('#statusDot');
        this.statusText = this.container.querySelector('#statusText');
        this.offlineNotice = this.container.querySelector('#offlineNotice');
        if (window.AIBI_A11Y) AIBI_A11Y.skapa(this.container.querySelector('#a11yPlats'));
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
            if (!r.ok) throw new Error('HTTP ' + r.status);
            const d = await r.json().catch(() => ({}));
            this.humanBtn.textContent = 'Förfrågan skickad';
            this.humanBtn.classList.add('sent');
            this.visaHumanSvar(AIBI.personalSvar(d.message));
        } catch (e) {
            console.warn('Kunde inte begära personal:', e);
            this.humanBtn.disabled = false;
            this.humanBtn.textContent = 'Prata med en bibliotekarie';
            const tel = AIBI.telefon();
            this.visaHumanSvar('Det gick inte att nå personalen härifrån just nu.'
                + (tel ? ` Ring ${tel}.` : ' Försök igen om en stund.'));
        }
    }
    visaHumanSvar(text) {
        this.humanSvar.textContent = text;
        this.humanSvar.classList.remove('hidden');
    }
    resetHuman() {
        this.humanBtn.disabled = false;
        this.humanBtn.classList.remove('sent');
        this.humanBtn.textContent = 'Prata med en bibliotekarie';
        this.humanSvar.textContent = '';
        this.humanSvar.classList.add('hidden');
    }
    send() { const t = this.input.value.trim(); if (!t || this.isTyping || this.isOffline) return; this.input.value = ''; this.onSend(t); }
    setTyping(t) { this.isTyping = t; this.applyDisabled(); }
    applyDisabled() {
        const av = this.isTyping || this.isOffline;
        this.btn.disabled = av;
        this.input.disabled = av;
        this.micBtn.disabled = this.isOffline;
    }
    focus() { if (window.AIBI_A11Y) AIBI_A11Y.fokus(this.input); else this.input.focus(); }
    clear() { this.input.value = ''; }
    /* mode från /api/health: 'dummy' = backend utan språkmodell,
       'offline' eller tomt = nere, allt annat (ollama, azure …) = igång. */
    setStatus(mode) {
        const namn = AIBI.namn();
        this.statusDot.className = 'status-dot';
        const nere = !mode || mode === 'offline';
        if (nere) {
            this.statusDot.classList.add('offline');
            this.statusText.textContent = `${namn} är inte igång`;
        } else if (mode === 'dummy' && this.isStaff) {
            this.statusDot.classList.add('dummy');
            this.statusText.textContent = `${namn} är här (övar)`;
        } else {
            this.statusDot.classList.add('online');
            this.statusText.textContent = `${namn} är här`;
        }
        this.isOffline = nere;
        document.documentElement.classList.toggle('aibi-nere', nere);
        this.offlineNotice.textContent = nere ? AIBI.nereText() : '';
        this.offlineNotice.classList.toggle('hidden', !nere);
        this.applyDisabled();
    }
    setRecording(rec) { if (rec) this.micBtn.classList.add('recording'); else this.micBtn.classList.remove('recording'); }
    setText(text) { this.input.value = text; }
}
