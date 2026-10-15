"use strict";

const TEXTER = {
  sv: {
    halsning: "Hej! Jag är bibliotekets AI-värd och svarar utifrån bibliotekets egen information. Vad vill du veta?",
    skicka: "Fråga",
    nytt: "Nytt försök",
    fel: "Något gick fel — försök igen.",
    laddar: "…tänker…",
    platshallare: "Skriv din fråga…",
    kalla: "Källa:",
    visaQr: "Visa QR-kod till sidan",
    etiketter: { bok: "Bok", evenemang: "Evenemang", tjanst: "Tjänst", oppettid: "Öppettider", bibliotek: "Bibliotek" },
    tillganglig: "Inne i hyllan",
    utlanad: "Utlånad just nu",
    okandStatus: "Vi kan inte se om den är inne. Fråga personalen.",
    hylla: "hylla",
    stangt: "Stängt",
    kl: "kl",
    tel: "Telefon",
    epost: "E-post",
    oppnaIMobilen: "Öppna i mobilen",
  },
  en: {
    halsning: "Hi! I am the library's AI assistant and I answer using the library's own information. What would you like to know?",
    skicka: "Ask",
    nytt: "Start over",
    fel: "Something went wrong — try again.",
    laddar: "…thinking…",
    platshallare: "Type your question…",
    kalla: "Source:",
    visaQr: "Show QR code for the page",
    etiketter: { bok: "Book", evenemang: "Event", tjanst: "Service", oppettid: "Opening hours", bibliotek: "Library" },
    tillganglig: "Available",
    utlanad: "On loan",
    okandStatus: "We can't see whether it's available. Please ask the staff.",
    hylla: "shelf",
    stangt: "Closed",
    kl: "at",
    tel: "Phone",
    epost: "Email",
    oppnaIMobilen: "Open on your phone",
  },
};

const FORSLAG = [
  "Har ni Bröderna Lejonhjärta?",
  "När är biblioteket öppet på lördag?",
  "Vilka evenemang finns i höst?",
  "Hur får jag lånekort?",
];

let sprak = "sv";

/* Följdfrågor: den tolkade frågan från förra svaret skickas med i nästa
   anrop, så att "Och söndag då?" kan förstås. Sammanhanget lever bara i den
   här variabeln och dör med sidan, vid nekat svar och vid återställning. */
let foregaende = null;

/* Återställning efter inaktivitet (krav F6). Standard två minuter, kan
   ändras med ui.idle_seconds i /api/config. */
let vantetidMs = 120000;
let vilaTimer = null;

function t(key) {
  const del = key.split(".");
  return del.reduce((o, k) => (o ? o[k] : o), TEXTER[sprak]) ?? key;
}

const input = document.getElementById("fragainput");
const form = document.getElementById("fragform");
const meddelanden = document.getElementById("meddelanden");
const kortrad = document.getElementById("kort");
const forslag = document.getElementById("forslag");
const chatt = document.querySelector(".chatt");

