# Demo script (about 5 minutes)

**Setup before the demo:**

```bash
npm install
```

```bash
npm run build
```

```bash
npm start
```

Open http://localhost:3000 in Chrome or Edge. Zoom the browser to 90% if the screen is small.

---

## 0. The problem (30 s)

> "Every app needs the same logo in dozens of sizes: iOS tab bars at @1x/2x/3x, App Store icons, Android densities, favicons, notification icons. Each has its own sizes, safe zones and colour rules. Designers export them one by one, and developers hand-write the manifest code. Icon Refactor does it in four steps, and it includes the convert, compress and custom-size features from our Image All-in idea."

## 1. Upload (30 s)

- Click **Try a sample logo**.
- Point out the validation: "Vector image, every size will be sharp."
- Optional: drop a small PNG (under 512 px) to show the **too small** warning with a tip.
- Optional: drop a logo on a **solid-colour square** (no transparency). In Placement, the Tab bar, Toolbar and Notification cards still show a clean mark: the background is detected and removed automatically.

## 2. Placement (1 min)

- Cards preview the real icon. Note that **Tab bar** and **Toolbar** are already monochrome and **Notification** is white: the presets know the platform rules.
- Select **App icon · iOS**, **App icon · Android** and **Notification**.
- Click **App icon · Android** and show the details panel: 66 dp safe zone, circle mask preview with the dashed safe zone.
- Click **Custom size**, then **Add** (72 × 72). Point to the amber **from Image All-in** tag.
- Footer: "*N placements selected · M files will be generated*".

## 3. Edit (1 min 30 s)

- **Drag** the image, change **Zoom** and **Padding**, then pick the **blue background**.
- Watch the **Live preview**: active tab bar icon, phone home screen with the iOS squircle, browser tab favicon.
- Switch **Preview as** to *App icon · Android* to show the circle mask and safe zone.
- Toggle **Monochrome** and pick a colour. Under **Colour per placement**, Toolbar follows it, while Tab bar (iOS) and Notification (Android) stay locked to their platform colours. Then **Undo**.
- Set **Padding** to 0%. **Checks** shows "Artwork outside the safe zone" with the affected placements. Click **Fit inside safe zone** to fix it in one click.
- The **Live preview** only shows the placements you picked. Click one to load it in the big preview.

## 4. Export (1 min 30 s)

- The table lists every file with its folder and real encoded size.
- **Formats**: tick **SVG**; the table updates with one scalable file per placement. (AVIF is greyed out because browsers cannot encode it natively yet; this is on the roadmap.)
- **Compression**: turn on **Target max size 50 KB**. WebP files automatically lower their quality to fit, and oversized PNGs turn red. The size report shows how much smaller WebP is than PNG.
- **Extra sizes**: add 128 × 128.
- **Code snippets**: switch between **HTML**, **Android XML** and **iOS Contents.json**, then click **Copy**.
- Click **Download ZIP** and open it to show `web/`, `ios/AppIcon.appiconset/Contents.json` and `android/res/mipmap-*`.

## Closing (30 s)

> "It's 100% in the browser, so no images are uploaded. The processing core in `src/lib` has no UI dependency, so next we can publish it as an npm library, a React component and a CLI."

## Backup answers

- **Is it accurate for Xcode?** Yes. `Contents.json` lists each file with its idiom, size and scale. Drag the folder into `Assets.xcassets`.
- **Why are some PNGs red?** PNG is lossless, so it can't be squeezed to an arbitrary size. Use WebP or AVIF, or reduce the size.
- **Why is AVIF greyed out?** Browsers can decode AVIF but most can't encode it from a canvas yet. The planned fix is a WebAssembly encoder. The option switches on automatically in any browser that supports it.
