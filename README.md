# Abhishek Hanasoge — personal site

Single-page portfolio built with [Vite](https://vite.dev). Live at https://abhishek-hanasoge.github.io.

```
index.html                    page markup
src/main.js                   test-grid background, typewriter, visual regression game, ⌘K command palette
src/styles.css                styles
public/                       copied as-is to the site root (favicon, 404 page)
public/assets/*.pdf           resume (Resume button)
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

## Security
- **Content Security Policy:** added to production builds by `vite.config.js` (and by hand in `public/404.html`). Everything must load from this site: no external scripts, fonts or images, and no inline `<script>`. Add new sources there if you ever need them.
- **Fonts** are self-hosted via `@fontsource`, so visitors' browsers make no requests to third parties.
- **CI:** actions are pinned to commit SHAs, deploy permissions are scoped to the deploy job, and `npm ci --ignore-scripts` blocks install scripts. Dependabot opens weekly update PRs.