function addSida(klass, html) {
  const div = document.createElement("div");
  div.className = klass;
  div.innerHTML = html;
  meddelanden.appendChild(div);
  if (chatt) chatt.scrollTop = chatt.scrollHeight;
  return div;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function qrKnapp(url, titel, klass, text) {
  return `<button type="button" class="${klass}" data-url="${escapeHtml(url)}" data-titel="${escapeHtml(titel)}"
    aria-label="${escapeHtml(titel)}. ${escapeHtml(t("visaQr"))}">${escapeHtml(text)}</button>`;
}

function kallaHtml(kallor) {
  if (!kallor || !kallor.length) return "";
  const list = kallor.map((k) => {
    const url = window.AIBI_QR ? AIBI_QR.lank(k) : "";
    return url
      ? qrKnapp(url, k.titel, "kalla har-lank", k.titel)
      : `<span class="kalla">${escapeHtml(k.titel)}</span>`;
  }).join("");
  return `<div class="kallor">${escapeHtml(t("kalla"))} ${list}</div>`;
}

/* Bokens status: bara true eller false är säkra uppgifter. Allt annat
   betyder att vi inte vet, och då säger kortet det (krav F2). */
function bokStatus(tillganglig) {
  if (tillganglig === true) return `<span class="tillganglig">${escapeHtml(t("tillganglig"))}</span>`;
  if (tillganglig === false) return `<span class="utlanad">${escapeHtml(t("utlanad"))}</span>`;
  return `<span class="okand">${escapeHtml(t("okandStatus"))}</span>`;
}

function rad(delar) {
  const text = delar.filter((d) => d !== null && d !== undefined && String(d).trim() !== "").join(" · ");
  return text ? `<p>${text}</p>` : "";
}

function kortHtml(kort) {
  if (!kort || !kort.length) return "";
  const et = t("etiketter");
  return kort.map((k) => {
    const etikett = `<span class="etiket">${escapeHtml(et[k.typ] || "")}</span>`;
    const titel = `<h3>${escapeHtml(k.titel || "")}</h3>`;

    if (k.typ === "bok") {
      const forf = k.forfattare ? escapeHtml(k.forfattare) + (k.ar ? ` (${escapeHtml(k.ar)})` : "") : "";
      const hylla = k.hylla ? `${escapeHtml(t("hylla"))} ${escapeHtml(k.hylla)}` : "";
      return `<div class="kort">${etikett}${titel}
        ${rad([forf, hylla])}
        ${k.beskrivning ? `<p>${escapeHtml(k.beskrivning)}</p>` : ""}
        <p>${bokStatus(k.tillganglig)}</p>
      </div>`;
    }

    if (k.typ === "evenemang") {
      const nar = [k.datum, k.tid ? `${t("kl")} ${k.tid}` : ""].filter(Boolean).join(" ");
      return `<div class="kort evenemang">${etikett}${titel}
        ${rad([escapeHtml(nar), escapeHtml(k.alder), escapeHtml(k.plats)])}
        ${k.beskrivning ? `<p>${escapeHtml(k.beskrivning)}</p>` : ""}
      </div>`;
    }

    if (k.typ === "oppettid") {
      const tider = k.oppnar && k.stanger ? `${escapeHtml(k.oppnar)}–${escapeHtml(k.stanger)}` : escapeHtml(k.kommentar || t("stangt"));
      return `<div class="kort oppettid">${etikett}${titel}
        <p class="tider">${k.dag ? `<span class="dag">${escapeHtml(k.dag)}</span> ` : ""}${tider}</p>
      </div>`;
    }

    if (k.typ === "bibliotek") {
      const url = window.AIBI_QR ? AIBI_QR.lank(k) : "";
      return `<div class="kort">${etikett}${titel}
        ${k.adress ? `<p>${escapeHtml(k.adress)}</p>` : ""}
        ${k.telefon ? `<p>${escapeHtml(t("tel"))} ${escapeHtml(k.telefon)}</p>` : ""}
        ${k.epost ? `<p>${escapeHtml(t("epost"))} ${escapeHtml(k.epost)}</p>` : ""}
        ${url ? `<p>${qrKnapp(url, k.titel || url, "qr-knapp", t("oppnaIMobilen"))}</p>` : ""}
      </div>`;
    }

    return `<div class="kort">${etikett}${titel}
      ${k.beskrivning || k.svar ? `<p>${escapeHtml(k.beskrivning || k.svar)}</p>` : ""}
      ${k.villkor ? `<p>${escapeHtml(k.villkor)}</p>` : ""}
    </div>`;
  }).join("");
}

function sattText() {
  document.getElementById("skicka").textContent = t("skicka");
  document.getElementById("nytt").textContent = t("nytt");
  input.placeholder = t("platshallare");
  document.documentElement.lang = sprak;
  forslag.innerHTML = FORSLAG.map((f) => `<button type="button">${escapeHtml(f)}</button>`).join("");
  if (window.AIBI_A11Y) AIBI_A11Y.sattSprak(sprak);
}

function visaHalsning() {
  addSida("svar halsning", `<div class="bubbla">${escapeHtml(t("halsning"))}</div>`);
}

async function skicka() {
  const fraga = input.value.trim();
  if (!fraga) return;
  if (vilaTimer) clearTimeout(vilaTimer);

  addSida("talon", `<div class="bubbla">${escapeHtml(fraga)}</div>`);
  kortrad.innerHTML = "";
  input.value = "";
  const laddar = addSida("svar", `<div class="bubbla">${escapeHtml(t("laddar"))}</div>`);

  try {
    const body = { fraga };
    if (foregaende) body.foregaende = foregaende;
    const res = await fetch("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    foregaende = data.nekad ? null : (data.tolkad_fraga || null);
    laddar.outerHTML = `<div class="svar">
      <div class="bubbla">${escapeHtml(data.svar)}</div>
      ${kallaHtml(data.kallor)}
    </div>`;
    kortrad.innerHTML = kortHtml(data.kort);
    if (window.AIBI_A11Y) AIBI_A11Y.las(data.svar);
  } catch (e) {
    foregaende = null;
    laddar.outerHTML = `<div class="svar"><div class="bubbla">${escapeHtml(t("fel"))}</div></div>`;
  }
  if (chatt) chatt.scrollTop = chatt.scrollHeight;
  nollstallVila();
}

/* Tömmer allt en besökare kan ha lämnat efter sig. */
function aterstall({ tillSvenska = false } = {}) {
  meddelanden.innerHTML = "";
  kortrad.innerHTML = "";
  input.value = "";
  foregaende = null;
  if (window.AIBI_QR) AIBI_QR.stang();
  if (tillSvenska && sprak !== "sv") {
    sprak = "sv";
    document.querySelectorAll(".langbtn").forEach((x) => x.classList.toggle("active", x.dataset.lang === "sv"));
    sattText();
  }
  if (tillSvenska && window.AIBI_A11Y) AIBI_A11Y.aterstall();
  visaHalsning();
  if (chatt) chatt.scrollTop = 0;
}

function nollstallVila() {
  if (vilaTimer) clearTimeout(vilaTimer);
  vilaTimer = setTimeout(() => aterstall({ tillSvenska: true }), vantetidMs);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  skicka();
});

forslag.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    input.value = e.target.textContent;
    skicka();
  }
});

