export type Format = "png" | "webp" | "avif" | "svg" | "ico";
export type RasterFormat = "png" | "webp" | "avif";
export type Platform = "web" | "ios" | "android" | "other";
export type PreviewMask = "none" | "squircle" | "circle";

export interface Size {
  w: number;
  h: number;
}

export interface SizeSpec extends Size {
  /** Output path without extension, e.g. "web/favicon-32". */
  path: string;
  scale?: number;
  label?: string;
}

export interface Preset {
  id: string;
  name: string;
  summary: string;
  description: string;
  platform: Platform;
  previewMask: PreviewMask;
  /** Margin (fraction of the icon) that artwork should stay inside. */
  safeZone: number;
  /** Monochrome template presets are always tinted with this colour. */
  forceTint?: string;
  /** The platform requires forceTint; the user's tint is ignored (iOS tab bar, Android notification). */
  tintLocked?: boolean;
  /** Background is always removed (template / notification icons). */
  transparent?: boolean;
  /** Background must be opaque (app icons). White is used if none is set. */
  opaque?: boolean;
  /** Output is clipped to a circle (avatars). */
  clipCircle?: boolean;
  formats: Format[];
  sizes: SizeSpec[];
  svgPath?: string;
  ico?: { path: string; sizes: number[] };
  details: [string, string][];
  imageAllIn?: boolean;
}

export interface EditSettings {
  fit: "fit" | "fill";
  zoom: number;
  offsetX: number;
  offsetY: number;
  padding: number;
  radius: number;
  background: string | null;
  tint: string | null;
}

export interface ExportSettings {
  formats: Record<Format, boolean>;
  quality: number;
  targetKB: number | null;
  pattern: string;
}

export interface Source {
  name: string;
  type: string;
  bytes: number;
  width: number;
  height: number;
  isSvg: boolean;
  dataUrl: string;
  img: HTMLImageElement;
}

export interface PlannedFile {
  key: string;
  path: string;
  name: string;
  presetId: string;
  presetName: string;
  platform: Platform;
  format: Format;
  w: number;
  h: number;
  scale?: number;
}

export interface GeneratedFile extends PlannedFile {
  blob: Blob;
  bytes: number;
  overBudget: boolean;
  qualityUsed?: number;
}

export interface Warning {
  id: string;
  level: "ok" | "info" | "warn" | "error";
  title: string;
  text: string;
  /** Names of the placements this check is about. */
  presets?: string[];
  /** One-click fix that patches the edit settings. */
  action?: { label: string; patch: Partial<EditSettings> };
}
