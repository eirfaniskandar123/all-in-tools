# Pre-release security, privacy and legal review

**Date:** 27 November 2026 · **Version:** 0.1.0 · **Scope:** the whole repository and the Vercel deployment configuration.

## Summary

| Area | Result |
| --- | --- |
| Dependency vulnerabilities | ✅ `npm audit`: 0 vulnerabilities (after the fix below) |
| Secrets in repository | ✅ None. No env vars, API keys or tokens are needed or committed (`.env*` is git-ignored) |
| Server attack surface | ✅ None. The site is fully static, with no API routes, server actions or database |
| File upload handling | ✅ Processed client-side only. Type and size limits apply. SVG is sandboxed in `<img>` |
| XSS | ✅ No `dangerouslySetInnerHTML`, `innerHTML` or `eval`. User strings are rendered as text by React |
| HTTP security headers | ✅ CSP, XFO, nosniff, Referrer-Policy, Permissions-Policy, COOP, HSTS; X-Powered-By removed |
| Privacy | ✅ No uploads, cookies, analytics or third-party requests. Privacy Policy published at `/privacy` |
| Terms | ✅ Terms of Use at `/terms`: user content responsibility, acceptable use, no warranty, liability limit, trademarks |
| Licensing | ✅ MIT `LICENSE`. All dependencies are MIT/ISC compatible (JSZip used under MIT). `THIRD_PARTY_NOTICES.md` |
| Trademarks | ✅ Apple/Google marks used descriptively only, with a non-affiliation disclaimer. Sample logo is original |

## Findings and fixes

### 1. PostCSS advisories (high, build-time): **fixed**

`next@15.5.29` bundled `postcss@8.4.31`, which has GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp and GHSA-r28c-9q8g-f849. The risk applies only to processing attacker-controlled CSS at build time, which this project never does. It was still fixed by adding `"overrides": { "postcss": "^8.5.33" }`; there are no breaking changes and the build was verified.

### 2. Missing security headers: **fixed**

Added in `next.config.ts`:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:; font-src 'self'; connect-src 'self' data: blob:; worker-src 'self' blob:;
  object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

`'unsafe-inline'` for scripts is required by Next.js's inline bootstrap on a statically rendered page. Because the app has no user-controlled HTML sinks, the residual risk is low. Moving to nonce-based CSP would require dynamic rendering (see Recommendations).

### 3. SVG uploads: **reviewed, safe**

- SVG text is parsed with `DOMParser` only to read and set `width`/`height`. The parsed document is never attached to the page.
- The SVG is then displayed and rasterised only through `<img src="data:image/svg+xml,…">`. Browsers run SVG images in a restricted mode: no scripts, no external requests.
- Exported `.svg` files embed the user's own image as a data URI inside `<image>`, which is also loaded in image mode.

### 4. Resource exhaustion: **acceptable**

- Files over 15 MB are rejected.
- Very large images are downscaled in cached halving steps.
- Export generation can be cancelled and yields to the UI thread.
- Any heavy processing only uses the visitor's own device.

### 5. Local storage: **acceptable**

Recent files (max 5, each under 1.5 MB) are stored in `localStorage` on the user's own device, with failures ignored. This is disclosed in the Privacy Policy.

## Deployment configuration (Vercel)

- Static output, so no functions are deployed and no environment variables are needed.
- Production is served over HTTPS, with HSTS sent by the app.
- Preview deployments keep the team's default Deployment Protection.

## Recommendations (not blocking)

1. Have the Terms of Use and Privacy Policy reviewed by someone qualified before wider public launch. They are general templates and do not name a governing law or a legal entity.
2. Enable GitHub Dependabot alerts and secret scanning on the repository.
3. When moving to the library or monorepo phase, consider nonce-based CSP and Subresource Integrity.
4. Add a contact email or a GitHub Security Advisory link once the team has one.
