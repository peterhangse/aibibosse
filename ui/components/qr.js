/* Visar en stor QR-kod så att besökaren kan ta med en länk i mobilen.
   På en kiosk går det inte att klicka sig vidare till en webbsida, och att
   kopiera text hjälper ingen. Kräver vendor/qrcode.js. */
(function () {
    'use strict';

    let oppen = null;
    let timer = null;

    function stang() {
        if (timer) { clearTimeout(timer); timer = null; }
        if (oppen) { oppen.remove(); oppen = null; }
    }

    function visa(url, titel, sprak = 'sv') {
        stang();
        if (!url || typeof qrcode !== 'function') return;

        const qr = qrcode(0, 'M');
        qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
        qr.addData(url);
        qr.make();

        const sv = sprak !== 'en';
        const ov = document.createElement('div');
        ov.className = 'qr-overlay';
        ov.setAttribute('role', 'dialog');
        ov.setAttribute('aria-modal', 'true');
        ov.setAttribute('aria-label', (sv ? 'QR-kod för ' : 'QR code for ') + (titel || url));

        const ruta = document.createElement('div');
        ruta.className = 'qr-ruta';

        const rubrik = document.createElement('p');
        rubrik.className = 'qr-rubrik';
        rubrik.textContent = titel || url;

        const bild = document.createElement('div');
        bild.className = 'qr-bild';
        bild.innerHTML = qr.createSvgTag({ cellSize: 8, margin: 4, scalable: true });

        const instr = document.createElement('p');
        instr.className = 'qr-instr';
        instr.textContent = sv
            ? 'Rikta mobilens kamera mot koden för att öppna sidan.'
            : 'Point your phone camera at the code to open the page.';

        const adress = document.createElement('p');
        adress.className = 'qr-adress';
        adress.textContent = url.replace(/^https?:\/\//, '');

        const knapp = document.createElement('button');
        knapp.type = 'button';
        knapp.className = 'qr-stang';
        knapp.textContent = sv ? 'Stäng' : 'Close';
        knapp.addEventListener('click', stang);

        ruta.append(rubrik, bild, instr, adress, knapp);
        ov.appendChild(ruta);
        ov.addEventListener('click', (e) => { if (e.target === ov) stang(); });
        document.body.appendChild(ov);
        oppen = ov;
        knapp.focus({ preventScroll: true });
        timer = setTimeout(stang, 60000);
    }

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') stang(); });

    /* Webbadressen för en källa, oavsett vad backend kallar fältet. */
    function lank(kalla) {
        const u = kalla && (kalla.url || kalla.lank || kalla.href || kalla.hemsida);
        return typeof u === 'string' && /^https?:\/\//.test(u) ? u : '';
    }

    window.AIBI_QR = { visa, stang, lank };
})();
