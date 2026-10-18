# Abhishek Hanasoge — personal site

Single-page portfolio built with [Vite](https://vite.dev). Live at https://abhishek-hanasoge.github.io.

```
index.html                    page markup
src/main.js                   test-grid background, typewriter, Bug Hunt game, ⌘K command palette
src/styles.css                styles
public/                       copied as-is to the site root (favicon, 404 page)
public/assets/resume.pdf      ← add this
.github/workflows/deploy.yml  builds and deploys to GitHub Pages on every push to main
```

## Develop
```
npm install
npm run dev       # http://localhost:5173 with live reload
npm run build     # production build in dist/
npm run preview   # serve dist/ locally
```

## Deploy
Push to `main`. The GitHub Action builds the site and publishes it to GitHub Pages.
One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.
