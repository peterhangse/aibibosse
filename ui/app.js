let avatar, chat, input;
let mediaRecorder, audioChunks = [];
let kastaInspelning = false;
let appConfig = {};
let initialGreeting = '';
const AIBI_NIVA = window.AIBI_NIVA || new URLSearchParams(location.search).get('niva') || undefined;
const IS_STAFF = ['personal', 'intern', 'staff'].includes((window.AIBI_NIVA || '').toLowerCase());

let idleTimer = null;
let attractAvatar = null;

function enterConversationMode() {
    const wrapper = document.querySelector('.chat-wrapper');
    if (!wrapper || wrapper.classList.contains('conversation-active')) return;
    wrapper.classList.add('conversation-active');
    requestAnimationFrame(() => chat && chat.scrollToBottom());
}

window.enterConversationMode = enterConversationMode;

async function init() {
    appConfig = await AIBI.ladda();
    // Röst: om tts_enabled → läs varje svar högt automatiskt.
    window.BOSSE_SPEECH = { auto: Boolean(appConfig.speech && appConfig.speech.tts_enabled) };
    document.title = `${AIBI.namn()} — ${AIBI.roll()}` + (IS_STAFF ? ' — personalskärm' : '');

    avatar = new AvatarComponent('avatarSection', appConfig);
    chat = new ChatComponent('chatHistory');
    input = new InputComponent('inputArea', handleSend, toggleRecording, { isStaff: IS_STAFF });

    initialGreeting = AIBI.halsning();
    const introText = document.getElementById('introText');
    if (introText) introText.textContent = initialGreeting;

    if (!IS_STAFF) setupAttract();
    aterstallSamtal();
    checkHealth();
    setInterval(checkHealth, 60000);
    for (const typ of ['pointerdown', 'keydown', 'input']) {
        document.addEventListener(typ, () => { if (!attractVisas()) resetIdle(); }, { passive: true });
    }
    resetIdle();
}

/* Nollställer allt som en besökare kan ha lämnat efter sig, så att nästa
   besökare aldrig ser eller ärver något från den förra (krav F6). */
function aterstallSamtal() {
    if (chat) chat.stopSpeak();
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        kastaInspelning = true;
        mediaRecorder.stop();
    }
    if (input) { input.setRecording(false); input.clear(); input.resetHuman(); input.setTyping(false); }
    if (avatar) avatar.setReady();
    if (chat) { chat.removeTyping(); chat.clear(); chat.saveSessionId(''); }
    localStorage.removeItem('bosse_session_id');
    const wrapper = document.querySelector('.chat-wrapper');
    if (wrapper) wrapper.classList.remove('conversation-active');
    const chips = document.getElementById('quickChips');
    if (chips) chips.classList.remove('hidden');
    renderChips();
    if (window.AIBI_A11Y) AIBI_A11Y.aterstall();
    const scroll = document.getElementById('chatScroll');
    if (scroll) scroll.scrollTop = 0;
}

function attractVisas() {
    const ov = document.getElementById('attractOverlay');
    return Boolean(ov && !ov.classList.contains('hidden'));
}

function resetIdle() {
    if (IS_STAFF || !document.getElementById('attractOverlay')) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(showAttract, AIBI.vantetidMs(75));
}

function showAttract() {
    const ov = document.getElementById('attractOverlay');
    if (!ov || attractVisas()) return;
    aterstallSamtal();
    const open = appConfig.ui?.open_now || '';
    document.getElementById('attractOpen').textContent = open;
    ov.classList.remove('hidden');
}

function hideAttract() {
    const ov = document.getElementById('attractOverlay');
    if (!ov) return;
    ov.classList.add('hidden');
    input.focus();
    resetIdle();
}

function setupAttract() {
    attractAvatar = new AvatarComponent('attractScene', appConfig, 'bosseSceneAttract');
    const namn = AIBI.namn();
    document.getElementById('attractTitle').textContent = `Hej! Jag heter ${namn}.`;
    document.getElementById('attractSub').textContent =
        'Jag är bibliotekets AI-värd. Fråga mig om böcker, öppettider eller biblioteket.';
    const ov = document.getElementById('attractOverlay');
    ov.addEventListener('click', hideAttract);
    window.addEventListener('keydown', () => { if (attractVisas()) hideAttract(); });
}

