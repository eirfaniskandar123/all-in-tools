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

Edits apply to every placement at once. The screen has three columns: **Tools**, the **big preview** with **Checks** below it, and the **Live preview**.

### Tools

| Section | Controls |
| --- | --- |
| **Framing** | **Fit** (whole image inside the icon) or **Fill** (covers the icon, edges may be cropped). **Zoom** 50–200% |
| **Spacing & shape** | **Padding** (0–30%) and **Corner radius** (0–50%). Each slider shows its value |
| **Background** | Transparent, White, Navy, Blue, Amber or any custom colour. The selected one is named below the swatches |
| **Tint** | **Monochrome** recolours the artwork with one colour |

**Colour per placement** (under Tint) lists every selected placement and the colour it will get:

- **Your tint**: Toolbar and all full-colour placements follow the colour you pick. Toolbar defaults to dark when Monochrome is off.
- **🔒 Locked**: **Tab bar** is always a black template, because iOS recolours tab icons itself. **Notification** is always white, because that's Android's rule.
- **Full colour**: Monochrome is off, so the original image is used.

Other platform rules: app icons are always opaque (white if you pick no background), and Avatar is always a circle.

### Big preview

- The **placement chips** above the canvas pick which selected placement to preview. The canvas shows its mask and the dashed **safe zone**.
- **Drag the image** to move it. **Re-centre** resets position and zoom.
- The strip below shows that placement's **sizes, safe zone, mask and colour**.

### Checks

Every check is shown with a clear status. The header summarises it, e.g. "1 warning · 2 notes · 4 passed".

| Check | Warns when | One-click fix |
| --- | --- | --- |
| Resolution | The image is smaller than the largest size needed | — |
| Background | A solid background was found and removed for monochrome icons (note), or couldn't be removed (warning) | — |
| **Safe zone** | Artwork goes past the dashed safe-zone line of any selected placement (shown as chips) | **Fit inside safe zone** |
| Detail at 24 px | Lines are too thin to read when small | **Zoom in to 120%** |
| Contrast | Transparent artwork is hard to see on dark or light backgrounds | **Use white / navy background** |
| App icon background | App icons need an opaque background; white is used | **Use blue background** |
| Locked colours | Your tint doesn't apply to Tab bar or Notification | — |

Warnings come first (amber), then notes (blue). Passed checks are grouped in a green row you can expand.

### Live preview

Shows **only the placements you selected**, each in a realistic mock-up:

- **Tab bar:** iOS light and dark tab bars, with the active icon tinted iOS blue.
- **App icon · iOS:** a home screen with the squircle mask.
- **App icon · Android:** a launcher with the circle mask.
- **Favicon:** a browser tab and bookmark bar.
- **Toolbar:** toolbar buttons.
- **Notification:** an Android status bar and a notification.
- **Avatar:** a comment row.
- **Custom size:** every custom size.

Click a mock-up to show that placement in the big preview.

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
