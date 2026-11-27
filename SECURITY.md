# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems. Report them privately to the All-in Tools maintainers using GitHub's "Report a vulnerability" (private security advisory) on this repository. Include steps to reproduce. We aim to reply within 5 working days.

## Security model

- **No server-side processing.** Images are decoded, rendered and encoded in the browser (Canvas API). There is no upload endpoint, API route, database or secret in this project.
- **Untrusted files** are only loaded through `<img>` elements. SVGs loaded this way cannot run scripts or fetch external resources. Uploaded content is never inserted into the page as HTML.
- **Strict HTTP headers** (`next.config.ts`):
  - Content-Security-Policy: same-origin only, no third-party scripts or connections, `object-src 'none'`, `frame-ancestors 'none'`
  - X-Frame-Options DENY, X-Content-Type-Options nosniff
  - Referrer-Policy, Permissions-Policy (camera, microphone, geolocation and others disabled)
  - Cross-Origin-Opener-Policy, HSTS
  - The `X-Powered-By` header is removed
- **Local storage** holds only the user's own recent images, on their own device.
- **Dependencies** are checked with `npm audit` (0 known vulnerabilities at release). PostCSS is pinned to a patched version via `overrides` in `package.json`.

See [docs/SECURITY_REVIEW.md](docs/SECURITY_REVIEW.md) for the full pre-release review.
