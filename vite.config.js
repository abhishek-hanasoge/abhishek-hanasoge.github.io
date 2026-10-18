import { defineConfig } from 'vite';

// Content Security Policy, injected into production builds only (the dev server
// needs inline scripts and websockets for live reload). GitHub Pages can't send
// custom headers, so it ships as a <meta> tag; frame-ancestors isn't supported there.
// public/404.html isn't processed by Vite and carries its own copy.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'", // a few style="" attributes in the markup
  "img-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
  'upgrade-insecure-requests',
].join('; ');

export default defineConfig({
  // never inline assets as data: URIs, so font-src/img-src can stay 'self'
  build: { assetsInlineLimit: 0 },
  plugins: [
    {
      name: 'inject-csp',
      apply: 'build',
      transformIndexHtml: () => [
        { tag: 'meta', attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP }, injectTo: 'head-prepend' },
        { tag: 'meta', attrs: { name: 'referrer', content: 'strict-origin-when-cross-origin' }, injectTo: 'head-prepend' },
      ],
    },
  ],
});
