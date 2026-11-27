# User guide

Icon Refactor walks you through four steps. The step indicator at the top shows where you are, and you can click any step you have already reached to go back to it. **Help** (top right) opens a short summary.

## 1 · Upload

- **Drag and drop** an image onto the drop zone, click **Browse files**, or click **Try a sample logo**.
- Supported formats: PNG, JPG, SVG, WebP (max 15 MB).
- The **Your image** card shows a preview, the file name, the pixel size (or "Vector" for SVG) and the file size.
- Validation messages:
  - Green: the image is fine (512 px or larger, or an SVG).
  - Red warning: smaller than 512 px. You can continue, but large icons will look soft.
  - Blocked: smaller than 64 px. Next is disabled.
  - Not square: a reminder that you can position the image in the Edit step.
- **Recent files** stores your last 5 uploads (under 1.5 MB each) in this browser only.

> Tip: SVG gives the best result because every size is rendered from the vector, and SVG output stays vector.

## 2 · Placement

Click a card to select or deselect it. Several can be selected. Every card shows the key facts at a glance: platform badge (iOS, Android, Web, Any), number of files, **sizes**, **safe zone** (with a small dashed-square icon), **mask**, **colour rule** (with a colour dot) and **formats**.

The card you clicked last is described in more depth in the **preset details** panel:

- a large preview with the mask shape and the dashed safe zone
- **Sizes**: every size as a chip with what it's for (e.g. `50 px @2x`, `180 px iPhone`, `512 px Play Store`)
- **Safe zone**: the margin the artwork should stay inside (dashed orange square in the preview)
- **Mask**: how the platform will crop it (square, squircle or circle)
- **Colour / background** rules, e.g. monochrome template or must be opaque
- **Formats** that placement supports
- **Saved in ZIP at**: the folder the files go to

**Images with a solid background:** monochrome placements (Tab bar, Toolbar, Notification) are made from the shape of your artwork. If your image has no transparency, for example a logo on a solid green square, Icon Refactor detects the background colour from the image edges, removes it, and crops to the artwork for those placements. A blue notice shows the detected colour. Full-colour placements (app icons, favicon, avatar) keep the original image.

**Custom size** (*from Image All-in*): type a width and height and click **Add**. Sizes appear as chips; click ✕ to remove one. The same list appears as **Extra sizes** in the Export step.

The footer shows how many files will be generated.

## 3 · Edit

Edits apply to every placement at once.

| Control | Effect |
| --- | --- |
| **Crop: Fit / Fill** | Fit shows the whole image; Fill covers the whole icon (edges may be cropped) |
| **Zoom** | 50–200% |
| **Drag the image** | Move it inside the icon. **Re-centre** resets position and zoom |
| **Padding** | Space around the artwork (0–30%) |
| **Corner radius** | Rounds the icon's corners (0–50%) |
| **Background** | Transparent, white, navy, blue, amber or any custom colour |
| **Tint → Monochrome** | Recolours the artwork with one colour |

Some rules are always enforced by the platform:

- **Tab bar, Toolbar, Notification** are always monochrome and transparent.
- **iOS and Android app icons** are always opaque. White is used if you choose no background.
- **Avatar** is always clipped to a circle.

**Preview as** switches the big canvas between your selected placements, showing that placement's mask and safe zone.

**Live preview** shows the icon in an iOS tab bar (active state), on a phone home screen and in a browser tab.

**Checks** warn you about:

- the image being upscaled beyond its real resolution
- no transparent background (monochrome presets would become a solid block)
- lines too thin to read at 24 px
- low contrast on dark or light backgrounds
- app icons needing an opaque background

**Undo / Redo / Reset** are in the footer.

## 4 · Export

**Output table:** every file with its folder, pixel size, format and file size. File sizes over the target are shown in red.

**Formats** (*from Image All-in*): PNG, WebP, SVG, ICO, AVIF. Each placement only uses the formats its platform supports:

- iOS app icons are always PNG.
- ICO is made only for Favicon and holds 16, 32 and 48 px.
- SVG gives one scalable file per placement.
- AVIF is enabled only if your browser can encode it. Most browsers cannot yet, so it is usually greyed out; a WebAssembly encoder is on the roadmap.

**Compression** (*from Image All-in*):

- **Quality** applies to WebP and AVIF.
- **Target max size**: WebP and AVIF automatically lower their quality until each file fits. PNG is lossless, so PNGs over the target are flagged instead.

**Extra sizes** (*from Image All-in*): add any W × H. They go into `custom/`.

**File naming:** the default `{name}` keeps each platform's standard names (`ic_launcher.png`, `tab-icon@2x.png`, …). Available tokens: `{name}` `{placement}` `{size}` `{w}` `{h}` `{scale}` `{format}`. Example: `{placement}-{size}@{scale}`.

**Size report:** the total size of all outputs, how much smaller WebP is than PNG, and (for raster uploads) before → after.

**Code snippets:**

- **HTML**: favicon `<link>` tags. `site.webmanifest` is included in the ZIP.
- **Android XML**: the `AndroidManifest.xml` icon attributes and the notification `setSmallIcon` call.
- **iOS Contents.json**: the asset catalog for `AppIcon.appiconset` (or `TabIcon.imageset`).

**Download ZIP** (top right, and at the bottom of the options panel):

```
web/        favicon-*.png, favicon.ico, apple-touch-icon.png, icon-192/512, toolbar/, head-snippet.html, site.webmanifest
ios/        AppIcon.appiconset/ (+ Contents.json), TabIcon.imageset/ (+ Contents.json)
android/    res/mipmap-*/ic_launcher.*, res/drawable-*/ic_stat_notify.*, play-store-icon, AndroidManifest-snippet.xml
other/      avatar-*.png
custom/     icon-WxH.*
README.txt
```

## Using the output

- **Web:** copy `web/` into your site's public root and paste `head-snippet.html` into `<head>`.
- **iOS:** drag `AppIcon.appiconset` and `TabIcon.imageset` into `Assets.xcassets` in Xcode.
- **Android:** copy `android/res/` into `app/src/main/res/` and apply the manifest snippet.

## Privacy

All processing uses the browser's Canvas API. No image ever leaves your computer.
