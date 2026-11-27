import JSZip from "jszip";
import { buildIco, canvasToBlob, encodeRaster } from "./encode";
import { buildSvg, drawIcon } from "./render";
import type {
  EditSettings,
  ExportSettings,
  Format,
  GeneratedFile,
  PlannedFile,
  Preset,
  RasterFormat,
  Source,
} from "./types";

export const DEFAULT_EXPORT: ExportSettings = {
  formats: { png: true, webp: true, svg: false, ico: true, avif: false },
  quality: 0.85,
  targetKB: null,
  pattern: "{name}",
};

const RASTER: RasterFormat[] = ["png", "webp", "avif"];
const isRaster = (f: Format): f is RasterFormat => (RASTER as Format[]).includes(f);

const dirOf = (p: string) => p.slice(0, p.lastIndexOf("/"));
const baseOf = (p: string) => p.slice(p.lastIndexOf("/") + 1);

export function applyPattern(
  pattern: string,
  t: { name: string; placement: string; w: number; h: number; scale?: number; format: Format },
): string {
  const size = t.w === t.h ? String(t.w) : `${t.w}x${t.h}`;
  let n = (pattern.trim() || "{name}")
    .replace(/\{name\}/g, t.name)
    .replace(/\{placement\}/g, t.placement)
    .replace(/\{size\}/g, size)
    .replace(/\{w\}/g, String(t.w))
    .replace(/\{h\}/g, String(t.h))
    .replace(/\{scale\}/g, `${t.scale ?? 1}x`)
    .replace(/\{format\}/g, t.format)
    .replace(/[^a-zA-Z0-9@._-]/g, "-");
  if (!n.toLowerCase().endsWith(`.${t.format}`)) n += `.${t.format}`;
  return n;
}

/** Work out every file the export will contain, without rendering anything. */
export function planFiles(presets: Preset[], exp: ExportSettings, avifOk: boolean): PlannedFile[] {
  const out: PlannedFile[] = [];
  const seen = new Set<string>();
  const push = (f: PlannedFile) => {
    let path = f.path;
    let i = 2;
    while (seen.has(path)) path = f.path.replace(/(\.[a-z]+)$/, `-${i++}$1`);
    seen.add(path);
    out.push({ ...f, path, name: baseOf(path) });
  };
  for (const p of presets) {
    const allowed = p.formats.filter((f) => exp.formats[f] && (f !== "avif" || avifOk));
    let rasters = allowed.filter(isRaster);
    if (!rasters.length) rasters = [p.formats.find(isRaster) ?? "png"];
    for (const z of p.sizes) {
      for (const f of rasters) {
        const name = applyPattern(exp.pattern, { name: baseOf(z.path), placement: p.id, w: z.w, h: z.h, scale: z.scale, format: f });
        push({
          key: `${p.id}|${z.path}|${f}`,
          path: `${dirOf(z.path)}/${name}`,
          name,
          presetId: p.id,
          presetName: p.name,
          platform: p.platform,
          format: f,
          w: z.w,
          h: z.h,
          scale: z.scale,
        });
      }
    }
    if (allowed.includes("svg") && p.svgPath && p.sizes.length) {
      const big = [...p.sizes].sort((a, b) => b.w * b.h - a.w * a.h)[0];
      push({
        key: `${p.id}|svg`,
        path: `${p.svgPath}.svg`,
        name: "",
        presetId: p.id,
        presetName: p.name,
        platform: p.platform,
        format: "svg",
        w: big.w,
        h: big.h,
      });
    }
    if (allowed.includes("ico") && p.ico) {
      const max = Math.max(...p.ico.sizes);
      push({
        key: `${p.id}|ico`,
        path: `${p.ico.path}.ico`,
        name: "",
        presetId: p.id,
        presetName: p.name,
        platform: p.platform,
        format: "ico",
        w: max,
        h: max,
      });
    }
  }
  return out;
}

const tick = () => new Promise((r) => setTimeout(r, 0));

