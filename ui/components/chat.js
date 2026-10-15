class ChatComponent {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scrollContainer = this.container?.closest('.chat-scroll') || this.container;
        this.sessionId = localStorage.getItem('bosse_session_id') || '';
        this.msgIndex = 0;
    }

    appendMessage(text, sender) {
        const group = document.createElement('div');
        group.className = `msg-group ${sender}`;

        const bubble = document.createElement('div');
        bubble.className = `message ${sender}`;
        bubble.textContent = text;
        group.appendChild(bubble);

        if (sender === 'bosse') {
            const idx = this.msgIndex++;
            const row = this.buildFeedbackRow(idx);
            this.buildReadButton(row, bubble);
            group.appendChild(row);
            if (!text) {
                row.style.display = 'none';
                const obs = new MutationObserver(() => {
                    if (bubble.textContent.trim().length > 0) {
                        row.style.display = '';
                        obs.disconnect();
                        if (window.BOSSE_SPEECH && window.BOSSE_SPEECH.auto) this.speak(bubble.textContent);
                    }
                });
                obs.observe(bubble, { childList: true, characterData: true, subtree: true });
            }
        }

        this.container.appendChild(group);
        this.scrollToBottom();
        return bubble;
    }

    appendSources(sources) {
        if (!sources || sources.length === 0) return;
        const groups = this.container.querySelectorAll('.msg-group.bosse');
        if (groups.length === 0) return;
        const group = groups[groups.length - 1];

        const row = document.createElement('div');
        row.className = 'msg-sources';
        const label = document.createElement('div');
        label.className = 'sources-label';
        label.textContent = 'Enligt våra källor:';
        row.appendChild(label);
        /* Har källan en webbadress visas en QR-kod när man trycker, så att
           besökaren kan öppna sidan i mobilen. Annars är källan bara text. */
        for (const s of sources) {
            const url = window.AIBI_QR ? AIBI_QR.lank(s) : '';
            const chip = document.createElement(url ? 'button' : 'span');
            chip.className = 'source-chip' + (url ? ' har-lank' : '');
            chip.textContent = s.titel;
            if (url) {
                chip.type = 'button';
                chip.setAttribute('aria-label', `${s.titel}. Visa QR-kod till sidan`);
                chip.insertAdjacentHTML('beforeend', '<span class="qr-ikon" aria-hidden="true"><svg viewBox="0 0 16 16" width="13" height="13"><path fill="currentColor" d="M1 1h6v6H1zm2 2v2h2V3zm6-2h6v6H9zm2 2v2h2V3zM1 9h6v6H1zm2 2v2h2v-2zm7-2h2v2h-2zm3 0h2v3h-2zm-3 3h2v3h-2zm3 2h2v1h-2z"/></svg></span>');
                chip.addEventListener('click', () => AIBI_QR.visa(url, s.titel));
            }
            row.appendChild(chip);
        }
        group.appendChild(row);
        this.scrollToBottom();
    }

    buildFeedbackRow(idx) {
        const row = document.createElement('div');
        row.className = 'message-feedback';

        const up = document.createElement('button');
        up.className = 'feedback-btn up';
        up.type = 'button';
        up.setAttribute('aria-label', 'Bra svar');
        up.textContent = '👍';

        const down = document.createElement('button');
        down.className = 'feedback-btn down';
        down.type = 'button';
        down.setAttribute('aria-label', 'Dåligt svar');
        down.textContent = '👎';

        const vote = async (rating) => {
            up.classList.add('voted');
            down.classList.add('voted');
            try {
                await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        session_id: this.sessionId || localStorage.getItem('bosse_session_id') || '',
                        message_idx: idx,
                        rating: rating,
                        comment: ''
                    })
                });
            } catch (e) {
                console.warn('Kunde inte spara feedback:', e);
            }
            row.querySelectorAll('.read-btn').forEach(b => b.remove());
            row.textContent = 'Tack för hjälpen!';
            row.classList.add('feedback-thanks');
        };

        up.addEventListener('click', () => vote(1));
        down.addEventListener('click', () => vote(-1));

        row.appendChild(up);
        row.appendChild(down);
        return row;
    }

    /* "Läs upp"-knapp per svar — tillgänglighet (äldre, synnedsättning, läsovana). */
    buildReadButton(row, bubble) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'read-btn';
        btn.setAttribute('aria-label', 'Läs svaret högt');
        btn.innerHTML = '<span>🔊</span><span class="read-label">Läs upp</span>';
        const label = btn.querySelector('.read-label');

        btn.addEventListener('click', () => {
            const speaking = btn.classList.contains('speaking');
            this.stopSpeak();
            btn.classList.remove('speaking');
            label.textContent = 'Läs upp';
            if (!speaking) {
                const txt = (bubble.textContent || '').trim();
                if (!txt) return;
                this.speak(txt);
                btn.classList.add('speaking');
                label.textContent = 'Stoppa';
            }
        });
        row.insertBefore(btn, row.firstChild);
        this.lastReadBtn = btn;
    }

    /* Röstmotor: Web Speech API (sv-SE) — ingen backend, inget GPU-behov. */
    speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const clean = String(text || '').replace(/\s+/g, ' ').trim().slice(0, 600);
        if (!clean) return;
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = 'sv-SE';
        const voices = window.speechSynthesis.getVoices();
        const sv = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('sv'));
        if (sv) u.voice = sv;
        u.rate = 1.02;
        u.pitch = 1;
        u.onend = () => {
            if (this.lastReadBtn) { this.lastReadBtn.classList.remove('speaking'); const l = this.lastReadBtn.querySelector('.read-label'); if (l) l.textContent = 'Läs upp'; }
        };
        window.speechSynthesis.speak(u);
    }

    stopSpeak() {
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    appendTyping() {
        const d = document.createElement('div');
        d.className = 'typing-bubble';
        d.id = 'typingIndicator';
        d.innerHTML = `
            <span class="typing-text">${(window.AIBI ? AIBI.namn() : 'Bosse').replace(/[<>&"]/g, '')} tänker</span>
            <span class="typing-dots"><span></span><span></span><span></span></span>
        `;
        this.container.appendChild(d);
        this.scrollToBottom();
        return d;
    }

    removeTyping() {
        const e = document.getElementById('typingIndicator');
        if (e) e.remove();
    }

    scrollToBottom() {
        const target = this.scrollContainer || this.container;
        if (!target) return;
        requestAnimationFrame(() => {
            target.scrollTop = target.scrollHeight;
        });
    }

    clear() {
        this.container.innerHTML = '';
        this.msgIndex = 0;
    }

    saveSessionId(id) {
        this.sessionId = id;
        localStorage.setItem('bosse_session_id', id);
    }

    getSessionId() {
        return this.sessionId;
    }

    async loadHistory() {
        if (!this.sessionId) return;
        try {
            const r = await fetch('/api/history', { headers: { 'X-Session-Id': this.sessionId } });
            const d = await r.json();
            if (d.messages) {
                this.clear();
                for (const m of d.messages) {
                    this.appendMessage(m.content, m.role === 'user' ? 'user' : 'bosse');
                }
                if (d.messages.some(m => m.role === 'user') && typeof window.enterConversationMode === 'function') {
                    window.enterConversationMode();
                }
            }
        } catch (e) {
            console.warn('Kunde inte ladda historik:', e);
        }
    }
}
