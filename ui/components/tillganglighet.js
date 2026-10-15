/* Knappar för större text och högre kontrast (krav T2), plus en dold yta
   som skärmläsare läser upp när ett svar är klart.

   Valen sätts som klasser på <html> och nollställs när skärmen återställs,
   så att nästa besökare börjar med standardläget. */
(function () {
    'use strict';

    const VAL = [
        { klass: 'storre-text', sv: 'Större text', en: 'Larger text', ikon: 'Aa' },
        { klass: 'hog-kontrast', sv: 'Kontrast', en: 'Contrast',
          ikon: '<svg viewBox="0 0 16 16" width="15" height="15"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 1.5a6.5 6.5 0 0 1 0 13z" fill="currentColor"/></svg>' },
    ];
    const knappar = [];

    function skapa(behallare, sprak = 'sv') {
        if (!behallare) return;
        const rad = document.createElement('div');
        rad.className = 'a11y-rad';
        for (const v of VAL) {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'a11y-knapp';
            b.dataset.klass = v.klass;
            b.setAttribute('aria-pressed', 'false');
            b.innerHTML = `<span class="a11y-ikon" aria-hidden="true">${v.ikon}</span><span class="a11y-text"></span>`;
            b.addEventListener('click', () => {
                const pa = document.documentElement.classList.toggle(v.klass);
                b.setAttribute('aria-pressed', String(pa));
            });
            knappar.push({ b, v });
            rad.appendChild(b);
        }
        behallare.appendChild(rad);
        sattSprak(sprak);
    }

    function sattSprak(sprak) {
        for (const { b, v } of knappar) {
            b.querySelector('.a11y-text').textContent = sprak === 'en' ? v.en : v.sv;
        }
    }

    function aterstall() {
        for (const { b, v } of knappar) {
            document.documentElement.classList.remove(v.klass);
            b.setAttribute('aria-pressed', 'false');
        }
    }

    /* Läser upp en färdig text för skärmläsare utan att varje strömmat ord
       annonseras för sig. */
    let yta = null;
    function las(text) {
        if (!yta) {
            yta = document.createElement('div');
            yta.className = 'sr-only';
            yta.setAttribute('aria-live', 'polite');
            yta.setAttribute('role', 'status');
            document.body.appendChild(yta);
        }
        yta.textContent = '';
        setTimeout(() => { yta.textContent = text || ''; }, 60);
    }

    /* På pekskärm ska fältet inte få fokus av sig självt, annars fäller
       Windows upp skärmtangentbordet efter varje svar. */
    const PEKSKARM = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    function fokus(el) {
        if (el && !PEKSKARM) el.focus({ preventScroll: true });
    }

    window.AIBI_A11Y = { skapa, sattSprak, aterstall, las, fokus, PEKSKARM };
})();
