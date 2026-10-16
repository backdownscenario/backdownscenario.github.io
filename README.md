# backdownscenario.github.io
Homepage for Back Down Scenario hosted with github pages.
Check out https://backdownscenario.de for more information and social media links.

## Structure
Plain static HTML/CSS/JS, no build step and no third-party requests on page load.

- `index.html`, `datenschutz.html`, `404.html`
- `css/main.css`, `js/main.js` (header, hero video, click-to-load Spotify players, release stage)
- `fonts/` – Poppins, self-hosted (SIL OFL, see `fonts/OFL.txt`)
- `img/covers/` – release covers (WebP, 640 px), `img/icons.svg` – brand icon sprite (Simple Icons, CC0)
- `media/` – hero loop (`hero.webm` AV1, `hero.mp4` H.264 fallback) and its poster frame

## Hero loop
Built with EffectCraft from `assets-src/hero.jsx` (12 s seamless loop, 360 frames, 1920×1080).
EffectCraft's own AV1 export dropped frames (352/360, visible jump at the loop point), so the comp is
rendered as a PNG sequence and encoded with ffmpeg:

```
effectcraft-cli script assets-src/hero.jsx --empty
effectcraft-cli render --project <ecproj> --comp Hero --format png --start 0 --end 12 --out "seq/f_[####].png"
ffmpeg -framerate 30 -i seq/f_%04d.png -c:v libsvtav1 -preset 4 -crf 24 -pix_fmt yuv420p10le -g 360 -an media/hero.webm
ffmpeg -framerate 30 -i seq/f_%04d.png -c:v libx264 -preset slow -crf 23 -tune film -pix_fmt yuv420p -movflags +faststart -an media/hero.mp4
```

The poster (`media/hero-poster.webp`) is frame 0, so the first video frame matches it exactly.

Local preview: `python -m http.server 8080` in the repository root.