/** Render and encode every planned file. */
export async function generateFiles(
  src: Source,
  plan: PlannedFile[],
  presets: Preset[],
  edit: EditSettings,
  exp: ExportSettings,
  isCancelled: () => boolean = () => false,
): Promise<GeneratedFile[]> {
  const byId = new Map(presets.map((p) => [p.id, p]));
  const out: GeneratedFile[] = [];
  for (let i = 0; i < plan.length; i++) {
    if (isCancelled()) return out;
    if (i % 4 === 0) await tick();
    const f = plan[i];
    const p = byId.get(f.presetId);
    let blob: Blob;
    let overBudget = false;
    let qualityUsed: number | undefined;
    if (f.format === "svg") {
      blob = new Blob([buildSvg(src, f.w, f.h, edit, p)], { type: "image/svg+xml" });
    } else if (f.format === "ico") {
      const sizes = p?.ico?.sizes ?? [16, 32, 48];
      const pngs = await Promise.all(
        sizes.map(async (s) => ({ size: s, blob: await canvasToBlob(drawIcon(src, s, s, edit, p), "image/png") })),
      );
      blob = await buildIco(pngs);
    } else {
      const r = await encodeRaster(drawIcon(src, f.w, f.h, edit, p), f.format as RasterFormat, exp.quality, exp.targetKB);
      blob = r.blob;
      overBudget = r.overBudget;
      qualityUsed = r.qualityUsed;
    }
    out.push({ ...f, blob, bytes: blob.size, overBudget, qualityUsed });
  }
  return out;
}

const IOS_APPICON: Record<number, { idiom: string; size: string; scale: string }[]> = {
  40: [
    { idiom: "iphone", size: "20x20", scale: "2x" },
    { idiom: "ipad", size: "20x20", scale: "2x" },
    { idiom: "ipad", size: "40x40", scale: "1x" },
  ],
  58: [
    { idiom: "iphone", size: "29x29", scale: "2x" },
    { idiom: "ipad", size: "29x29", scale: "2x" },
  ],
  76: [{ idiom: "ipad", size: "76x76", scale: "1x" }],
  80: [
    { idiom: "iphone", size: "40x40", scale: "2x" },
    { idiom: "ipad", size: "40x40", scale: "2x" },
  ],
  87: [{ idiom: "iphone", size: "29x29", scale: "3x" }],
  120: [
    { idiom: "iphone", size: "40x40", scale: "3x" },
    { idiom: "iphone", size: "60x60", scale: "2x" },
  ],
  152: [{ idiom: "ipad", size: "76x76", scale: "2x" }],
  167: [{ idiom: "ipad", size: "83.5x83.5", scale: "2x" }],
  180: [{ idiom: "iphone", size: "60x60", scale: "3x" }],
  1024: [{ idiom: "ios-marketing", size: "1024x1024", scale: "1x" }],
};

export interface Snippets {
  html: string | null;
  manifest: string | null;
  android: string | null;
  ios: string | null;
  tabIconContents: string | null;
}

