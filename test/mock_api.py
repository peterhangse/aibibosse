"""Låtsas-API för att testa gränssnittet utan riktig backend. Serverar ui/ som Firebase gör.
Används av test/kor.sh. Argument: ROOT PORT LÄGE LOGGFIL.
Lägen: static (alla /api ger 404), full (namn Aibi, obemannat nu, väntetid 4 s),
bemannat (personal på plats hela dygnet), nere (alla /api ger 503)."""
import json, os, sys, time
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

ROOT, PORT, MODE, LOGG = sys.argv[1], int(sys.argv[2]), sys.argv[3], sys.argv[4]

CONFIG = {
    "personality": {"nickname": "Aibi", "role": "Bibliotekets digitala värd"},
    "ui": {"greeting": "Hej! Jag är Aibi. Vad undrar du?", "idle_seconds": 4,
           "quick_questions": ["När öppnar ni på lördag?", "Hur skaffar jag lånekort?"]},
    "kontakt": {"telefon": "0416-123 45"},
    "bemanning": [{"dagar": [1, 2, 3, 4, 5, 6, 7], "fran": "13:00", "till": "14:00"}],
}
if MODE == "bemannat":
    CONFIG["bemanning"] = [{"dagar": [1, 2, 3, 4, 5, 6, 7], "fran": "00:00", "till": "23:59"}]

SVAR = "På lördag har biblioteket öppet 10–14. Det här är ett testsvar från låtsas-API:t."
KALLOR = [{"id": "1", "titel": "Öppettider Sjöbo bibliotek", "url": "https://www.sjobo.se/bibliotek"},
          {"id": "2", "titel": "Intern rutin utan länk"}]


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=ROOT, **k)

    def log_message(self, *a):
        pass

    def _json(self, obj, code=200):
        b = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def _body(self):
        n = int(self.headers.get("Content-Length") or 0)
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return {}

    def _api(self, post):
        p = self.path.split("?")[0]
        body = self._body() if post else {}
        with open(LOGG, "a") as f:
            f.write(json.dumps({"path": p, "body": body}) + "\n")
        if MODE == "static":
            return self._json({"detail": "Not Found"}, 404)
        if MODE == "nere":
            return self._json({"detail": "nere"}, 503)
        if p == "/api/config":
            return self._json(CONFIG)
        if p == "/api/health":
            return self._json({"mode": "ollama", "model": "test"})
        if p == "/api/human":
            return self._json({"ok": True, "message": "En bibliotekarie kommer till dig."})
        if p == "/api/chat":
            self.send_response(200)
            self.send_header("Content-Type", "text/event-stream")
            self.end_headers()
            for w in SVAR.split(" "):
                self.wfile.write(f"data: {json.dumps({'chunk': w + ' '})}\n\n".encode())
                self.wfile.flush()
                time.sleep(0.01)
            self.wfile.write(f"data: {json.dumps({'kallor': KALLOR, 'session_id': 'sess-1'})}\n\n".encode())
            self.wfile.write(b"data: [DONE]\n\n")
            return
        if p == "/api/v1/chat":
            fraga = body.get("fraga", "")
            if "cannabis" in fraga:
                return self._json({"fraga": fraga, "typ": "nekad", "svar": "Det kan jag inte svara på. Fråga personalen.",
                                   "kort": [], "kallor": [], "nekad": True})
            return self._json({
                "fraga": fraga, "typ": "oppettid", "svar": SVAR, "nekad": False,
                "tolkad_fraga": "När öppnar ni på lördag?",
                "kallor": KALLOR,
                "kort": [
                    {"typ": "oppettid", "titel": "Sjöbo bibliotek", "dag": "lördag", "oppnar": "10:00", "stanger": "14:00"},
                    {"typ": "bok", "titel": "Bröderna Lejonhjärta", "forfattare": "Astrid Lindgren", "ar": 1973,
                     "hylla": "Hc", "tillganglig": None, "beskrivning": "Om Skorpan och Jonatan."},
                    {"typ": "bibliotek", "titel": "Sjöbo bibliotek", "adress": "Exempelgatan 1, Sjöbo",
                     "telefon": "0416-123 45", "hemsida": "https://www.sjobo.se/bibliotek"},
                ]})
        return self._json({"detail": "Not Found"}, 404)

    def do_GET(self):
        if self.path.startswith("/api/"):
            return self._api(False)
        path = self.path.split("?")[0]
        if path == "/" or not os.path.exists(os.path.join(ROOT, path.lstrip("/"))):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        return self._api(True)


ThreadingHTTPServer(("127.0.0.1", PORT), H).serve_forever()
