/* Gemensamma inställningar för alla skärmar: namn, hälsning, bemanning,
   kontaktuppgifter och hur länge skärmen väntar innan den återställs.

   Allt hämtas från /api/config. Fält som saknas där fylls i från STANDARD,
   så att gränssnittet alltid fungerar även om backend inte svarar.
   Se README för vilka fält som finns. */
(function () {
    'use strict';

    const STANDARD = {
        avatar: { emoji: '🙂' },
        personality: { nickname: 'Bosse', real_name: 'SjöBo', role: 'Bibliotekets AI-värd' },
        ui: {
            greeting: 'Hej!\n\nJag heter egentligen SjöBo, men folk kallar mig Bosse.\n\nJag är bibliotekets AI-värd och svarar utifrån bibliotekets egen information.\n\nHur kan jag hjälpa dig idag?',
            quick_questions: [],
            open_now: '',
            idle_seconds: null,
        },
        speech: { tts_enabled: false },
        kontakt: { telefon: '' },
        // Exempel: [{ "dagar": [1, 2, 3, 4, 5], "fran": "10:00", "till": "18:00" }]
        // dagar: 1 = måndag … 7 = söndag. Tom lista = okänt, då lovar
        // gränssnittet ingenting om när personalen svarar.
        bemanning: [],
    };

    const VECKODAGAR = ['', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag', 'söndag'];

    function slaIhop(bas, extra) {
        const ut = { ...bas };
        for (const [nyckel, varde] of Object.entries(extra || {})) {
            const ar = (v) => v && typeof v === 'object' && !Array.isArray(v);
            ut[nyckel] = ar(varde) && ar(bas[nyckel]) ? { ...bas[nyckel], ...varde } : varde;
        }
        return ut;
    }

    function minuter(hhmm) {
        const m = /^(\d{1,2})[:.](\d{2})$/.exec(String(hhmm || '').trim());
        return m ? Number(m[1]) * 60 + Number(m[2]) : null;
    }

    const P = {
        config: STANDARD,

        async ladda() {
            try {
                const r = await fetch('/api/config');
                if (r.ok) P.config = slaIhop(STANDARD, await r.json());
            } catch { /* backend nere: standardvärdena gäller */ }
            return P.config;
        },

        namn() {
            const c = P.config;
            return c.personality?.nickname || c.avatar?.name || 'Bosse';
        },

        roll() {
            return P.config.personality?.role || STANDARD.personality.role;
        },

        /* AI-förordningen art. 50 och beslut 16: hälsningen ska säga att det
           är en AI. Saknas ordet i hälsningen från backend läggs en mening till. */
        halsning() {
            const text = P.config.ui?.greeting || STANDARD.ui.greeting;
            if (/\bAI\b/.test(text)) return text;
            return text + '\n\nJag är en AI och svarar utifrån bibliotekets egen information.';
        },

        vantetidMs(standardSekunder) {
            const s = Number(P.config.ui?.idle_seconds);
            return (s > 0 ? s : standardSekunder) * 1000;
        },

        telefon() {
            return (P.config.kontakt?.telefon || '').trim();
        },

        /* true = bemannat nu, false = obemannat nu, null = vet inte. */
        arBemannat(nu = new Date()) {
            const pass = Array.isArray(P.config.bemanning) ? P.config.bemanning : [];
            if (!pass.length) return null;
            const dag = nu.getDay() || 7;
            const min = nu.getHours() * 60 + nu.getMinutes();
            return pass.some((p) => (p.dagar || []).includes(dag)
                && minuter(p.fran) !== null && minuter(p.till) !== null
                && min >= minuter(p.fran) && min < minuter(p.till));
        },

        /* "i dag kl 13.00", "i morgon kl 10.00" eller "på måndag kl 10.00". */
        nastaBemannade(nu = new Date()) {
            const pass = Array.isArray(P.config.bemanning) ? P.config.bemanning : [];
            const nuMin = nu.getHours() * 60 + nu.getMinutes();
            for (let steg = 0; steg < 8; steg++) {
                const dag = ((nu.getDay() || 7) - 1 + steg) % 7 + 1;
                const starter = pass
                    .filter((p) => (p.dagar || []).includes(dag) && minuter(p.fran) !== null)
                    .map((p) => minuter(p.fran))
                    .filter((m) => steg > 0 || m > nuMin)
                    .sort((a, b) => a - b);
                if (starter.length) {
                    const m = starter[0];
                    const kl = `kl ${Math.floor(m / 60)}.${String(m % 60).padStart(2, '0')}`;
                    if (steg === 0) return `i dag ${kl}`;
                    if (steg === 1) return `i morgon ${kl}`;
                    return `på ${VECKODAGAR[dag]} ${kl}`;
                }
            }
            return '';
        },

        /* Text som visas efter att besökaren tryckt på personalknappen.
           Lovar aldrig mer än bemanningen tillåter (beslut 1). */
        personalSvar(meddelandeFranServer) {
            const tel = P.telefon();
            const bemannat = P.arBemannat();
            if (bemannat === true) {
                return meddelandeFranServer || 'Personalen har fått din förfrågan och kommer till dig.';
            }
            if (bemannat === false) {
                const nasta = P.nastaBemannade();
                let t = 'Just nu finns ingen personal på plats.';
                if (tel) t += ` Du kan ringa ${tel}.`;
                if (nasta) t += ` Personalen är tillbaka ${nasta}.`;
                return t;
            }
            return 'Din förfrågan är skickad till personalen.'
                + (tel ? ` Brådskar det kan du ringa ${tel}.` : '');
        },

        /* Text när tjänsten inte går att nå (krav L4). */
        nereText() {
            const tel = P.telefon();
            return `${P.namn()} fungerar inte just nu. `
                + (tel ? `Behöver du hjälp kan du ringa personalen på ${tel}.` : 'Behöver du hjälp kan du fråga personalen.');
        },
    };

    window.AIBI = P;
})();
