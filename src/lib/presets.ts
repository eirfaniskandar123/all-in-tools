import type { Preset, Size } from "./types";

const DENSITIES: [string, number][] = [
  ["mdpi", 1],
  ["hdpi", 1.5],
  ["xhdpi", 2],
  ["xxhdpi", 3],
  ["xxxhdpi", 4],
];

export const PRESETS: Preset[] = [
  {
    id: "tab-bar",
    name: "Tab bar",
    summary: "25–75 px · @1x @2x @3x",
    description:
      "Bottom navigation icon for iOS apps. Exported as a monochrome template so iOS can tint it for the selected and unselected states.",
    platform: "ios",
    previewMask: "none",
    safeZone: 0.08,
    forceTint: "#000000",
    transparent: true,
    formats: ["png", "svg"],
    sizes: [1, 2, 3].map((s) => ({
      w: 25 * s,
      h: 25 * s,
      scale: s,
      path: `ios/TabIcon.imageset/tab-icon@${s}x`,
    })),
    svgPath: "ios/TabIcon.imageset/tab-icon",
    details: [
      ["Sizes", "25, 50, 75 px (@1x @2x @3x)"],
      ["Safe zone", "2 px padding"],
      ["Mask", "None (transparent)"],
      ["Colour", "Monochrome template"],
      ["Formats", "PNG + SVG"],
    ],
  },
  {
    id: "ios-app",
    name: "App icon · iOS",
    summary: "1024 px · rounded mask",
    description:
      "Home-screen and App Store icon. iOS applies the rounded mask itself, so the file stays square and fully opaque.",
    platform: "ios",
    previewMask: "squircle",
    safeZone: 0.1,
    opaque: true,
    formats: ["png"],
    sizes: (
      [
        [1024, "App Store"],
        [180, "iPhone"],
        [167, "iPad Pro"],
        [152, "iPad"],
        [120, "iPhone"],
        [87, "Settings"],
        [80, "Spotlight"],
        [76, "iPad"],
        [58, "Settings"],
        [40, "Notification"],
      ] as [number, string][]
    ).map(([px, label]) => ({ w: px, h: px, label, path: `ios/AppIcon.appiconset/icon-${px}` })),
    details: [
      ["Sizes", "1024 px + 9 device sizes (40–180 px)"],
      ["Safe zone", "~10% margin"],
      ["Mask", "Squircle (applied by iOS)"],
      ["Background", "Must be opaque"],
      ["Formats", "PNG"],
    ],
  },
  {
    id: "android-app",
    name: "App icon · Android",
    summary: "adaptive · 108 dp · safe zone",
    description:
      "Launcher icon for every screen density plus the 512 px Play Store icon. Keep the artwork inside the 66 dp safe zone so device masks never cut it.",
    platform: "android",
    previewMask: "circle",
    safeZone: 0.19,
    opaque: true,
    formats: ["png", "webp"],
    sizes: [
      ...DENSITIES.map(([d, m]) => ({
        w: 48 * m,
        h: 48 * m,
        label: d,
        path: `android/res/mipmap-${d}/ic_launcher`,
      })),
      { w: 512, h: 512, label: "Play Store", path: "android/play-store-icon" },
    ],
    details: [
      ["Sizes", "48–192 px (mdpi → xxxhdpi) + 512 px"],
      ["Safe zone", "66 of 108 dp (19% margin)"],
      ["Mask", "Circle or squircle (device)"],
      ["Background", "Opaque"],
      ["Formats", "PNG or WebP"],
    ],
  },
  {
    id: "favicon",
    name: "Favicon",
    summary: "16 · 32 · 48 · ICO",
    description:
      "Browser tab, bookmarks and home-screen shortcuts. Also generates the HTML tags and a site.webmanifest.",
    platform: "web",
    previewMask: "none",
    safeZone: 0.04,
    formats: ["png", "webp", "avif", "svg", "ico"],
    sizes: [
      { w: 16, h: 16, label: "Browser tab", path: "web/favicon-16" },
      { w: 32, h: 32, label: "Browser tab", path: "web/favicon-32" },
      { w: 180, h: 180, label: "Apple touch", path: "web/apple-touch-icon" },
      { w: 192, h: 192, label: "PWA", path: "web/icon-192" },
      { w: 512, h: 512, label: "PWA splash", path: "web/icon-512" },
    ],
    svgPath: "web/favicon",
    ico: { path: "web/favicon", sizes: [16, 32, 48] },
    details: [
      ["Sizes", "16, 32, 180, 192, 512 px"],
      ["ICO", "16 / 32 / 48 in one file"],
      ["Mask", "None"],
      ["Extras", "HTML tags + site.webmanifest"],
      ["Formats", "PNG, ICO, SVG, WebP, AVIF"],
    ],
  },
  {
    id: "toolbar",
    name: "Toolbar",
    summary: "16–48 px · monochrome",
    description:
      "Small action icons for web toolbars and buttons. Rendered as a single dark colour so they sit well next to text.",
    platform: "web",
    previewMask: "none",
    safeZone: 0.08,
    forceTint: "#111827",
    transparent: true,
    formats: ["png", "webp", "avif", "svg"],
    sizes: [16, 20, 24, 32, 48].map((px) => ({
      w: px,
      h: px,
      path: `web/toolbar/toolbar-${px}`,
    })),
    svgPath: "web/toolbar/toolbar",
    details: [
      ["Sizes", "16, 20, 24, 32, 48 px"],
      ["Safe zone", "8% padding"],
      ["Mask", "None (transparent)"],
      ["Colour", "Monochrome #111827"],
      ["Formats", "PNG, SVG, WebP, AVIF"],
    ],
  },
  {
    id: "notification",
    name: "Notification",
    summary: "24 dp · white only",
    description:
      "Android status-bar icon. Android only uses the alpha channel, so it is exported in white on transparent.",
    platform: "android",
    previewMask: "none",
    safeZone: 0.08,
    forceTint: "#FFFFFF",
    transparent: true,
    formats: ["png", "webp"],
    sizes: DENSITIES.map(([d, m]) => ({
      w: 24 * m,
      h: 24 * m,
      label: d,
      path: `android/res/drawable-${d}/ic_stat_notify`,
    })),
    details: [
      ["Sizes", "24–96 px (mdpi → xxxhdpi)"],
      ["Safe zone", "2 dp padding"],
      ["Mask", "None (transparent)"],
      ["Colour", "White only"],
      ["Formats", "PNG or WebP"],
    ],
  },
  {
    id: "avatar",
    name: "Avatar",
    summary: "circle · 128–512 px",
    description: "Profile and team avatars, clipped to a circle with transparent corners.",
    platform: "other",
    previewMask: "circle",
    safeZone: 0.06,
    clipCircle: true,
    formats: ["png", "webp", "avif"],
    sizes: [128, 256, 512].map((px) => ({ w: px, h: px, path: `other/avatar-${px}` })),
    details: [
      ["Sizes", "128, 256, 512 px"],
      ["Safe zone", "6% margin"],
      ["Mask", "Circle"],
      ["Background", "Optional"],
      ["Formats", "PNG, WebP, AVIF"],
    ],
  },
];

