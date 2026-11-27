import type { EditSettings, Preset, Source, Warning } from "./types";

export const DEFAULT_EDIT: EditSettings = {
  fit: "fit",
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  padding: 0.08,
  radius: 0,
  background: null,
  tint: null,
};

export function makeCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function ctx2d(c: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available in this browser");
  return ctx;
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

/** Give SVGs without explicit width/height a large intrinsic size so they rasterise crisply. */
function normalizeSvg(text: string): string {
  try {
    const doc = new DOMParser().parseFromString(text, "image/svg+xml");
    const svg = doc.documentElement;
    if (svg.nodeName.toLowerCase() !== "svg") return text;
    const vb = svg.getAttribute("viewBox")?.split(/[\s,]+/).map(Number);
    const w = svg.getAttribute("width");
    const hasSize = !!w && !w.includes("%");
    if (!hasSize && vb && vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
      const k = 1024 / Math.max(vb[2], vb[3]);
      svg.setAttribute("width", String(vb[2] * k));
      svg.setAttribute("height", String(vb[3] * k));
    }
    return new XMLSerializer().serializeToString(svg);
  } catch {
    return text;
  }
}

export async function loadSource(file: Blob, name: string): Promise<Source> {
  const isSvg = file.type === "image/svg+xml" || /\.svg$/i.test(name);
  const dataUrl = isSvg
    ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(normalizeSvg(await file.text()))
    : await readAsDataUrl(file);
  const img = new Image();
  img.decoding = "async";
  img.src = dataUrl;
  await img.decode();
  if (!img.naturalWidth || !img.naturalHeight) throw new Error("This image has no size");
  return {
    name,
    type: isSvg ? "image/svg+xml" : file.type,
    bytes: file.size,
    width: img.naturalWidth,
    height: img.naturalHeight,
    isSvg,
    dataUrl,
    img,
  };
}

/** Apply the rules a preset enforces (monochrome template, opaque, transparent). */
export function effectiveSettings(s: EditSettings, p?: Preset): EditSettings {
  if (!p) return s;
  const out = { ...s };
  if (p.forceTint) out.tint = p.forceTint;
  if (p.transparent) out.background = null;
  if (p.opaque && !out.background) out.background = "#FFFFFF";
  return out;
}

export function layout(src: { width: number; height: number }, w: number, h: number, s: EditSettings) {
  const m = Math.min(w, h);
  const pad = s.padding * m;
  const aw = Math.max(1, w - 2 * pad);
  const ah = Math.max(1, h - 2 * pad);
  const base =
    s.fit === "fit" ? Math.min(aw / src.width, ah / src.height) : Math.max(aw / src.width, ah / src.height);
  const k = base * s.zoom;
  const dw = src.width * k;
  const dh = src.height * k;
  return {
    dx: (w - dw) / 2 + s.offsetX * w,
    dy: (h - dh) / 2 + s.offsetY * h,
    dw,
    dh,
    r: s.radius * m,
  };
}

const halvingCache = new WeakMap<HTMLImageElement, HTMLCanvasElement[]>();

/** Downscale raster images in halving steps so small icons stay sharp instead of aliased. */
function scaledSource(src: Source, dw: number, dh: number): CanvasImageSource {
  if (src.isSvg) return src.img;
  let levels = halvingCache.get(src.img);
  if (!levels) {
    levels = [];
    halvingCache.set(src.img, levels);
  }
  let cur: CanvasImageSource = src.img;
  let cw = src.width;
  let ch = src.height;
  let i = 0;
  while (cw / 2 >= dw && ch / 2 >= dh && cw > 2 && ch > 2) {
    if (!levels[i]) {
      const c = makeCanvas(cw / 2, ch / 2);
      const x = ctx2d(c);
      x.imageSmoothingQuality = "high";
      x.drawImage(cur, 0, 0, c.width, c.height);
      levels[i] = c;
    }
    cur = levels[i];
    cw = levels[i].width;
    ch = levels[i].height;
    i++;
  }
  return cur;
}

function clipShape(ctx: CanvasRenderingContext2D, w: number, h: number, r: number, circle?: boolean) {
  ctx.beginPath();
  if (circle) ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  else if (r > 0) ctx.roundRect(0, 0, w, h, r);
  else ctx.rect(0, 0, w, h);
  ctx.clip();
}

/** Render one icon. This is the single source of truth for previews and exports. */
export function drawIcon(src: Source, w: number, h: number, s: EditSettings, p?: Preset): HTMLCanvasElement {
  const e = effectiveSettings(s, p);
  const c = makeCanvas(w, h);
  const ctx = ctx2d(c);
  const L = layout(src, c.width, c.height, e);
  ctx.save();
  clipShape(ctx, c.width, c.height, L.r, p?.clipCircle);
  if (e.background) {
    ctx.fillStyle = e.background;
    ctx.fillRect(0, 0, c.width, c.height);
  }
  const layer = makeCanvas(c.width, c.height);
  const l = ctx2d(layer);
  l.imageSmoothingEnabled = true;
  l.imageSmoothingQuality = "high";
  l.drawImage(scaledSource(src, L.dw, L.dh), L.dx, L.dy, L.dw, L.dh);
  if (e.tint) {
    l.globalCompositeOperation = "source-in";
    l.fillStyle = e.tint;
    l.fillRect(0, 0, c.width, c.height);
  }
  ctx.drawImage(layer, 0, 0);
  ctx.restore();
  return c;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

/** Build an SVG with the same layout. Vector sources stay vector. */
export function buildSvg(src: Source, w: number, h: number, s: EditSettings, p?: Preset): string {
  const e = effectiveSettings(s, p);
  const L = layout(src, w, h, e);
  const n = (v: number) => +v.toFixed(3);
  const clip = p?.clipCircle
    ? `<ellipse cx="${w / 2}" cy="${h / 2}" rx="${w / 2}" ry="${h / 2}"/>`
    : `<rect width="${w}" height="${h}" rx="${n(L.r)}"/>`;
  const filter = e.tint
    ? `<filter id="tint" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><feFlood flood-color="${e.tint}"/><feComposite in2="SourceAlpha" operator="in"/></filter>`
    : "";
  const bg = e.background ? `<rect width="${w}" height="${h}" fill="${e.background}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><clipPath id="clip">${clip}</clipPath>${filter}</defs>` +
    `<g clip-path="url(#clip)">${bg}<image href="${esc(src.dataUrl)}" x="${n(L.dx)}" y="${n(L.dy)}" width="${n(L.dw)}" height="${n(L.dh)}" preserveAspectRatio="none"${e.tint ? ' filter="url(#tint)"' : ""}/></g></svg>`
  );
}

function pixels(c: HTMLCanvasElement): Uint8ClampedArray {
  return ctx2d(c).getImageData(0, 0, c.width, c.height).data;
}

function luminance(r: number, g: number, b: number): number {
  const f = (v: number) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

const contrast = (a: number, b: number) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

/** Quality checks shown in the Edit step. */
export function analyze(src: Source, presets: Preset[], s: EditSettings): Warning[] {
  const out: Warning[] = [];
  const needed = presets.flatMap((p) => p.sizes.map((z) => ({ p, px: Math.max(z.w, z.h) })));
  const biggest = needed.sort((a, b) => b.px - a.px)[0];
  if (!src.isSvg && biggest && biggest.px > Math.min(src.width, src.height)) {
    out.push({
      level: "warn",
      text: `Source is ${src.width}×${src.height} px but ${biggest.p.name} needs ${biggest.px} px. It will be upscaled and may look soft. Use a bigger image or an SVG.`,
    });
  }

  const raw = makeCanvas(96, 96);
  ctx2d(raw).drawImage(src.img, 0, 0, 96, 96);
  const rp = pixels(raw);
  let clear = 0;
  for (let i = 3; i < rp.length; i += 4) if (rp[i] < 16) clear++;
  const clearRatio = clear / (rp.length / 4);
  const mono = presets.filter((p) => p.forceTint);
  if (mono.length && clearRatio < 0.04) {
    out.push({
      level: "warn",
      text: `Your image has no transparent background, so ${mono.map((p) => p.name).join(", ")} will render as a solid block. Use a PNG or SVG with transparency.`,
    });
  }

  const small = pixels(drawIcon(src, 24, 24, { ...s, background: null, tint: "#000000" }));
  let any = 0;
  let partial = 0;
  for (let i = 3; i < small.length; i += 4) {
    if (small[i] > 25) any++;
    if (small[i] > 25 && small[i] < 200) partial++;
  }
  if (any > 0 && partial / any > 0.6) {
    out.push({ level: "warn", text: "Lines look too thin at 24 px. Zoom in, reduce padding, or simplify the artwork." });
  }

  if (!s.background && !s.tint) {
    const px = pixels(drawIcon(src, 64, 64, { ...s, background: null }));
    let sum = 0;
    let n = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] > 128) {
        sum += luminance(px[i], px[i + 1], px[i + 2]);
        n++;
      }
    }
    if (n) {
      const L = sum / n;
      if (contrast(L, luminance(17, 24, 39)) < 1.8)
        out.push({ level: "warn", text: "Low contrast on a dark background (dark mode). Try the tint option or add a background." });
      if (contrast(L, 1) < 1.8)
        out.push({ level: "warn", text: "Low contrast on a white background. Try a darker tint or add a background." });
    }
  }

  if (presets.some((p) => p.opaque) && !s.background) {
    out.push({ level: "info", text: "App icons must be opaque, so white is used behind them. Pick a background colour to change it." });
  }
  if (!out.some((w) => w.level !== "info")) {
    out.unshift({ level: "info", text: "Looks good at every selected size." });
  }
  return out;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
