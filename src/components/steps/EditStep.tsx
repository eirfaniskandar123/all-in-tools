"use client";

import { Hand, Lock, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { presetSpecs } from "@/lib/presets";
import { DEFAULT_EDIT, analyze, effectiveSettings } from "@/lib/render";
import type { EditSettings, Preset, Source } from "@/lib/types";
import { ChecksPanel } from "../edit/ChecksPanel";
import { LivePreview } from "../edit/LivePreview";
import { ToolsPanel } from "../edit/ToolsPanel";
import { IconImage } from "../IconImage";
import { MaskGlyph, SafeZoneGlyph, Swatch, Thumb } from "../preset-ui";
import { Button, Card, checker, cx } from "../ui";

function SpecCell({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

export function EditStep({
  source,
  edit,
  presets,
  onEdit,
  onReset,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onBack,
  onNext,
}: {
  source: Source;
  edit: EditSettings;
  presets: Preset[];
  onEdit: (patch: Partial<EditSettings>) => void;
  onReset: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [previewId, setPreviewId] = useState(presets[0]?.id ?? "");
  const preview = presets.find((p) => p.id === previewId) ?? presets[0];
  const warnings = useMemo(() => analyze(source, presets, edit), [source, presets, edit]);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const BOX = 400;
  const spec = preview ? presetSpecs(preview) : null;
  const tint = preview ? effectiveSettings(edit, preview).tint : null;
  const dark = tint === "#FFFFFF";

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Adjust your icon</h1>
        <p className="mt-1 text-slate-600">
          Changes apply to every placement. The big preview shows one placement at a time; the live preview shows all of
          them in context.
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[290px_1fr_340px]">
        <ToolsPanel edit={edit} presets={presets} onEdit={onEdit} />

        <div className="min-w-0 space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Preview placement">
              {presets.map((p) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={p.id === preview?.id}
                  onClick={() => setPreviewId(p.id)}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl border py-1 pl-1 pr-3 text-sm font-medium transition",
                    p.id === preview?.id
                      ? "border-blue-600 bg-blue-50 text-blue-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
                  )}
                >
                  <Thumb preset={p} source={source} edit={edit} size={26} />
                  {p.name}
                </button>
              ))}
            </div>

            <div className="grid place-items-center rounded-xl bg-slate-100 p-4">
              <div
                className={cx(
                  "relative cursor-grab touch-none overflow-hidden shadow-lg active:cursor-grabbing",
                  dark ? "bg-slate-800" : checker,
                  preview?.previewMask === "squircle" && "squircle",
                  (preview?.previewMask === "circle" || preview?.clipCircle) && "rounded-full",
                )}
                style={{ width: "min(100%, 400px)", aspectRatio: "1" }}
                onPointerDown={(e) => {
                  (e.target as Element).setPointerCapture(e.pointerId);
                  drag.current = { x: e.clientX, y: e.clientY, ox: edit.offsetX, oy: edit.offsetY };
                }}
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (!d) return;
                  const w = (e.currentTarget as HTMLElement).clientWidth || BOX;
                  onEdit({ offsetX: +(d.ox + (e.clientX - d.x) / w).toFixed(4), offsetY: +(d.oy + (e.clientY - d.y) / w).toFixed(4) });
                }}
                onPointerUp={() => (drag.current = null)}
                onPointerCancel={() => (drag.current = null)}
              >
                {preview && <IconImage source={source} edit={edit} preset={preview} size={BOX} className="h-full w-full" />}
                {spec && (
                  <>
                    <div className="pointer-events-none absolute border-2 border-dashed border-orange-400/90" style={{ inset: `${spec.safeZonePct}%` }} />
                    <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-white/85 px-1.5 text-[10px] font-semibold text-orange-600">
                      safe zone
                    </span>
                  </>
                )}
              </div>
              <div className="mt-3 flex w-full max-w-[400px] items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Hand className="h-3.5 w-3.5" /> Drag to move · {edit.fit === "fit" ? "Fit" : "Fill"} · {Math.round(edit.zoom * 100)}%
                </span>
                <button onClick={() => onEdit({ offsetX: 0, offsetY: 0, zoom: 1 })} className="font-medium text-blue-600 hover:underline">
                  Re-centre
                </button>
              </div>
            </div>

            {preview && spec && (
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-4">
                <SpecCell icon={null} label="Sizes" value={spec.sizesShort} />
                <SpecCell icon={<SafeZoneGlyph pct={spec.safeZonePct} size={12} />} label="Safe zone" value={`${spec.safeZonePct}% margin`} />
                <SpecCell icon={<MaskGlyph p={preview} />} label="Mask" value={spec.mask} />
                <SpecCell
                  icon={<Swatch color={tint ?? undefined} />}
                  label="Colour"
                  value={
                    preview.tintLocked ? (
                      <span className="inline-flex items-center gap-1">
                        <Lock className="h-3 w-3" /> {tint === "#FFFFFF" ? "White" : "Black"}, locked
                      </span>
                    ) : tint ? (
                      edit.tint ? "Your tint" : "Default dark"
                    ) : (
                      "Full colour"
                    )
                  }
                />
              </div>
            )}
          </Card>

          <ChecksPanel warnings={warnings} onEdit={onEdit} />
        </div>

        <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
          <LivePreview source={source} edit={edit} presets={presets} activeId={preview?.id} onPick={setPreviewId} onBack={onBack} />
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" /> Undo
          </Button>
          <Button variant="ghost" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" /> Redo
          </Button>
          <Button variant="ghost" onClick={onReset} disabled={JSON.stringify(edit) === JSON.stringify(DEFAULT_EDIT)}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
        <div className="flex gap-3">
          <Button onClick={onBack} className="px-8 py-3">Back</Button>
          <Button variant="primary" className="px-8 py-3" onClick={onNext}>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