export const CUSTOM_ID = "custom";

export function sizeLabel(s: Size): string {
  return s.w === s.h ? `${s.w}` : `${s.w}x${s.h}`;
}

export function customPreset(sizes: Size[]): Preset {
  return {
    id: CUSTOM_ID,
    name: "Custom size",
    summary: "any W × H, e.g. 72 × 72",
    description: "Any extra sizes you need. Non-square sizes keep the artwork centred.",
    platform: "other",
    previewMask: "none",
    safeZone: 0.05,
    formats: ["png", "webp", "avif", "svg"],
    sizes: sizes.map((s) => ({ ...s, path: `custom/icon-${sizeLabel(s)}` })),
    svgPath: "custom/icon",
    imageAllIn: true,
    details: [
      ["Sizes", sizes.length ? sizes.map((s) => `${s.w}×${s.h}`).join(", ") : "None yet"],
      ["Safe zone", "5% margin"],
      ["Mask", "None"],
      ["Formats", "PNG, SVG, WebP, AVIF"],
    ],
  };
}

export function resolvePresets(ids: string[], customSizes: Size[]): Preset[] {
  const list: Preset[] = PRESETS.filter((p) => ids.includes(p.id));
  if (ids.includes(CUSTOM_ID) && customSizes.length) list.push(customPreset(customSizes));
  return list;
}

export function findPreset(id: string, customSizes: Size[]): Preset | undefined {
  return id === CUSTOM_ID ? customPreset(customSizes) : PRESETS.find((p) => p.id === id);
}

export const PLATFORM_LABEL: Record<Preset["platform"], string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  other: "Any",
};

export interface PresetSpecs {
  /** Short size summary for cards, e.g. "25 · 50 · 75 px". */
  sizesShort: string;
  /** Every size with its label, e.g. "50 px · @2x". */
  sizes: { px: string; note?: string }[];
  safeZonePct: number;
  mask: string;
  colour: { label: string; swatch?: string };
  formats: string[];
  folders: string[];
}

/** Structured, human-readable facts about a preset for the Placement step. */
export function presetSpecs(p: Preset): PresetSpecs {
  const px = (s: Size) => (s.w === s.h ? `${s.w}` : `${s.w}×${s.h}`);
  const uniq = [...new Set(p.sizes.map(px))];
  const nums = p.sizes.filter((s) => s.w === s.h).map((s) => s.w).sort((a, b) => a - b);
  let sizesShort: string;
  if (!p.sizes.length) sizesShort = "Add your own";
  else if (uniq.length <= 4) sizesShort = `${uniq.join(" · ")} px`;
  else if (nums.length === p.sizes.length && nums[nums.length - 1] >= 512 && nums[nums.length - 2] < 512)
    sizesShort = `${nums[0]}–${nums[nums.length - 2]} + ${nums[nums.length - 1]} px`;
  else sizesShort = `${nums[0] ?? uniq[0]}–${nums[nums.length - 1] ?? uniq[uniq.length - 1]} px`;
  if (p.ico) sizesShort += " + ICO";

  const sizes = p.sizes.map((s) => ({
    px: `${px(s)} px`,
    note: s.scale ? `@${s.scale}x` : s.label,
  }));

  const mask = p.clipCircle
    ? "Circle (cut out)"
    : p.previewMask === "squircle"
      ? "Squircle, applied by iOS"
      : p.previewMask === "circle"
        ? "Circle, applied by device"
        : "None (square)";

  const colour = p.forceTint
    ? { label: `Monochrome ${p.forceTint === "#FFFFFF" ? "white" : p.forceTint === "#000000" ? "black" : "dark"}`, swatch: p.forceTint }
    : p.opaque
      ? { label: "Full colour, opaque" }
      : { label: "Full colour" };

  return {
    sizesShort,
    sizes,
    safeZonePct: Math.round(p.safeZone * 100),
    mask,
    colour,
    formats: p.formats.map((f) => f.toUpperCase()),
    folders: [...new Set(p.sizes.map((s) => s.path.split("/").slice(0, -1).join("/") + "/"))],
  };
}
