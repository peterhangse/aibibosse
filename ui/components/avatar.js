class AvatarComponent {
    constructor(containerId, config, sceneId) {
        this.container = document.getElementById(containerId);
        this.config = config || {};
        this.sceneId = sceneId || 'bosseScene';
        this.render();
    }

    render() {
        const wrap = document.createElement('div');
        wrap.className = 'bosse-scene-wrap';

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', '0 0 300 340');
        svg.setAttribute('class', 'bosse-scene bosse-greet greeting');
        svg.setAttribute('id', this.sceneId);

        // Bakgrund: vägg
        const wall = document.createElementNS(svgNS, 'rect');
        wall.setAttribute('x', '0'); wall.setAttribute('y', '0');
        wall.setAttribute('width', '300'); wall.setAttribute('height', '340');
        wall.setAttribute('fill', '#f7f2eb');
        svg.appendChild(wall);

        // Bokhylla bakom
        const shelf = document.createElementNS(svgNS, 'g');
        for (let row = 0; row < 3; row++) {
            const y = 20 + row * 55;
            // Hyllplan
            const pl = document.createElementNS(svgNS, 'rect');
            pl.setAttribute('x', '20'); pl.setAttribute('y', y + 40);
            pl.setAttribute('width', '260'); pl.setAttribute('height', '6');
            pl.setAttribute('fill', '#c4a882'); pl.setAttribute('rx', '2');
            shelf.appendChild(pl);
            // Böcker
            const colors = ['#8b5e3c', '#6b8e6b', '#c45c5c', '#d4a843', '#5c7a9c', '#a67c52'];
            let bx = 28;
            for (let b = 0; b < 12; b++) {
                const bw = 14 + (b % 3) * 4;
                const bh = 30 + (b % 4) * 8;
                const book = document.createElementNS(svgNS, 'rect');
                book.setAttribute('x', bx); book.setAttribute('y', y + 40 - bh);
                book.setAttribute('width', bw); book.setAttribute('height', bh);
                book.setAttribute('fill', colors[b % colors.length]);
                book.setAttribute('rx', '1');
                shelf.appendChild(book);
                bx += bw + 2;
                if (bx > 260) break;
            }
        }
        svg.appendChild(shelf);

        // Figuren (andning + hälsning)
        const figure = document.createElementNS(svgNS, 'g');
        figure.setAttribute('class', 'bosse-breathe');

        // Kropp
        const body = document.createElementNS(svgNS, 'path');
        body.setAttribute('d', 'M110,240 Q110,180 150,180 Q190,180 190,240 L190,260 L110,260 Z');
        body.setAttribute('fill', '#4a6741');
        figure.appendChild(body);

        // Skjorta/krage
        const shirt = document.createElementNS(svgNS, 'path');
        shirt.setAttribute('d', 'M125,190 L150,210 L175,190 L175,240 L125,240 Z');
        shirt.setAttribute('fill', '#e8e0d4');
        figure.appendChild(shirt);

        // Slips
        const tie = document.createElementNS(svgNS, 'path');
        tie.setAttribute('d', 'M150,195 L145,230 L150,240 L155,230 Z');
        tie.setAttribute('fill', '#8b5e3c');
        figure.appendChild(tie);

        // Huvud
        const head = document.createElementNS(svgNS, 'ellipse');
        head.setAttribute('cx', '150'); head.setAttribute('cy', '155');
        head.setAttribute('rx', '32'); head.setAttribute('ry', '38');
        head.setAttribute('fill', '#f5d0b0');
        figure.appendChild(head);

        // Hår
        const hair = document.createElementNS(svgNS, 'path');
        hair.setAttribute('d', 'M118,145 Q120,110 150,110 Q180,110 182,145 Q180,125 150,125 Q120,125 118,145');
        hair.setAttribute('fill', '#6b5344');
        figure.appendChild(hair);

        // Glasögon
        const glasses = document.createElementNS(svgNS, 'g');
        glasses.setAttribute('stroke', '#4a4a4a');
        glasses.setAttribute('stroke-width', '2');
        glasses.setAttribute('fill', 'none');
        const g1 = document.createElementNS(svgNS, 'circle');
        g1.setAttribute('cx', '138'); g1.setAttribute('cy', '152'); g1.setAttribute('r', '8');
        const g2 = document.createElementNS(svgNS, 'circle');
        g2.setAttribute('cx', '162'); g2.setAttribute('cy', '152'); g2.setAttribute('r', '8');
        const gBridge = document.createElementNS(svgNS, 'line');
        gBridge.setAttribute('x1', '146'); gBridge.setAttribute('y1', '152');
        gBridge.setAttribute('x2', '154'); gBridge.setAttribute('y2', '152');
        glasses.appendChild(g1); glasses.appendChild(g2); glasses.appendChild(gBridge);
        figure.appendChild(glasses);

        // Ögonbryn (tänkande blick lyfter dem)
        const brows = document.createElementNS(svgNS, 'g');
        brows.setAttribute('class', 'bosse-eyebrows');
        const bRow = (x1, y1, x2, y2, x3, y3) => {
            const p = document.createElementNS(svgNS, 'path');
            p.setAttribute('d', `M${x1},${y1} Q${x2},${y2} ${x3},${y3}`);
            p.setAttribute('stroke', '#6b5344');
            p.setAttribute('stroke-width', '2.6');
            p.setAttribute('stroke-linecap', 'round');
            p.setAttribute('fill', 'none');
            return p;
        };
        brows.appendChild(bRow(128, 141, 138, 135, 147, 139));
        brows.appendChild(bRow(153, 139, 162, 135, 172, 141));
        figure.appendChild(brows);

        // Ögon (grupp för blinkning)
        const eyes = document.createElementNS(svgNS, 'g');
        eyes.setAttribute('class', 'bosse-eyes');
        const eyeL = document.createElementNS(svgNS, 'circle');
        eyeL.setAttribute('cx', '138'); eyeL.setAttribute('cy', '152'); eyeL.setAttribute('r', '3');
        eyeL.setAttribute('fill', '#3a3a3a');
        const eyeR = document.createElementNS(svgNS, 'circle');
        eyeR.setAttribute('cx', '162'); eyeR.setAttribute('cy', '152'); eyeR.setAttribute('r', '3');
        eyeR.setAttribute('fill', '#3a3a3a');
        eyes.appendChild(eyeL); eyes.appendChild(eyeR);
        figure.appendChild(eyes);

        // Näsa
        const nose = document.createElementNS(svgNS, 'path');
        nose.setAttribute('d', 'M150,158 Q154,168 150,172 Q146,168 150,158');
        nose.setAttribute('fill', '#e0b898');
        figure.appendChild(nose);

        // Mun - leende
        const mouthSmile = document.createElementNS(svgNS, 'path');
        mouthSmile.setAttribute('d', 'M138,178 Q150,188 162,178');
        mouthSmile.setAttribute('stroke', '#8b5e3c');
        mouthSmile.setAttribute('stroke-width', '2.5');
        mouthSmile.setAttribute('fill', 'none');
        mouthSmile.setAttribute('stroke-linecap', 'round');
        mouthSmile.setAttribute('class', 'bosse-mouth-smile');
        figure.appendChild(mouthSmile);

        // Mun - öppen (prat)
        const mouthOpen = document.createElementNS(svgNS, 'ellipse');
        mouthOpen.setAttribute('cx', '150'); mouthOpen.setAttribute('cy', '180');
        mouthOpen.setAttribute('rx', '10'); mouthOpen.setAttribute('ry', '7');
        mouthOpen.setAttribute('fill', '#6b3a3a');
        mouthOpen.setAttribute('class', 'bosse-mouth-open');
        figure.appendChild(mouthOpen);

        // Skägg
        const beard = document.createElementNS(svgNS, 'path');
        beard.setAttribute('d', 'M125,170 Q130,205 150,210 Q170,205 175,170 Q175,185 150,195 Q125,185 125,170');
        beard.setAttribute('fill', '#6b5344');
        beard.setAttribute('opacity', '0.85');
        figure.appendChild(beard);

        // Händer på disken
        const handL = document.createElementNS(svgNS, 'ellipse');
        handL.setAttribute('cx', '105'); handL.setAttribute('cy', '245');
        handL.setAttribute('rx', '10'); handL.setAttribute('ry', '8');
        handL.setAttribute('fill', '#f5d0b0');
        figure.appendChild(handL);
        const handR = document.createElementNS(svgNS, 'ellipse');
        handR.setAttribute('cx', '195'); handR.setAttribute('cy', '245');
        handR.setAttribute('rx', '10'); handR.setAttribute('ry', '8');
        handR.setAttribute('fill', '#f5d0b0');
        figure.appendChild(handR);

        svg.appendChild(figure);

        // Lånedisk i förgrunden
        const desk = document.createElementNS(svgNS, 'rect');
        desk.setAttribute('x', '0'); desk.setAttribute('y', '250');
        desk.setAttribute('width', '300'); desk.setAttribute('height', '90');
        desk.setAttribute('fill', '#a67c52');
        desk.setAttribute('rx', '4');
        svg.appendChild(desk);

        // Diskkant
        const deskTop = document.createElementNS(svgNS, 'rect');
        deskTop.setAttribute('x', '0'); deskTop.setAttribute('y', '250');
        deskTop.setAttribute('width', '300'); deskTop.setAttribute('height', '12');
        deskTop.setAttribute('fill', '#8b6b4a');
        svg.appendChild(deskTop);

        // Dator på disken
        const monitor = document.createElementNS(svgNS, 'rect');
        monitor.setAttribute('x', '210'); monitor.setAttribute('y', '215');
        monitor.setAttribute('width', '50'); monitor.setAttribute('height', '35');
        monitor.setAttribute('fill', '#3a3a3a');
        monitor.setAttribute('rx', '3');
        svg.appendChild(monitor);
        const screen = document.createElementNS(svgNS, 'rect');
        screen.setAttribute('x', '213'); screen.setAttribute('y', '218');
        screen.setAttribute('width', '44'); screen.setAttribute('height', '29');
        screen.setAttribute('fill', '#6b9ebf');
        screen.setAttribute('rx', '1');
        svg.appendChild(screen);

        // En bok på disken
        const deskBook = document.createElementNS(svgNS, 'rect');
        deskBook.setAttribute('x', '40'); deskBook.setAttribute('y', '240');
        deskBook.setAttribute('width', '30'); deskBook.setAttribute('height', '10');
        deskBook.setAttribute('fill', '#c45c5c');
        deskBook.setAttribute('rx', '1');
        svg.appendChild(deskBook);

        wrap.appendChild(svg);
        this.container.appendChild(wrap);

        // Text under
        const info = document.createElement('div');
        info.style.textAlign = 'center';
        info.innerHTML = `
            <p class="bosse-name">${this.config.avatar?.name || 'Bosse'}</p>
            <p class="bosse-title">${this.config.personality?.role || 'Bibliotekets digitala värd'}</p>
            <p class="bosse-workplace">Sjöbo bibliotek</p>
        `;
        this.container.appendChild(info);
    }

    setTalking(talking) {
        const scene = document.getElementById(this.sceneId);
        if (scene) {
            if (talking) scene.classList.add('talking');
            else scene.classList.remove('talking');
        }
    }

    /* Lyssna-läge (mikrofon): samma munrörelse som när han pratar. */
    setListening(listening) { this.setTalking(listening); }

    /* Tänkande: lyfter ögonbryn, blicken söker uppåt, kroppen håller andan. */
    setThinking(thinking) {
        const scene = document.getElementById(this.sceneId);
        if (scene) {
            if (thinking) scene.classList.add('thinking');
            else scene.classList.remove('thinking');
        }
    }

    /* Återgå till neutral. */
    setReady() {
        const scene = document.getElementById(this.sceneId);
        if (scene) scene.classList.remove('talking', 'thinking');
    }

    /* En nick: återstartar hälsnings-animationen (kräver reflow-trick). */
    nod() {
        const scene = document.getElementById(this.sceneId);
        if (!scene) return;
        scene.classList.remove('greeting');
        void scene.getBoundingClientRect();
        scene.classList.add('greeting');
    }
}

