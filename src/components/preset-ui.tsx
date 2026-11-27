"use client";

import { Plus } from "lucide-react";
import { CUSTOM_ID, PLATFORM_LABEL } from "@/lib/presets";
import type { EditSettings, Preset, Source } from "@/lib/types";
import { IconImage } from "./IconImage";
import { checker, cx } from "./ui";

export const PLATFORM_STYLE: Record<Preset["platform"], string> = {
  ios: "bg-slate-900 text-white",
  android: "bg-emerald-100 text-emerald-800",
  web: "bg-blue-100 text-blue-800",
  other: "bg-slate-100 text-slate-700",
};

export function PlatformBadge({ platform }: { platform: Preset["platform"] }) {
  return (
    <span className={cx("rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", PLATFORM_STYLE[platform])}>
      {PLATFORM_LABEL[platform]}
    </span>
  );
}

/** Tiny square showing the safe-zone margin as a dashed inner square. */
export function SafeZoneGlyph({ pct, size = 14 }: { pct: number; size?: number }) {
  return (
    <span className="relative inline-block shrink-0 rounded-[3px] bg-slate-200" style={{ width: size, height: size }}>
      <span className="absolute rounded-[2px] border border-dashed border-orange-500" style={{ inset: `${Math.max(pct, 6)}%` }} />
    </span>
  );
}

export function MaskGlyph({ p }: { p: Preset }) {
  return (
    <span
      className={cx(
        "inline-block h-3.5 w-3.5 shrink-0 border-2 border-slate-500",
        p.clipCircle || p.previewMask === "circle" ? "rounded-full" : p.previewMask === "squircle" ? "rounded-[5px]" : "rounded-[1px]",
      )}
    />
  );
}

export function Swatch({ color }: { color?: string }) {
  return color ? (
    <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full border border-slate-300" style={{ background: color }} />
  ) : (
    <span className="inline-block h-3.5 w-3.5 shrink-0 rounded-full bg-[conic-gradient(#f43f5e,#f59e0b,#10b981,#3b82f6,#a855f7,#f43f5e)]" />
  );
}

export function FormatBadges({ formats }: { formats: string[] }) {
  return (
    <span className="flex flex-wrap gap-1">
      {formats.map((f) => (
        <span key={f} className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-semibold text-slate-600">
          {f}
        </span>
      ))}
    </span>
  );
}

export function Thumb({ preset, source, edit, size }: { preset: Preset; source: Source; edit: EditSettings; size: number }) {
  const custom = preset.id === CUSTOM_ID;
  return (
    <div
      className={cx(
        "grid shrink-0 place-items-center overflow-hidden rounded-xl",
        custom ? "bg-amber-50" : preset.forceTint === "#FFFFFF" ? "bg-slate-800" : checker,
        preset.previewMask === "squircle" && "squircle",
        preset.previewMask === "circle" && "rounded-full",
      )}
      style={{ width: size, height: size }}
    >
      {custom ? (
        <Plus className="h-6 w-6 text-amber-600" />
      ) : (
        <IconImage source={source} edit={edit} preset={preset} size={preset.previewMask === "none" ? Math.round(size * 0.72) : size} />
      )}
    </div>
  );
}

