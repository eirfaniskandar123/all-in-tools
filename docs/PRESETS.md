# Placement presets

The presets are defined in `src/lib/presets.ts`. Paths are relative to the ZIP root; the extension depends on the chosen format.

| Preset | Platform | Sizes (px) | Safe zone | Rules | Formats | Output |
| --- | --- | --- | --- | --- | --- | --- |
| **Tab bar** | iOS | 25, 50, 75 (@1x @2x @3x) | 8% | Monochrome template (black), transparent | PNG, SVG | `ios/TabIcon.imageset/tab-icon@{1,2,3}x` |
| **App icon · iOS** | iOS | 1024, 180, 167, 152, 120, 87, 80, 76, 58, 40 | 10% | Opaque (white default); iOS applies the squircle mask | PNG | `ios/AppIcon.appiconset/icon-{px}` |
| **App icon · Android** | Android | 48, 72, 96, 144, 192 (mdpi → xxxhdpi), 512 | 19% (66 of 108 dp) | Opaque; device applies circle/squircle mask | PNG, WebP | `android/res/mipmap-{density}/ic_launcher`, `android/play-store-icon` |
| **Favicon** | Web | 16, 32, 180, 192, 512 + ICO (16/32/48) | 4% | None | PNG, WebP, AVIF, SVG, ICO | `web/favicon-16`, `web/favicon-32`, `web/apple-touch-icon`, `web/icon-192`, `web/icon-512`, `web/favicon.ico`, `web/favicon.svg` |
| **Toolbar** | Web | 16, 20, 24, 32, 48 | 8% | Monochrome (#111827), transparent | PNG, WebP, AVIF, SVG | `web/toolbar/toolbar-{px}` |
| **Notification** | Android | 24, 36, 48, 72, 96 (mdpi → xxxhdpi) | 8% | White only, transparent | PNG, WebP | `android/res/drawable-{density}/ic_stat_notify` |
| **Avatar** | Other | 128, 256, 512 | 6% | Clipped to a circle | PNG, WebP, AVIF | `other/avatar-{px}` |
| **Custom size** *(Image All-in)* | Other | any W × H | 5% | None | PNG, WebP, AVIF, SVG | `custom/icon-{w}x{h}` (or `icon-{px}` when square) |

## Format rules

- A placement only gets the selected formats it supports. If none of its raster formats is selected, it falls back to its first supported raster format, so every size always has a file.
- **SVG** produces one file per placement at its largest size. If the upload was an SVG, the output stays vector.
- **ICO** is only made for Favicon. It packs PNG-compressed 16, 32 and 48 px images.

## Adding a preset

Add an entry to `PRESETS` in `src/lib/presets.ts`:

```ts
{
  id: "watch",
  name: "App icon · watchOS",
  summary: "circle · 38–108 mm",
  description: "...",
  platform: "ios",
  previewMask: "circle",
  safeZone: 0.1,
  opaque: true,
  formats: ["png"],
  sizes: [80, 88, 100, 172, 196, 216, 1024].map((px) => ({ w: px, h: px, path: `ios/WatchIcon.appiconset/icon-${px}` })),
  details: [["Sizes", "80–216 px + 1024"], ["Mask", "Circle"], ["Formats", "PNG"]],
}
```

The new card appears automatically in the Placement step. Export, previews and checks pick it up without other changes.
