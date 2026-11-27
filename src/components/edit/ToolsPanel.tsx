"use client";

import { Crop, Droplet, PaintBucket, Scaling } from "lucide-react";
import type { ReactNode } from "react";
import { effectiveSettings } from "@/lib/render";
import type { EditSettings, Preset } from "@/lib/types";
import { Swatch } from "../preset-ui";
import { Card, Segmented, Slider, Toggle, checker, cx } from "../ui";

const SWATCHES: { color: string | null; name: string }[] = [
  { color: null, name: "Transparent" },
  { color: "#FFFFFF", name: "White" },
  { color: "#0F172A", name: "Navy" },
  { color: "#2563EB", name: "Blue" },
  { color: "#F59E0B", name: "Amber" },
];

function ToolSection({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t border-slate-100 px-5 py-4 first:border-t-0">
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="grid h-6 w-6 place-items-center rounded-lg bg-slate-100 text-slate-600">{icon}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/** How each selected placement will be coloured, so locked platform rules are visible. */
function tintFor(p: Preset, edit: EditSettings): { color?: string; label: string; locked?: boolean } {
  const t = effectiveSettings(edit, p).tint;
  if (p.tintLocked)
    return {
      color: t ?? undefined,
      label: `${t === "#FFFFFF" ? "White" : "Black"} · locked by ${p.platform === "ios" ? "iOS" : "Android"}`,
      locked: true,
    };
  if (!t) return { label: "Full colour" };
  return { color: t, label: edit.tint ? "Your tint" : "Default dark" };
}

export function ToolsPanel({
  edit,
  presets,
  onEdit,
}: {
  edit: EditSettings;
  presets: Preset[];
  onEdit: (patch: Partial<EditSettings>) => void;
}) {
  const named = SWATCHES.find((s) => s.color === edit.background);
  const customBg = edit.background && !named ? edit.background : "#10B981";
  const bgLabel = named ? `${named.name}${named.color ? ` · ${named.color}` : ""}` : `Custom · ${edit.background}`;

  return (
    <Card className="overflow-hidden">
      <ToolSection icon={<Crop className="h-3.5 w-3.5" />} title="Framing">
        <Segmented
          value={edit.fit}
          onChange={(fit) => onEdit({ fit })}
          options={[
            { value: "fit", label: "Fit" },
            { value: "fill", label: "Fill" },
          ]}
        />
        <p className="-mt-2 text-xs text-slate-500">
          {edit.fit === "fit" ? "Shows the whole image inside the icon." : "Covers the whole icon; edges may be cropped."}
        </p>
        <Slider label="Zoom" min={0.5} max={2} step={0.01} value={edit.zoom} display={`${Math.round(edit.zoom * 100)}%`} onChange={(zoom) => onEdit({ zoom })} />
      </ToolSection>

      <ToolSection icon={<Scaling className="h-3.5 w-3.5" />} title="Spacing & shape">
        <Slider label="Padding" min={0} max={0.3} step={0.01} value={edit.padding} display={`${Math.round(edit.padding * 100)}%`} onChange={(padding) => onEdit({ padding })} />
        <Slider label="Corner radius" min={0} max={0.5} step={0.01} value={edit.radius} display={`${Math.round(edit.radius * 100)}%`} onChange={(radius) => onEdit({ radius })} />
      </ToolSection>

      <ToolSection icon={<PaintBucket className="h-3.5 w-3.5" />} title="Background">
        <div className="flex flex-wrap items-center gap-2">
          {SWATCHES.map((s) => (
            <button
              key={s.name}
              title={s.name}
              aria-label={`${s.name} background`}
              onClick={() => onEdit({ background: s.color })}
              className={cx(
                "h-8 w-8 rounded-lg border transition",
                edit.background === s.color ? "ring-2 ring-blue-600 ring-offset-2" : "border-slate-300 hover:border-slate-400",
                !s.color && checker,
              )}
              style={s.color ? { background: s.color } : undefined}
            />
          ))}
          <label
            title="Custom colour"
            className={cx(
              "relative h-8 w-8 cursor-pointer overflow-hidden rounded-lg border border-slate-300",
              !named && "ring-2 ring-blue-600 ring-offset-2",
            )}
            style={{ background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
          >
            <input
              type="color"
              value={customBg}
              onChange={(e) => onEdit({ background: e.target.value.toUpperCase() })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
        </div>
        <p className="text-xs text-slate-500">
          Selected: <span className="font-medium text-slate-700">{bgLabel}</span>
        </p>
      </ToolSection>

      <ToolSection icon={<Droplet className="h-3.5 w-3.5" />} title="Tint">
        <div className="flex items-center justify-between">
          <Toggle checked={!!edit.tint} onChange={(on) => onEdit({ tint: on ? "#111827" : null })} label="Monochrome" />
          {edit.tint && (
            <input
              type="color"
              value={edit.tint}
              onChange={(e) => onEdit({ tint: e.target.value.toUpperCase() })}
              className="h-8 w-10 cursor-pointer rounded border border-slate-300"
              aria-label="Tint colour"
            />
          )}
        </div>
        {presets.length > 0 && (
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Colour per placement</div>
            <ul className="space-y-1.5 text-xs">
              {presets.map((p) => {
                const t = tintFor(p, edit);
                return (
                  <li key={p.id} className="flex items-start gap-2">
                    <span className="mt-px">
                      <Swatch color={t.color} />
                    </span>
                    <span className="shrink-0 text-slate-700">{p.name}</span>
                    <span className={cx("ml-auto text-right", t.locked ? "text-slate-500" : "font-medium text-slate-800")}>
                      {t.locked && "🔒 "}
                      {t.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </ToolSection>
    </Card>
  );
}
