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
  if (p.forceTint) out.tint = p.tintLocked ? p.forceTint : s.tint ?? p.forceTint;
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

const halvingCache = new WeakMap<object, HTMLCanvasElement[]>();

/** Downscale raster images in halving steps so small icons stay sharp instead of aliased. */
function scaledSource(img: HTMLImageElement | HTMLCanvasElement, iw: number, ih: number, dw: number, dh: number, vector: boolean): CanvasImageSource {
  if (vector) return img;
  let levels = halvingCache.get(img);
  if (!levels) {
    levels = [];
    halvingCache.set(img, levels);
  }
  let cur: CanvasImageSource = img;
  let cw = iw;
  let ch = ih;
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

export interface Artwork {
  /** Source with its solid background made transparent. */
  canvas: HTMLCanvasElement;
  /** Detected background colour, e.g. "#4ADE80". */
  background: string;
  /** Share of the image that is artwork (0–1). */
  coverage: number;
}

const artworkCache = new WeakMap<HTMLImageElement, Artwork | null>();

/**
 * Monochrome icons (tab bar, toolbar, notification) are made from the image's shape.
 * If the image has no transparency, its shape is the whole square. In that case,
 * detect the solid background colour from the border pixels and key it out,
 * so only the artwork is tinted. Returns null when the image already has transparency.
 */
export function extractArtwork(src: Source): Artwork | null {
  if (artworkCache.has(src.img)) return artworkCache.get(src.img) ?? null;
  const k = Math.min(1, 1024 / Math.max(src.width, src.height));
  const c = makeCanvas(src.width * k, src.height * k);
  const x = ctx2d(c);
  x.drawImage(src.img, 0, 0, c.width, c.height);
  const img = x.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  const W = c.width;
  const H = c.height;

  // Sample a 2 px border.
  const border: number[] = [];
  for (let y = 0; y < H; y++) {
    for (let xx = 0; xx < W; xx++) {
      if (xx > 1 && xx < W - 2 && y > 1 && y < H - 2) continue;
      border.push((y * W + xx) * 4);
    }
  }
  const clear = border.filter((i) => d[i + 3] < 16).length;
  if (clear / border.length > 0.3) {
    artworkCache.set(src.img, null);
    return null;
  }

  // Most common border colour (quantised) is the background.
  const counts = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (const i of border) {
    if (d[i + 3] < 128) continue;
    const key = ((d[i] >> 4) << 8) | ((d[i + 1] >> 4) << 4) | (d[i + 2] >> 4);
    const e = counts.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++;
    e.r += d[i];
    e.g += d[i + 1];
    e.b += d[i + 2];
    counts.set(key, e);
  }
  const top = [...counts.values()].sort((a, b) => b.n - a.n)[0];
  if (!top) {
    artworkCache.set(src.img, null);
    return null;
  }
  const br = top.r / top.n;
  const bg = top.g / top.n;
  const bb = top.b / top.n;

  // Alpha from colour distance to the background, with a soft edge for anti-aliasing.
  const LO = 28;
  const HI = 70;
  let art = 0;
  for (let i = 0; i < d.length; i += 4) {
    const dist = Math.hypot(d[i] - br, d[i + 1] - bg, d[i + 2] - bb);
    const t = Math.min(1, Math.max(0, (dist - LO) / (HI - LO)));
    const a = Math.round(t * d[i + 3]);
    d[i + 3] = a;
    if (a > 128) art++;
  }
  x.putImageData(img, 0, 0);

  // Trim to the artwork's bounding box so the glyph fills the icon like a real template icon.
  let minX = W;
  let minY = H;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let xx = 0; xx < W; xx++) {
      if (d[(y * W + xx) * 4 + 3] > 128) {
        if (xx < minX) minX = xx;
        if (xx > maxX) maxX = xx;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  let out = c;
  if (maxX >= minX && maxY >= minY) {
    const pad = Math.round(Math.max(maxX - minX, maxY - minY) * 0.02);
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(W, maxX + pad + 1) - sx;
    const sh = Math.min(H, maxY + pad + 1) - sy;
    out = makeCanvas(sw, sh);
    ctx2d(out).drawImage(c, sx, sy, sw, sh, 0, 0, sw, sh);
  }

  const hex = (v: number) => Math.round(v).toString(16).padStart(2, "0");
  const result: Artwork = {
    canvas: out,
    background: `#${hex(br)}${hex(bg)}${hex(bb)}`.toUpperCase(),
    coverage: art / (W * H),
  };
  artworkCache.set(src.img, result);
  return result;
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
  // Tinted icons use the artwork shape only (solid backgrounds are keyed out).
  const art = e.tint ? extractArtwork(src) : null;
  if (art) {
    const A = layout(art.canvas, c.width, c.height, e);
    l.drawImage(scaledSource(art.canvas, art.canvas.width, art.canvas.height, A.dw, A.dh, false), A.dx, A.dy, A.dw, A.dh);
  } else {
    l.drawImage(scaledSource(src.img, src.width, src.height, L.dw, L.dh, src.isSvg), L.dx, L.dy, L.dw, L.dh);
  }
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
  const art = e.tint ? extractArtwork(src) : null;
  const href = art ? art.canvas.toDataURL("image/png") : src.dataUrl;
  const G = art ? layout(art.canvas, w, h, e) : L;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<defs><clipPath id="clip">${clip}</clipPath>${filter}</defs>` +
    `<g clip-path="url(#clip)">${bg}<image href="${esc(href)}" x="${n(G.dx)}" y="${n(G.dy)}" width="${n(G.dw)}" height="${n(G.dh)}" preserveAspectRatio="none"${e.tint ? ' filter="url(#tint)"' : ""}/></g></svg>`
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

function alphaBox(c: HTMLCanvasElement, threshold = 64) {
  const px = pixels(c);
  let minX = c.width;
  let minY = c.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (px[(y * c.width + x) * 4 + 3] > threshold) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return maxX < 0 ? null : { minX, minY, maxX, maxY };
}

/**
 * Quality checks shown in the Edit step. Returns one entry per check,
 * including passed checks (level "ok"), so the UI can show what was verified.
 */
export function analyze(src: Source, presets: Preset[], s: EditSettings): Warning[] {
  const out: Warning[] = [];
  if (!presets.length) return out;

  // 1. Resolution
  const needed = presets.flatMap((p) => p.sizes.map((z) => ({ p, px: Math.max(z.w, z.h) })));
  const biggest = needed.sort((a, b) => b.px - a.px)[0];
  if (src.isSvg) {
    out.push({ id: "resolution", level: "ok", title: "Vector image", text: "SVG renders sharp at every size." });
  } else if (biggest && biggest.px > Math.min(src.width, src.height)) {
    const affected = [...new Set(needed.filter((n) => n.px > Math.min(src.width, src.height)).map((n) => n.p.name))];
    out.push({
      id: "resolution",
      level: "warn",
      title: "Image will be upscaled",
      text: `Your image is ${src.width}×${src.height} px but ${biggest.p.name} needs ${biggest.px} px, so it may look soft. Use a bigger image or an SVG.`,
      presets: affected,
    });
  } else {
    out.push({ id: "resolution", level: "ok", title: "Sharp at every size", text: `${src.width}×${src.height} px is big enough for every selected placement.` });
  }

  // 2. Background
  const mono = presets.filter((p) => effectiveSettings(s, p).tint);
  const art = mono.length ? extractArtwork(src) : null;
  if (art) {
    if (art.coverage < 0.005 || art.coverage > 0.9) {
      out.push({
        id: "background",
        level: "warn",
        title: "Couldn't separate the artwork",
        text: "The background couldn't be removed cleanly, so monochrome icons may look like a block. Use a PNG or SVG with a transparent background.",
        presets: mono.map((p) => p.name),
      });
    } else {
      out.push({
        id: "background",
        level: "info",
        title: `Solid background ${art.background} removed`,
        text: "Monochrome icons use only your artwork. Full-colour icons keep the original image.",
        presets: mono.map((p) => p.name),
      });
    }
  } else if (mono.length) {
    out.push({ id: "background", level: "ok", title: "Transparent background", text: "Monochrome icons use your artwork's shape directly." });
  }

  // 3. Safe zone: does the visible artwork stay inside each placement's safe margin?
  const S = 128;
  const outside: Preset[] = [];
  for (const p of presets) {
    const e = effectiveSettings(s, p);
    if (!e.tint && extractArtwork(src) !== null) continue; // opaque image on a full-colour icon: the image is its own background
    const box = alphaBox(drawIcon(src, S, S, { ...s, background: null }, { ...p, opaque: false }));
    if (!box) continue;
    const inset = p.safeZone * S - 1;
    if (box.minX < inset || box.minY < inset || box.maxX > S - 1 - inset || box.maxY > S - 1 - inset) outside.push(p);
  }
  if (outside.length) {
    const pad = Math.ceil(Math.max(...outside.map((p) => p.safeZone)) * 100 + 1) / 100;
    out.push({
      id: "safe-zone",
      level: "warn",
      title: "Artwork outside the safe zone",
      text: "Parts of your artwork go past the dashed safe-zone line and may be cut off by masks or look cramped.",
      presets: outside.map((p) => p.name),
      action: { label: `Fit inside safe zone (padding ${Math.round(pad * 100)}%)`, patch: { padding: Math.min(0.3, pad), zoom: 1, offsetX: 0, offsetY: 0 } },
    });
  } else {
    out.push({ id: "safe-zone", level: "ok", title: "Inside every safe zone", text: "Nothing will be cut off by platform masks." });
  }

  // 4. Thin detail at small sizes
  const small = pixels(drawIcon(src, 24, 24, { ...s, background: null, tint: "#000000" }));
  let any = 0;
  let partial = 0;
  for (let i = 3; i < small.length; i += 4) {
    if (small[i] > 25) any++;
    if (small[i] > 25 && small[i] < 200) partial++;
  }
  if (any > 0 && partial / any > 0.6) {
    out.push({
      id: "detail",
      level: "warn",
      title: "Too thin at 24 px",
      text: "Fine lines blur at small sizes. Zoom in, reduce padding, or simplify the artwork.",
      action: { label: "Zoom in to 120%", patch: { zoom: Math.max(s.zoom, 1.2) } },
    });
  } else {
    out.push({ id: "detail", level: "ok", title: "Readable at 24 px", text: "Details hold up at small sizes." });
  }

  // 5. Contrast (only meaningful for transparent, full-colour artwork)
  if (!s.background && !s.tint && !extractArtwork(src)) {
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
      const dark = contrast(L, luminance(17, 24, 39)) < 1.8;
      const light = contrast(L, 1) < 1.8;
      if (dark || light) {
        out.push({
          id: "contrast",
          level: "warn",
          title: `Low contrast on ${dark && light ? "dark and light" : dark ? "dark" : "light"} backgrounds`,
          text: dark
            ? "Your icon may disappear in dark mode. Add a background or use the tint option."
            : "Your icon may disappear on white. Add a background or use a darker tint.",
          action: { label: dark ? "Use white background" : "Use navy background", patch: { background: dark ? "#FFFFFF" : "#0F172A" } },
        });
      } else {
        out.push({ id: "contrast", level: "ok", title: "Good contrast", text: "Visible on both light and dark backgrounds." });
      }
    }
  }

  // 6. Opaque app icons
  const opaque = presets.filter((p) => p.opaque);
  if (opaque.length && !s.background) {
    out.push({
      id: "opaque",
      level: "info",
      title: "White used behind app icons",
      text: "App icons can't be transparent. Pick a background colour, or keep white.",
      presets: opaque.map((p) => p.name),
      action: { label: "Use blue background", patch: { background: "#2563EB" } },
    });
  }

  // 7. Locked tints
  const locked = presets.filter((p) => p.tintLocked);
  if (s.tint && locked.length) {
    out.push({
      id: "tint-locked",
      level: "info",
      title: "Some icons keep their platform colour",
      text: "iOS tab bar icons stay black (iOS recolours them) and Android notification icons stay white. Your tint applies to everything else.",
      presets: locked.map((p) => p.name),
    });
  }
  return out;
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
