"use strict";

const TEXTER = {
  sv: {
    hjalp: "Prova: Har ni Bröderna Lejonhjärta? · När är biblioteket öppet? · Vilka evenemang finns i höst? · Hur får jag lånekort?",
    skicka: "Fråga",
    nytt: "Nytt försök",
    fel: "Något gick fel — försök igen.",
    laddar: "…tänker…",
    etiketter: { bok: "Bok", evenemang: "Evenemang", tjanst: "Tjänst", oppettid: "Öppettider" },
    tillganglig: "Inne i hyllan", utlanad: "Utlånad just nu",
  },
  en: {
    hjalp: "Try: Do you have The Lionheart Brothers? · Opening hours? · Upcoming events? · How do I get a library card?",
    skicka: "Ask",
    nytt: "Start over",
    fel: "Something went wrong — try again.",
    laddar: "…thinking…",
    etiketter: { bok: "Book", evenemang: "Event", tjanst: "Service", oppettid: "Opening hours", "vanlig": "" },
    tillganglig: "Available", utlanad: "On loan",
  },
};

const FORSLAG = [
  "Har ni Bröderna Lejonhjärta?",
  "När är biblioteket öppet på lördag?",
  "Vilka evenemang finns i höst?",
  "Hur får jag lånekort?",
];

let sprak = "sv";

function t(key) {
  const del = key.split(".");
  return del.reduce((o, k) => (o ? o[k] : o), TEXTER[sprak]) ?? key;
}

const input = document.getElementById("fragainput");
const form = document.getElementById("fragform");
const meddelanden = document.getElementById("meddelanden");
const kortrad = document.getElementById("kort");
const forslag = document.getElementById("forslag");

function addSida(klass, html) {
  const div = document.createElement("div");
  div.className = klass;
  div.innerHTML = html;
  meddelanden.appendChild(div);
  meddelanden.scrollTop = meddelanden.scrollHeight;
  return div;
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function kallaHtml(kallor) {
  if (!kallor || !kallor.length) return "";
  const list = kallor.map((k) => `<span class="kalla">${escapeHtml(k.titel)}</span>`).join("");
  return `<div class="kallor">Källa: ${list}</div>`;
}

function kortHtml(kort) {
  if (!kort || !kort.length) return "";
  const rems = { etiketter: t("etiketter") };
  return kort.map((k) => {
    if (k.typ === "bok") {
      const status = k.tillganglig
        ? `<span class="tillganglig">${t("tillganglig")}</span>`
        : `<span class="utlanad">${t("utlanad")}</span>`;
      return `<div class="kort">
        <span class="etiket">${escapeHtml(rems.etiketter.bok)}</span>
        <h3>${escapeHtml(k.titel)}</h3>
        <p>${escapeHtml(k.forfattare)}${k.ar ? " (" + k.ar + ")" : ""} · hylla ${escapeHtml(k.hylla || "–")}</p>
        <p>${escapeHtml(k.beskrivning || "")}</p>
        <p>${status}</p>
      </div>`;
    }
    if (k.typ === "evenemang") {
      return `<div class="kort evenemang">
        <span class="etiket">${escapeHtml(rems.etiketter.evenemang)}</span>
        <h3>${escapeHtml(k.titel)}</h3>
        <p>${escapeHtml(k.datum)} kl ${escapeHtml(k.tid)} · ${escapeHtml(k.alder)} · ${escapeHtml(k.plats)}</p>
        <p>${escapeHtml(k.beskrivning || "")}</p>
      </div>`;
    }
    return `<div class="kort">
      <span class="etiket">${escapeHtml(rems.etiketter[k.typ] || "")}</span>
      <h3>${escapeHtml(k.titel || "")}</h3>
      <p>${escapeHtml(k.beskrivning || k.svar || "")}</p>
    </div>`;
  }).join("");
}

function sattText() {
  document.getElementById("skicka").textContent = t("skicka");
  document.getElementById("nytt").textContent = t("nytt");
  input.placeholder = sprak === "sv" ? "Skriv din fråga…" : "Type your question…";
  forslag.innerHTML = FORSLAG.map((f) => `<button type="button">${escapeHtml(f)}</button>`).join("");
}

async function skicka() {
  const fraga = input.value.trim();
  if (!fraga) return;

  addSida("talon", `<div class="bubbla">${escapeHtml(fraga)}</div>`);
  kortrad.innerHTML = "";
  input.value = "";
  const laddar = addSida("svar", `<div class="bubbla">${t("laddar")}</div>`);

  try {
    const res = await fetch("/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fraga }),
    });
    if (!res.ok) throw new Error("api");
    const data = await res.json();
    laddar.outerHTML = `<div class="svar">
      <div class="bubbla">${escapeHtml(data.svar)}</div>
      ${kallaHtml(data.kallor)}
    </div>`;
    kortrad.innerHTML = kortHtml(data.kort);
  } catch (e) {
    laddar.outerHTML = `<div class="svar"><div class="bubbla">${t("fel")}</div></div>`;
  }
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

document.getElementById("nytt").addEventListener("click", () => {
  meddelanden.innerHTML = "";
  kortrad.innerHTML = "";
  input.value = "";
  input.focus();
});

document.querySelectorAll(".langbtn").forEach((b) => {
  b.addEventListener("click", () => {
    sprak = b.dataset.lang;
    document.querySelectorAll(".langbtn").forEach((x) => x.classList.toggle("active", x === b));
    sattText();
  });
});

sattText();
input.focus();