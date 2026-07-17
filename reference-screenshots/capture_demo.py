from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

from playwright.sync_api import Page, TimeoutError as PlaywrightTimeoutError, sync_playwright


BASE_URL = "https://only-demo.lovable.app"
OUTPUT_DIR = Path(__file__).resolve().parent
VIEWPORT = {"width": 1440, "height": 900}

PRIMARY_PAGES = [
    ("/", "01-home"),
    ("/inventory", "02-inventory"),
    ("/financing", "03-financing"),
    ("/contact", "04-contact"),
]


def safe_slug(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug[:80] or "page"


def wait_for_page(page: Page) -> None:
    try:
        page.wait_for_load_state("networkidle", timeout=20_000)
    except PlaywrightTimeoutError:
        page.wait_for_load_state("domcontentloaded", timeout=10_000)

    page.evaluate("document.fonts ? document.fonts.ready : Promise.resolve()")

    # Trigger lazy-loaded images before taking a full-page screenshot.
    page.evaluate(
        """
        async () => {
          const step = Math.max(500, Math.floor(window.innerHeight * 0.8));
          for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
            window.scrollTo(0, y);
            await new Promise(resolve => setTimeout(resolve, 80));
          }
          window.scrollTo(0, 0);
          await new Promise(resolve => setTimeout(resolve, 250));
        }
        """
    )


def page_metadata(page: Page, url: str, png_path: Path, html_path: Path) -> dict:
    return page.evaluate(
        """
        ({sourceUrl, pngFile, htmlFile}) => {
          const absolute = value => {
            try { return new URL(value, document.baseURI).href; }
            catch { return value; }
          };
          const links = [...document.querySelectorAll('a[href]')]
            .map(a => absolute(a.getAttribute('href')))
            .filter(Boolean);
          const images = [...document.querySelectorAll('img')]
            .map(img => ({
              alt: img.alt || '',
              src: absolute(img.currentSrc || img.getAttribute('src') || ''),
              srcset: img.getAttribute('srcset') || ''
            }))
            .filter(item => item.src);
          const stylesheets = [...document.querySelectorAll('link[rel="stylesheet"][href]')]
            .map(link => absolute(link.getAttribute('href')));
          return {
            source_url: sourceUrl,
            final_url: location.href,
            title: document.title,
            screenshot: pngFile,
            html: htmlFile,
            document_size: {
              width: document.documentElement.scrollWidth,
              height: document.documentElement.scrollHeight
            },
            internal_links: [...new Set(links.filter(link => {
              try { return new URL(link).origin === location.origin; }
              catch { return false; }
            }))].sort(),
            images,
            stylesheets
          };
        }
        """,
        {
            "sourceUrl": url,
            "pngFile": png_path.relative_to(OUTPUT_DIR).as_posix(),
            "htmlFile": html_path.relative_to(OUTPUT_DIR).as_posix(),
        },
    )


def save_current_state(page: Page, url: str, stem: str, directory: Path = OUTPUT_DIR) -> dict:
    directory.mkdir(parents=True, exist_ok=True)
    png_path = directory / f"{stem}.png"
    html_path = directory / f"{stem}.html"

    page.screenshot(path=str(png_path), full_page=True, animations="disabled")
    html_path.write_text(page.content(), encoding="utf-8")
    return page_metadata(page, url, png_path, html_path)


def capture_route(page: Page, route: str, stem: str) -> dict:
    url = urljoin(BASE_URL, route)
    page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    wait_for_page(page)
    return save_current_state(page, url, stem)


def capture_showroom_reel(page: Page) -> dict | None:
    url = urljoin(BASE_URL, "/")
    page.goto(url, wait_until="domcontentloaded", timeout=30_000)
    wait_for_page(page)

    button = page.get_by_role("button", name="Showroom Reel", exact=True)
    if button.count() != 1:
        return None

    before_url = page.url
    button.click()
    page.wait_for_timeout(500)

    visible_media = page.locator("[role='dialog']:visible, dialog[open]:visible, video:visible")
    if page.url == before_url and visible_media.count() == 0:
        return None

    return save_current_state(page, url, "05-showroom-reel")


def capture_vehicle_details(page: Page) -> list[dict]:
    inventory_url = urljoin(BASE_URL, "/inventory")
    details_dir = OUTPUT_DIR / "vehicle-details"
    results: list[dict] = []

    details_dir.mkdir(parents=True, exist_ok=True)
    for old_capture in details_dir.iterdir():
        if old_capture.is_file() and old_capture.suffix.lower() in {".png", ".html"}:
            old_capture.unlink()

    page.goto(inventory_url, wait_until="domcontentloaded", timeout=30_000)
    wait_for_page(page)
    detail_buttons = page.locator("button").filter(has_text="View Details")
    total = detail_buttons.count()

    for index in range(total):
        page.goto(inventory_url, wait_until="domcontentloaded", timeout=30_000)
        wait_for_page(page)

        buttons = page.locator("button").filter(has_text="View Details")
        if index >= buttons.count():
            break

        button = buttons.nth(index)
        button_text = " ".join(button.inner_text().split())
        card_heading = button.locator("h3")
        card_label = card_heading.inner_text().strip() if card_heading.count() == 1 else ""
        button.click()
        page.wait_for_timeout(500)

        heading = page.locator("[role='dialog'] h1, [role='dialog'] h2, [role='dialog'] h3")
        if heading.count():
            label = heading.first.inner_text().strip()
        else:
            label = card_label or button_text.replace("View Details", "").strip()

        stem = f"{index + 1:02d}-{safe_slug(label)}"
        metadata = save_current_state(page, inventory_url, stem, details_dir)
        metadata["trigger_text"] = button_text
        results.append(metadata)

    return results


def main() -> None:
    for stale_showroom_capture in (
        OUTPUT_DIR / "05-showroom-reel.png",
        OUTPUT_DIR / "05-showroom-reel.html",
    ):
        stale_showroom_capture.unlink(missing_ok=True)

    manifest: dict = {
        "source": BASE_URL,
        "captured_viewport": VIEWPORT,
        "primary_pages": [],
        "interactive_states": [],
        "vehicle_details": [],
    }

    with sync_playwright() as playwright:
        # Use the installed Google Chrome channel so refreshing this archive does
        # not require Playwright to download a separate browser binary.
        browser = playwright.chromium.launch(channel="chrome", headless=True)
        context = browser.new_context(
            viewport=VIEWPORT,
            device_scale_factor=1,
            reduced_motion="reduce",
            color_scheme="light",
        )
        page = context.new_page()
        page.set_default_timeout(15_000)

        for route, stem in PRIMARY_PAGES:
            manifest["primary_pages"].append(capture_route(page, route, stem))

        showroom = capture_showroom_reel(page)
        if showroom:
            manifest["interactive_states"].append(showroom)

        manifest["vehicle_details"] = capture_vehicle_details(page)

        context.close()
        browser.close()

    (OUTPUT_DIR / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    discovered_routes = sorted(
        {
            urlparse(link).path
            for item in manifest["primary_pages"]
            for link in item["internal_links"]
        }
    )
    print(
        json.dumps(
            {
                "primary_pages": len(manifest["primary_pages"]),
                "interactive_states": len(manifest["interactive_states"]),
                "vehicle_details": len(manifest["vehicle_details"]),
                "discovered_routes": discovered_routes,
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