function renderChips() {
    const el = document.getElementById('quickChips');
    if (!el) return;
    const fallback = ['Vad har ni för öppettider?', 'Vad är bästa barnboken just nu?', 'Vad händer på biblioteket?', 'Hur skaffar jag lånekort?'];
    const qs = (appConfig.ui?.quick_questions && appConfig.ui.quick_questions.length) ? appConfig.ui.quick_questions : fallback;
    const btns = qs.slice(0, 4).map(q => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'quick-chip';
        b.textContent = q;
        b.addEventListener('click', () => {
            if (input && input.isOffline) return;
            el.classList.add('hidden');
            handleSend(q);
        });
        return b;
    });
    el.replaceChildren(...btns);
}

async function checkHealth() {
    try {
        const r = await fetch('/api/health');
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const d = await r.json();
        input.setStatus(d.mode || 'online', d.model);
    } catch {
        input.setStatus('offline');
    }
}

async function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') { mediaRecorder.stop(); input.setRecording(false); avatar.setListening(false); resetIdle(); return; }
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) audioChunks.push(e.data); };
        mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];
            stream.getTracks().forEach(t => t.stop());
            if (kastaInspelning) { kastaInspelning = false; return; }
            await sendAudio(blob);
        };
        kastaInspelning = false;
        mediaRecorder.start();
        input.setRecording(true);
        avatar.setListening(true);
    } catch (err) { console.error('Mikrofon:', err); alert('Kunde inte komma åt mikrofonen.'); }
}

async function sendAudio(blob) {
    input.setTyping(true); chat.appendTyping();
    avatar.setListening(false); avatar.setThinking(true);
    try {
        const fd = new FormData(); fd.append('audio', blob, 'recording.webm');
        const r = await fetch('/api/stt', { method: 'POST', body: fd });
        const d = await r.json();
        chat.removeTyping();
        avatar.setThinking(false);
        if (d.text) { 
            handleSend(d.text); 
        }
        else { chat.appendMessage('Jag hörde inte vad du sa. Kan du upprepa?', 'bosse'); input.setTyping(false); resetIdle(); }
    } catch (err) { chat.removeTyping(); avatar.setReady(); chat.appendMessage('Något gick fel med röstigenkänningen.', 'bosse'); console.error(err); input.setTyping(false); resetIdle(); }
}

async function handleSend(text) {
    if (idleTimer) clearTimeout(idleTimer);
    avatar.nod();
    avatar.setThinking(true);
    chat.appendMessage(text, 'user');
    enterConversationMode();
    chat.scrollToBottom();
    input.setTyping(true);
    chat.appendTyping();
    chat.scrollToBottom();
    const sid = chat.getSessionId();

    try {
        const payload = { message: text };
        if (AIBI_NIVA) payload.niva = AIBI_NIVA;
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Session-Id': sid }, body: JSON.stringify(payload) });
        if (!r.ok || !r.body) throw new Error('HTTP ' + r.status);
        chat.removeTyping();
        const bosseMsg = chat.appendMessage('', 'bosse');
        chat.scrollToBottom();
        let full = '', newSid = sid, streamed = false;
        const reader = r.body.getReader(); const decoder = new TextDecoder(); let buf = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            const lines = buf.split('\n');
            buf = lines.pop();
            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const ds = line.slice(6).trim();
                if (ds === '[DONE]') continue;
                try {
                    const d = JSON.parse(ds);
                    if (d.chunk) {
                        full += d.chunk; bosseMsg.textContent = full; chat.scrollToBottom();
                        if (!streamed) { avatar.setThinking(false); avatar.setTalking(true); streamed = true; }
                    }
                    if (d.session_id) newSid = d.session_id;
                    if (d.kallor && d.kallor.length) chat.appendSources(d.kallor);
                } catch {}
            }
        }
        avatar.setTalking(false);
        if (!full.trim()) { full = 'Jag fick inget svar just nu. Försök gärna igen.'; bosseMsg.textContent = full; }
        if (window.AIBI_A11Y) AIBI_A11Y.las(full);
        if (newSid && newSid !== sid) chat.saveSessionId(newSid);
        chat.scrollToBottom();
    } catch (err) {
        chat.removeTyping();
        avatar.setReady();
        chat.appendMessage('Ursäkta, något gick fel.', 'bosse');
        checkHealth();
        console.error(err);
    } finally {
        avatar.setReady();
        input.setTyping(false);
        input.focus();
        resetIdle();
    }
}

init();
