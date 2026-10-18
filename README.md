# Abhishek Hanasoge — personal site

Static single-page site built from `htmlmock.html`. No build step.

```
index.html            page markup
assets/css/styles.css styles
assets/js/main.js     test-grid background, typewriter, Bug Hunt game, ⌘K command palette
assets/favicon.svg
assets/resume.pdf     ← add this
404.html
```

## Before going live
- Add your résumé at `assets/resume.pdf`.

## Run locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploy
Any static host works: GitHub Pages, Netlify, Cloudflare Pages or Vercel. Upload the folder as-is.
