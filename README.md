# Nasara Studios website

Plain HTML/CSS/JS, no build step. Serve this folder and open it:

```bash
python3 -m http.server 8000 --directory "/Users/mosesjeremiah/nasarastudio website /site"
```

Then visit http://localhost:8000

## Where things live

- `config.js` — all content: products, prices (`null` hides the price), hero slideshows, the 34 portfolio works (titles are working names taken from file names — rename freely), social links, form endpoints.
- `app.js` — routes, page templates, preloader, bag, forms.
- `styles.css` — design tokens (ivory `#F7F2E9`, plum `#282235`, lilac `#A69BE8`), layout, motion.
- `media/` — web-optimised copies of the files in `../for website/` (illustrations toned to the paper frame colour, `tones.js` frame colours, films re-encoded to ≤1280px H.264 without audio, posters).

## Contact, prices & services

Fill in `contact` (Instagram, store, email, WhatsApp), `price` on each product, `sampleUrl`, `policies` and `endpoints` in `config.js`. Anything left empty is simply hidden. Until server endpoints exist, forms open the visitor's email (or WhatsApp) with their message addressed to the studio.

## Useful switches

- `?preloader=1` — replay the full intro (repeat visits in the same tab get a shorter version).
- `?capture=1` — animations off, for screenshots.

