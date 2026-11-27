# Architecture

## Overview

Icon Refactor is a single-page Next.js app. All image work happens **in the browser** with the Canvas 2D API, so:

- there is no backend, upload or storage (privacy by default)
- it deploys as a static page
- the processing code in `src/lib` has no React or Next.js dependency, so it can be extracted into an npm library later

```
┌──────────────────────────── src/app/page.tsx (state) ─────────────────────────────┐
│ source · selected presets · custom sizes · edit settings (undo/redo) · export opts│
└───────┬───────────────────┬───────────────────┬─────────────────────┬─────────────┘
        │                   │                   │                     │
   UploadStep         PlacementStep         EditStep              ExportStep
        │                   │                   │                     │
        ▼                   ▼                   ▼                     ▼
  render.loadSource   presets.resolve    render.drawIcon        export.planFiles
                      IconImage          render.analyze         export.generateFiles
                                                                 export.buildSnippets
                                                                 export.buildZip
```

## Processing pipeline

### 1. Load (`render.loadSource`)

- **Raster** files are read as a data URL and decoded into an `HTMLImageElement`.
- **SVG** files are parsed. If the SVG has a `viewBox` but no `width`/`height`, a 1024 px intrinsic size is added so it rasterises crisply. The SVG is then stored as a data URL.

### 2. Placement rules (`render.effectiveSettings`)

The user's edit settings are adjusted per preset:

| Preset flag | Effect |
| --- | --- |
| `forceTint` | Monochrome colour. Used as-is when `tintLocked`; otherwise it's the default and the user's tint wins (`s.tint ?? forceTint`) |
| `tintLocked` | Platform-mandated colour: Tab bar black (iOS template), Notification white (Android) |
| `transparent` | Background is removed |
| `opaque` | White background if the user chose none (app icons) |
| `clipCircle` | Output clipped to a circle (Avatar) |

### 3. Layout (`render.layout`)

The same function serves both the canvas output and the SVG output, so they always match:

```
pad   = padding × min(w, h)
area  = (w − 2·pad) × (h − 2·pad)
base  = fit ? min(areaW/imgW, areaH/imgH) : max(...)
scale = base × zoom
pos   = centred + offset × size        (offset is set by dragging)
```

### 4. Draw (`render.drawIcon`)

1. Clip to a rounded rect (corner radius) or a circle.
2. Fill the background, if there is one.
3. Draw the image on a separate layer.
   - Raster sources are first **downscaled in halving steps**, cached per image. This keeps 16–48 px icons sharp instead of aliased.
4. If a tint is set, apply it to that layer with `source-in` compositing, so only the artwork is recoloured.
5. Composite the layer over the background.

Every preview in the UI uses `drawIcon`, through `<IconImage>`. **What you see is exactly what is exported.**

### 4b. Solid-background artwork (`render.extractArtwork`)

Monochrome presets tint the image's alpha shape. An opaque image (e.g. a logo on a green square) would become a solid block, so when a tint applies:

1. Sample a 2 px border. If more than 30% of it is transparent, the image already has transparency and is used as is.
2. Otherwise, the most common (quantised) border colour is the background.
3. Alpha = smooth ramp of the RGB distance to that colour (28 → 70), multiplied by the original alpha.
4. Crop to the artwork's bounding box (plus 2%) so the glyph fills the icon like a real template icon.

The result is cached per image and used by `drawIcon` and `buildSvg` whenever a tint is set.

### 5. Checks (`render.analyze`)

`analyze()` returns one `Warning` per check, **including passes**:

```ts
{ id, level: "ok" | "info" | "warn" | "error", title, text, presets?: string[], action?: { label, patch: Partial<EditSettings> } }
```

`ChecksPanel` shows warnings, then notes, then a collapsible group of passes. `action.patch` is applied with the normal edit handler, so fixes can be undone.