document.addEventListener("click", (e) => {
  const knapp = e.target.closest("[data-url]");
  if (knapp && window.AIBI_QR) AIBI_QR.visa(knapp.dataset.url, knapp.dataset.titel, sprak);
});

document.getElementById("nytt").addEventListener("click", () => {
  aterstall();
  if (window.AIBI_A11Y) AIBI_A11Y.fokus(input);
});

document.querySelectorAll(".langbtn").forEach((b) => {
  b.addEventListener("click", () => {
    sprak = b.dataset.lang;
    document.querySelectorAll(".langbtn").forEach((x) => x.classList.toggle("active", x === b));
    sattText();
    // Har samtalet inte börjat byts hälsningen till det nya språket.
    const bara = meddelanden.children.length === 1 && meddelanden.firstElementChild.classList.contains("halsning");
    if (bara || meddelanden.children.length === 0) { meddelanden.innerHTML = ""; visaHalsning(); }
  });
});

for (const typ of ["pointerdown", "keydown", "input"]) {
  document.addEventListener(typ, nollstallVila, { passive: true });
}

if (window.AIBI_A11Y) AIBI_A11Y.skapa(document.getElementById("a11yPlats"), sprak);
sattText();
visaHalsning();
nollstallVila();
if (window.AIBI_A11Y) AIBI_A11Y.fokus(input); else input.focus();

/* Väntetiden kan ställas in i samma inställningar som Bosse använder. */
if (window.AIBI) {
  AIBI.ladda().then(() => { vantetidMs = AIBI.vantetidMs(120); nollstallVila(); });
}
