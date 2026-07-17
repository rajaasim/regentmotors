# Regent Motors demo reference archive

Source: https://only-demo.lovable.app/

Captured at a 1440 × 900 desktop viewport on 2026-07-17. The PNG files are full-page screenshots. Each PNG has a matching rendered HTML capture from the same page state.

## Primary pages

- `01-home.png` / `01-home.html`
- `02-inventory.png` / `02-inventory.html`
- `03-financing.png` / `03-financing.html`
- `04-contact.png` / `04-contact.html`

## Vehicle details

The `vehicle-details/` folder contains matching PNG and HTML captures for all nine inventory detail overlays:

1. Maserati Ghibli
2. Range Rover Sport
3. Aston Martin Vantage
4. Ferrari Portofino
5. Ford F-150 Raptor
6. Mercedes-Benz A-Class
7. BMW M5
8. Porsche Cayenne
9. Audi R8

## Supporting files

- `manifest.json` records page titles, final URLs, page dimensions, internal links, image URLs, and stylesheet URLs.
- `capture_demo.py` reproduces the full archive with Python Playwright and the machine's existing Google Chrome installation.

To refresh the archive after a client update:

```powershell
python .\reference-screenshots\capture_demo.py
```

The Lovable editor badge visible in the screenshots belongs to the demo host and should not be treated as part of the Regent Motors design.