| Check | How |
| --- | --- |
| Resolution | Largest required size > smallest source dimension (raster only) |
| Background | `extractArtwork` found a background colour: note. Warns if the artwork covers under 0.5% or over 90% of the image |
| Safe zone | For each preset (skipping opaque images on full-colour presets), render 128 px with no background and find the alpha bounding box (alpha > 64). Warn if it crosses the `safeZone × 128` inset (1 px tolerance). The fix sets padding to the largest affected safe zone, with zoom 1 and offset 0 |
| Thin lines | At 24 px, more than 60% of visible pixels are only partly opaque. The fix zooms to 120% |
| Low contrast | Transparent, untinted artwork: WCAG contrast of its average colour against #111827 and white is below 1.8 |
| Opaque required | An app icon is selected and no background is set |
| Tint locked | The user set a tint while Tab bar or Notification is selected |

### 6. Encode (`encode.ts`)

| Format | Method |
| --- | --- |
| PNG | `canvas.toBlob("image/png")`. Lossless; flagged if over the target size |
| WebP / AVIF | `canvas.toBlob(type, quality)`. With a target KB, quality steps down by 0.1 until the file fits (minimum 0.1) |
| AVIF support | Detected once by encoding a 2×2 canvas and checking the returned MIME type |
| ICO | Built by hand: a 6-byte header, 16-byte directory entries, then PNG payloads (Vista+ ICO format) |
| SVG | `render.buildSvg`: `<clipPath>`, an optional background `<rect>`, the source as `<image>`, and the tint via `feFlood` + `feComposite in=SourceAlpha` |

### 7. Export (`export.ts`)

- **`planFiles`** turns the selected presets and export settings into a list of files: formats are intersected with what each preset supports, the naming pattern is applied, and paths are de-duplicated. The Placement step uses it to show the file count without rendering anything.
- **`generateFiles`** renders and encodes each file. It yields to the event loop every 4 files so the UI stays responsive, and it can be cancelled when settings change. The Export step debounces regeneration by 200 ms.
- **`buildSnippets`** builds the HTML `<link>` tags plus `site.webmanifest`, the AndroidManifest attributes plus the notification call, and the iOS `Contents.json` (with a size → idiom/scale map for AppIcon and a template-rendering TabIcon). They are always built from the files actually generated, so names match even with a custom naming pattern.
- **`buildZip`** uses JSZip (DEFLATE). It creates one folder per platform and adds the snippet files and a README.

## State (`src/app/page.tsx`)

| State | Notes |
| --- | --- |
| `step` | 0–3. Steps can only be reached once their prerequisites exist (a source, at least one preset) |
| `source` | The loaded image |
| `selected`, `focused` | Selected preset ids; the card shown in the details panel |
| `customSizes` | Shared by the Custom size preset (Placement) and Extra sizes (Export) |
| `hist` | Edit settings history for undo/redo. Changes within 600 ms are merged into one entry (slider drags) |
| `exp` | Formats, quality, target KB, naming pattern |

## From web app to library

The web app comes first; the library comes later.

```
src/lib/*            →  packages/core      (@all-in-tools/icon-refactor-core)
src/components/*     →  packages/react     (<IconEditor/>)
                        packages/cli       (Node: swap Canvas for sharp, same presets/plan/snippets)
src/app              →  apps/web           (this app, consuming the packages)
```

What has to change for Node: `render.ts` and `encode.ts` use DOM canvas, so the CLI needs a `sharp` (or `@napi-rs/canvas`) backend behind the same `drawIcon` / `encodeRaster` interface. `presets.ts` and the planning and snippet parts of `export.ts` are already environment-agnostic.

## Browser support

This app needs a recent Chrome, Edge, Firefox or Safari (Canvas `roundRect`, `toBlob` WebP). AVIF export is only offered where the browser can encode it through canvas, which most browsers cannot do yet. The roadmap is a WebAssembly encoder (e.g. `@jsquash/avif`).
