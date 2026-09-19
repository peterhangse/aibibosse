let avatar, chat, input;
let mediaRecorder, audioChunks = [];
let appConfig = {};
const AIBI_NIVA = window.AIBI_NIVA || new URLSearchParams(location.search).get('niva') || undefined;
const IS_STAFF = ['personal', 'intern', 'staff'].includes((window.AIBI_NIVA || '').toLowerCase());

const IDLE_MS = 75000;
let idleTimer = null;
let attractAvatar = null;

async function init() {
    try { const r = await fetch('/api/config'); appConfig = await r.json(); }
    catch { appConfig = { avatar: { emoji: '🙂' }, personality: { nickname: 'Bosse', real_name: 'SjöBo', role: 'Bibliotekets digitala värd' }, ui: { greeting: "Hej!\n\nJag heter egentligen SjöBo, men folk kallar mig Bosse.\n\nJag är bibliotekets digitala värd.\n\nHur kan jag hjälpa dig idag?", quick_questions: [], open_now: "Biblioteket har öppet idag – kolla öppettiderna på vår hemsida." }, speech: { tts_enabled: false } }; }
    // Röst: om tts_enabled → läs varje svar högt automatiskt.
    window.BOSSE_SPEECH = { auto: Boolean(appConfig.speech && appConfig.speech.tts_enabled) };

    avatar = new AvatarComponent('avatarSection', appConfig);
    chat = new ChatComponent('chatHistory');
    input = new InputComponent('inputArea', handleSend, toggleRecording);

    chat.clear();
    localStorage.removeItem('bosse_session_id');
    chat.saveSessionId('');

    const greeting = appConfig.ui?.greeting || "Hej! Jag är Bosse. Hur kan jag hjälpa dig?";
    chat.appendMessage(greeting, 'bosse');
    renderChips();

    if (!IS_STAFF) setupAttract();
    checkHealth();
    resetIdle();
}

function resetIdle() {
    if (IS_STAFF || !document.getElementById('attractOverlay')) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(showAttract, IDLE_MS);
}

function showAttract() {
    const ov = document.getElementById('attractOverlay');
    if (!ov || ov.classList.contains('hidden') === false) return;
    chat.stopSpeak();
    document.getElementById('attractOpen').textContent =
        appConfig.ui?.open_now || "Biblioteket har öppet idag – kolla öppettiderna på vår hemsida";
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
    const ov = document.getElementById('attractOverlay');
    ov.addEventListener('click', hideAttract);
    window.addEventListener('keydown', () => { if (!ov.classList.contains('hidden')) hideAttract(); });
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
            el.classList.add('hidden');
            handleSend(q);
        });
        return b;
    });
    el.replaceChildren(...btns);
}

async function checkHealth() { try { const r = await fetch('/api/health'); const d = await r.json(); input.setStatus(d.mode, d.model); } catch { input.setStatus('offline'); } }

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
            await sendAudio(blob);
        };
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
    avatar.nod();
    avatar.setThinking(true);
    chat.appendMessage(text, 'user');
    chat.scrollToBottom();
    input.setTyping(true);
    chat.appendTyping();
    chat.scrollToBottom();
    const sid = chat.getSessionId();

    try {
        const payload = { message: text };
        if (AIBI_NIVA) payload.niva = AIBI_NIVA;
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Session-Id': sid }, body: JSON.stringify(payload) });
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
        if (newSid && newSid !== sid) chat.saveSessionId(newSid);
        chat.scrollToBottom();
    } catch (err) {
        chat.removeTyping();
        avatar.setReady();
        chat.appendMessage('Ursäkta, något gick fel.', 'bosse');
        input.setStatus('offline');
        console.error(err);
    } finally {
        avatar.setReady();
        input.setTyping(false);
        input.focus();
        resetIdle();
    }
}

init();