const href = (f: GeneratedFile) => "/" + f.path.replace(/^web\//, "");
const stem = (f: GeneratedFile) => f.name.replace(/\.[a-z]+$/, "");

/** Ready-to-paste code for each platform, built from the files that were actually generated. */
export function buildSnippets(files: GeneratedFile[]): Snippets {
  const fav = files.filter((f) => f.presetId === "favicon");
  const find = (w: number, fmt: Format) => fav.find((f) => f.w === w && f.format === fmt);

  let html: string | null = null;
  let manifest: string | null = null;
  if (fav.length) {
    const lines: string[] = [];
    const ico = fav.find((f) => f.format === "ico");
    const svg = fav.find((f) => f.format === "svg");
    const p32 = find(32, "png") ?? find(32, "webp");
    const p16 = find(16, "png") ?? find(16, "webp");
    const apple = find(180, "png") ?? find(180, "webp");
    if (ico) lines.push(`<link rel="icon" href="${href(ico)}" sizes="any">`);
    if (svg) lines.push(`<link rel="icon" type="image/svg+xml" href="${href(svg)}">`);
    if (p32) lines.push(`<link rel="icon" type="image/${p32.format}" sizes="32x32" href="${href(p32)}">`);
    if (p16) lines.push(`<link rel="icon" type="image/${p16.format}" sizes="16x16" href="${href(p16)}">`);
    if (apple) lines.push(`<link rel="apple-touch-icon" href="${href(apple)}">`);
    const icons = [192, 512]
      .map((s) => find(s, "png") ?? find(s, "webp"))
      .filter((f): f is GeneratedFile => !!f)
      .map((f) => ({ src: href(f), sizes: `${f.w}x${f.h}`, type: `image/${f.format}` }));
    if (icons.length) {
      lines.push(`<link rel="manifest" href="/site.webmanifest">`);
      manifest = JSON.stringify(
        { name: "My App", short_name: "App", icons, theme_color: "#ffffff", background_color: "#ffffff", display: "standalone" },
        null,
        2,
      );
    }
    html = lines.join("\n");
  }

  let android: string | null = null;
  const launcher = files.find((f) => f.presetId === "android-app" && f.path.includes("mipmap-"));
  const notify = files.find((f) => f.presetId === "notification");
  if (launcher || notify) {
    const parts: string[] = [];
    if (launcher)
      parts.push(
        `<!-- AndroidManifest.xml: copy android/res/ into app/src/main/res/ -->\n<application\n    android:icon="@mipmap/${stem(launcher)}"\n    android:roundIcon="@mipmap/${stem(launcher)}"\n    ... >`,
      );
    if (notify)
      parts.push(
        `<!-- Notification small icon (Kotlin) -->\n<!-- NotificationCompat.Builder(context, CHANNEL_ID)\n        .setSmallIcon(R.drawable.${stem(notify)}) -->`,
      );
    android = parts.join("\n\n");
  }

  let ios: string | null = null;
  const appIcons = files.filter((f) => f.presetId === "ios-app" && f.format === "png");
  if (appIcons.length) {
    const images = appIcons.flatMap((f) => (IOS_APPICON[f.w] ?? []).map((m) => ({ filename: f.name, ...m })));
    ios = JSON.stringify({ images, info: { author: "icon-refactor", version: 1 } }, null, 2);
  }

  let tabIconContents: string | null = null;
  const tabs = files.filter((f) => f.presetId === "tab-bar" && f.format === "png");
  if (tabs.length) {
    tabIconContents = JSON.stringify(
      {
        images: tabs.map((f) => ({ filename: f.name, idiom: "universal", scale: `${f.scale ?? 1}x` })),
        info: { author: "icon-refactor", version: 1 },
        properties: { "template-rendering-intent": "template" },
      },
      null,
      2,
    );
    if (!ios) ios = tabIconContents;
  }

  return { html, manifest, android, ios, tabIconContents };
}

/** ZIP with one folder per platform plus the snippet files. */
export async function buildZip(files: GeneratedFile[], snippets: Snippets): Promise<Blob> {
  const zip = new JSZip();
  for (const f of files) zip.file(f.path, f.blob);
  if (snippets.html) zip.file("web/head-snippet.html", snippets.html + "\n");
  if (snippets.manifest) zip.file("web/site.webmanifest", snippets.manifest + "\n");
  if (snippets.android) zip.file("android/AndroidManifest-snippet.xml", snippets.android + "\n");
  const appIcons = files.some((f) => f.presetId === "ios-app" && f.format === "png");
  if (appIcons && snippets.ios) zip.file("ios/AppIcon.appiconset/Contents.json", snippets.ios + "\n");
  if (snippets.tabIconContents) zip.file("ios/TabIcon.imageset/Contents.json", snippets.tabIconContents + "\n");
  zip.file(
    "README.txt",
    [
      "Generated by Icon Refactor",
      "",
      "web/      favicons, toolbar icons, head-snippet.html, site.webmanifest",
      "ios/      AppIcon.appiconset and TabIcon.imageset (drag into Assets.xcassets)",
      "android/  res/ folders (copy into app/src/main/res/) and a manifest snippet",
      "other/    avatars",
      "custom/   your custom sizes",
      "",
    ].join("\n"),
  );
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}
