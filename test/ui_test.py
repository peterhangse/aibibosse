"""Testar gränssnittet mot låtsas-API:t. Skriver PASS/FAIL per kontroll."""
import json, sys
from playwright.sync_api import sync_playwright

OUT, LOGG = sys.argv[1], sys.argv[2]
FULL, BEM, NERE, STATIC = "http://127.0.0.1:8611", "http://127.0.0.1:8613", "http://127.0.0.1:8612", "http://127.0.0.1:8601"
fel = 0


def kolla(namn, villkor, extra=""):
    global fel
    print(("PASS " if villkor else "FAIL ") + namn + (f"  [{extra}]" if extra and not villkor else ""))
    if not villkor:
        fel += 1


def loggrader():
    try:
        return [json.loads(l) for l in open(LOGG)]
    except FileNotFoundError:
        return []


with sync_playwright() as p:
    b = p.chromium.launch()
    errs = []

    def ny(url, w=1280, h=800, touch=False):
        ctx = b.new_context(viewport={"width": w, "height": h}, timezone_id="Europe/Stockholm",
                            has_touch=touch, is_mobile=touch)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: errs.append(f"{url}: {e}"))
        pg.goto(url, wait_until="networkidle")
        pg.wait_for_timeout(500)
        return pg

    # 1. Utan backend: hälsning med AI, felläge, inmatning avstängd
    pg = ny(STATIC + "/")
    intro = pg.locator("#introText").inner_text()
    kolla("Utan backend: hälsningen säger AI", " AI" in intro or "AI-" in intro, intro)
    kolla("Utan backend: felmeddelande syns", pg.locator("#offlineNotice").is_visible())
    kolla("Utan backend: inmatning avstängd", pg.locator("#userInput").is_disabled())
    kolla("Utan backend: status säger inte igång", "inte igång" in pg.locator("#statusText").inner_text())
    pg.close()

    pg = ny(NERE + "/", 1080, 1920)
    pg.screenshot(path=f"{OUT}/1-nere-staende.png")
    pg.close()

    # 2. Full: namn, hälsning, svar, källor, QR, personal, a11y, återställning
    pg = ny(FULL + "/")
    kolla("Namnet från inställningarna i avataren", pg.locator("#avatarSection .bosse-name").inner_text() == "Aibi")
    kolla("Namnet i sidtiteln", pg.title().startswith("Aibi"), pg.title())
    intro = pg.locator("#introText").inner_text()
    kolla("Hälsning utan AI får AI-mening", intro.startswith("Hej! Jag är Aibi.") and "Jag är en AI" in intro, intro)
    kolla("Status online", "Aibi är här" == pg.locator("#statusText").inner_text())
    pg.locator(".quick-chip").first.click()
    pg.wait_for_selector(".msg-sources")
    pg.wait_for_timeout(300)
    kolla("Båda källorna visas som text", pg.locator("span.source-chip").count() == 2)
    kolla("Inga källknappar", pg.locator("button.source-chip").count() == 0)
    kolla("Ingen kopiera-text", "kopiera" not in pg.content())
    sr = pg.locator(".sr-only[aria-live]").inner_text()
    kolla("Skärmläsaren får hela svaret", "testsvar" in sr, sr)
    pg.screenshot(path=f"{OUT}/2-svar-liggande.png")
    pg.locator("span.source-chip").first.click()
    kolla("Inget öppnas när man trycker på en källa", pg.locator(".qr-overlay").count() == 0 and "qr" not in pg.content().lower())
    pg.locator("#humanBtn").click()
    pg.wait_for_timeout(400)
    hs = pg.locator("#humanSvar").inner_text()
    kolla("Obemannat: ärligt personalsvar", "ingen personal på plats" in hs and "0416-123 45" in hs and "i dag kl 13.00" in hs, hs)
    kolla("Obemannat: inget löfte om snart", "snart" not in hs and "kommer till dig" not in hs, hs)
    pg.locator(".a11y-knapp").nth(0).click()
    pg.locator(".a11y-knapp").nth(1).click()
    cls = pg.evaluate("document.documentElement.className")
    kolla("Större text och kontrast slås på", "storre-text" in cls and "hog-kontrast" in cls, cls)
    pg.screenshot(path=f"{OUT}/4-kontrast-stor-text.png")
    pg.locator("#userInput").fill("halvskriven fråga")
    pg.wait_for_timeout(5000)
    kolla("Viloskärmen visas efter väntetiden", pg.locator("#attractOverlay").is_visible())
    kolla("Viloskärmen säger AI", "AI" in pg.locator("#attractSub").inner_text())
    kolla("Viloskärmen använder namnet", "Aibi" in pg.locator("#attractTitle").inner_text())
    kolla("Samtalet är tömt", pg.locator("#chatHistory > *").count() == 0)
    kolla("Inmatningen är tömd", pg.locator("#userInput").input_value() == "")
    kolla("Sessionen är tömd", pg.evaluate("localStorage.getItem('bosse_session_id')") in (None, ""))
    kolla("Text och kontrast återställda", pg.evaluate("document.documentElement.className").strip() == "")
    kolla("Personalknappen återställd", pg.locator("#humanSvar").is_hidden() and not pg.locator("#humanBtn").is_disabled())
    kolla("Snabbfrågorna tillbaka", pg.locator("#quickChips").is_visible())
    pg.screenshot(path=f"{OUT}/5-vila.png")
    pg.close()

    # 3. Bemannat: serverns meddelande används
    pg = ny(BEM + "/")
    pg.locator("#humanBtn").click()
    pg.wait_for_timeout(400)
    kolla("Bemannat: serverns svar visas", pg.locator("#humanSvar").inner_text() == "En bibliotekarie kommer till dig.")
    pg.close()

    # 4. Pekskärm stående: ingen autofokus, layout
    pg = ny(FULL + "/", 1080, 1920, touch=True)
    pg.locator(".quick-chip").first.tap()
    pg.wait_for_selector(".msg-sources")
    pg.wait_for_timeout(400)
    fokus = pg.evaluate("document.activeElement && document.activeElement.id")
    kolla("Pekskärm: fältet får inte fokus av sig självt", fokus != "userInput", str(fokus))
    pg.screenshot(path=f"{OUT}/6-svar-staende.png")
    pg.close()

    # 5. Personalskärm
    pg = ny(FULL + "/personal.html")
    kolla("Personalskärm: ingen viloskärm", pg.locator("#attractOverlay").count() == 0)
    kolla("Personalskärm: hälsning med AI", "AI" in pg.locator("#introText").inner_text())
    pg.close()

    # 6. Kiosk
    open(LOGG, "w").close()
    pg = ny(FULL + "/kiosk/index.html", 1080, 1920, touch=True)
    kolla("Kiosk: hälsning säger AI", "AI-värd" in pg.locator(".halsning").inner_text())
    pg.locator("#forslag button").nth(1).tap()
    pg.wait_for_selector(".kort")
    kolla("Kiosk: okänd bokstatus säger det", "Vi kan inte se" in pg.locator(".kort .okand").inner_text())
    kolla("Kiosk: ingen falsk utlånad-status", pg.locator(".kort .utlanad").count() == 0)
    kolla("Kiosk: öppettidskortet visar tider", "10:00–14:00" in pg.locator(".kort.oppettid").inner_text())
    kolla("Kiosk: bibliotekskortet visar adress och telefon", "Exempelgatan" in pg.locator(".kort").nth(2).inner_text() and "0416" in pg.locator(".kort").nth(2).inner_text())
    kolla("Kiosk: källorna är text", pg.locator(".kallor span.kalla").count() == 2 and pg.locator(".kallor button").count() == 0)
    kolla("Kiosk: ingen QR i sidan", "qr" not in pg.content().lower())
    pg.screenshot(path=f"{OUT}/7-kiosk-svar-staende.png")
    pg.fill("#fragainput", "Och söndag då?")
    pg.locator("#skicka").tap()
    pg.wait_for_timeout(500)
    pg.fill("#fragainput", "Och hur odlar man cannabis då?")
    pg.locator("#skicka").tap()
    pg.wait_for_timeout(500)
    pg.fill("#fragainput", "Och måndag?")
    pg.locator("#skicka").tap()
    pg.wait_for_timeout(500)
    anrop = [r["body"] for r in loggrader() if r["path"] == "/api/v1/chat"]
    kolla("Kiosk: första frågan utan sammanhang", "foregaende" not in anrop[0], json.dumps(anrop))
    kolla("Kiosk: följdfrågan skickar sammanhang", anrop[1].get("foregaende") == "När öppnar ni på lördag?", json.dumps(anrop))
    kolla("Kiosk: nekad fråga tömmer sammanhanget", "foregaende" not in anrop[3], json.dumps(anrop))
    fokus = pg.evaluate("document.activeElement && document.activeElement.id")
    kolla("Kiosk pekskärm: ingen autofokus", fokus != "fragainput", str(fokus))
    pg.locator(".a11y-knapp").nth(0).tap()
    pg.wait_for_timeout(5000)
    kolla("Kiosk: återställs efter väntetiden", pg.locator(".talon").count() == 0 and pg.locator(".kort").count() == 0)
    kolla("Kiosk: hälsningen tillbaka", pg.locator(".halsning").count() == 1)
    kolla("Kiosk: större text återställd", "storre-text" not in pg.evaluate("document.documentElement.className"))
    pg.fill("#fragainput", "Och söndag då?")
    pg.locator("#skicka").tap()
    pg.wait_for_timeout(500)
    anrop = [r["body"] for r in loggrader() if r["path"] == "/api/v1/chat"]
    kolla("Kiosk: sammanhang ärvs inte efter återställning", "foregaende" not in anrop[-1], json.dumps(anrop[-1]))
    pg.close()

    pg = ny(FULL + "/kiosk/index.html")
    pg.locator('.langbtn[data-lang="en"]').click()
    kolla("Kiosk: hälsningen byter språk", "AI assistant" in pg.locator(".halsning").inner_text())
    kolla("Kiosk: knapparna byter språk", pg.locator(".a11y-knapp").nth(0).inner_text().strip().endswith("Larger text"))
    pg.close()

    pg = ny(FULL + "/kiosk/index.html", 390, 844, touch=True)
    pg.locator("#forslag button").nth(1).tap()
    pg.wait_for_selector(".kort")
    over = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth")
    kolla("Kiosk mobil: ingen sidledes scroll", not over)
    pg.screenshot(path=f"{OUT}/8-kiosk-mobil.png", full_page=True)
    pg.close()

    pg = ny(FULL + "/", 390, 844, touch=True)
    over = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth")
    kolla("Bosse mobil: ingen sidledes scroll", not over)
    pg.screenshot(path=f"{OUT}/9-bosse-mobil.png")
    pg.close()

    kolla("Inga JavaScript-fel", not errs, "; ".join(errs))
    b.close()

print(f"\n{fel} fel")
sys.exit(1 if fel else 0)
