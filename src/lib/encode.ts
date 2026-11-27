import { makeCanvas } from "./render";
import type { RasterFormat } from "./types";

export function canvasToBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) =>
    c.toBlob((b) => (b ? resolve(b) : reject(new Error(`Could not encode ${type}`))), type, quality),
  );
}

let avifCheck: Promise<boolean> | null = null;

/** AVIF encoding through canvas is only available in some browsers. */
export function supportsAvif(): Promise<boolean> {
  if (!avifCheck) {
    avifCheck = canvasToBlob(makeCanvas(2, 2), "image/avif", 0.5)
      .then((b) => b.type === "image/avif")
      .catch(() => false);
  }
  return avifCheck;
}

/**
 * Encode a canvas. Lossy formats step the quality down until the file fits the
 * target size (if one is set). PNG is lossless, so it is only flagged when over budget.
 */
export async function encodeRaster(
  c: HTMLCanvasElement,
  fmt: RasterFormat,
  quality: number,
  targetKB: number | null,
): Promise<{ blob: Blob; overBudget: boolean; qualityUsed?: number }> {
  const mime = `image/${fmt}`;
  const limit = targetKB ? targetKB * 1024 : Infinity;
  if (fmt === "png") {
    const blob = await canvasToBlob(c, mime);
    return { blob, overBudget: blob.size > limit };
  }
  let q = quality;
  let blob = await canvasToBlob(c, mime, q);
  while (blob.size > limit && q > 0.15) {
    q = Math.max(0.1, +(q - 0.1).toFixed(2));
    blob = await canvasToBlob(c, mime, q);
  }
  return { blob, overBudget: blob.size > limit, qualityUsed: q };
}

/** Pack PNG images into a multi-size .ico (PNG-compressed entries, supported by all modern browsers). */
export async function buildIco(images: { size: number; blob: Blob }[]): Promise<Blob> {
  const datas = await Promise.all(images.map((i) => i.blob.arrayBuffer()));
  const HEADER = 6;
  const ENTRY = 16;
  let offset = HEADER + ENTRY * images.length;
  const total = offset + datas.reduce((a, d) => a + d.byteLength, 0);
  const buf = new ArrayBuffer(total);
  const v = new DataView(buf);
  const u8 = new Uint8Array(buf);
  v.setUint16(0, 0, true);
  v.setUint16(2, 1, true);
  v.setUint16(4, images.length, true);
  images.forEach((img, i) => {
    const o = HEADER + i * ENTRY;
    const s = img.size >= 256 ? 0 : img.size;
    v.setUint8(o, s);
    v.setUint8(o + 1, s);
    v.setUint8(o + 2, 0);
    v.setUint8(o + 3, 0);
    v.setUint16(o + 4, 1, true);
    v.setUint16(o + 6, 32, true);
    v.setUint32(o + 8, datas[i].byteLength, true);
    v.setUint32(o + 12, offset, true);
    u8.set(new Uint8Array(datas[i]), offset);
    offset += datas[i].byteLength;
  });
  return new Blob([buf], { type: "image/x-icon" });
}
