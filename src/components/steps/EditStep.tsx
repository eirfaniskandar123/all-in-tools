"use client";

import { AlertTriangle, Hand, Info, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { PRESETS } from "@/lib/presets";
import { DEFAULT_EDIT, analyze } from "@/lib/render";
import type { EditSettings, Preset, Source } from "@/lib/types";
import { IconImage } from "../IconImage";
import { Button, Card, Segmented, Slider, Toggle, checker, cx } from "../ui";

const byId = (id: string) => PRESETS.find((p) => p.id === id) as Preset;
const TAB_ACTIVE: Preset = { ...byId("tab-bar"), forceTint: "#2563EB" };
const APP = byId("ios-app");
const FAV = byId("favicon");

const SWATCHES: (string | null)[] = [null, "#FFFFFF", "#0F172A", "#2563EB", "#F59E0B"];

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
  const safe = preview ? Math.round(preview.safeZone * 100) : 0;
  const customBg = edit.background && !SWATCHES.includes(edit.background) ? edit.background : "#10B981";

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Adjust your icon</h1>
        <p className="mt-1 text-slate-600">Changes apply to every placement. Previews and checks update live.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[280px_1fr_320px]">
        {/* Tools */}
        <Card className="space-y-6 p-5">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Crop</div>
            <Segmented
              value={edit.fit}
              onChange={(fit) => onEdit({ fit })}
              options={[
                { value: "fit", label: "Fit" },
                { value: "fill", label: "Fill" },
              ]}
            />
          </div>
          <Slider label="Zoom" min={0.5} max={2} step={0.01} value={edit.zoom} display={`${Math.round(edit.zoom * 100)}%`} onChange={(zoom) => onEdit({ zoom })} />
          <Slider label="Padding" min={0} max={0.3} step={0.01} value={edit.padding} display={`${Math.round(edit.padding * 100)}%`} onChange={(padding) => onEdit({ padding })} />
          <Slider label="Corner radius" min={0} max={0.5} step={0.01} value={edit.radius} display={`${Math.round(edit.radius * 100)}%`} onChange={(radius) => onEdit({ radius })} />
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Background</div>
            <div className="flex flex-wrap items-center gap-2">
              {SWATCHES.map((c) => (
                <button
                  key={c ?? "none"}
                  title={c ?? "Transparent"}
                  onClick={() => onEdit({ background: c })}
                  className={cx(
                    "h-8 w-8 rounded-lg border transition",
                    edit.background === c ? "ring-2 ring-blue-600 ring-offset-2" : "border-slate-300",
                    !c && checker,
                  )}
                  style={c ? { background: c } : undefined}
                />
              ))}
              <label
                title="Custom colour"
                className={cx(
                  "relative h-8 w-8 cursor-pointer overflow-hidden rounded-lg border border-slate-300",
                  edit.background === customBg && "ring-2 ring-blue-600 ring-offset-2",
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
          </div>
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900">Tint</div>
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
            <p className="mt-2 text-xs text-slate-500">Tab bar, Toolbar and Notification are always monochrome.</p>
          </div>
        </Card>

        {/* Canvas */}
        <Card className="flex flex-col p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Preview as
              <select
                value={preview?.id}
                onChange={(e) => setPreviewId(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-800"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <span className="flex items-center gap-1.5 text-xs text-slate-500">
              <Hand className="h-3.5 w-3.5" /> Drag the image to move it
            </span>
          </div>
          <div className={cx("grid flex-1 place-items-center rounded-xl bg-slate-100 p-4")}>
            <div
              className={cx(
                "relative cursor-grab touch-none overflow-hidden shadow-lg active:cursor-grabbing",
                preview?.forceTint === "#FFFFFF" ? "bg-slate-800" : checker,
                preview?.previewMask === "squircle" && "squircle",
                preview?.previewMask === "circle" && "rounded-full",
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
              <IconImage source={source} edit={edit} preset={preview} size={BOX} className="h-full w-full" />
              <div className="pointer-events-none absolute border-2 border-dashed border-orange-400/90" style={{ inset: `${safe}%` }} />
              <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-white/80 px-1.5 text-[10px] font-semibold text-orange-600">
                safe zone
              </span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>
              {edit.fit === "fit" ? "Fit" : "Fill"} · {Math.round(edit.zoom * 100)}%
            </span>
            <button onClick={() => onEdit({ offsetX: 0, offsetY: 0, zoom: 1 })} className="font-medium text-blue-600 hover:underline">
              Re-centre
            </button>
          </div>
        </Card>

        {/* Live preview */}
        <Card className="space-y-5 p-5">
          <h3 className="font-semibold text-slate-900">Live preview</h3>
          <div>
            <div className="mb-2 text-xs font-medium text-slate-500">Tab bar</div>
            <div className="flex items-end justify-around rounded-xl border border-slate-200 bg-white px-2 pb-2 pt-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  {i === 1 ? (
                    <IconImage source={source} edit={edit} preset={TAB_ACTIVE} size={26} scale={3} />
                  ) : (
                    <div className="h-[26px] w-[26px] rounded-md bg-slate-200" />
                  )}
                  <span className={cx("text-[9px] font-medium", i === 1 ? "text-blue-600" : "text-slate-400")}>
                    {["Home", "Explore", "Inbox", "Saved", "Me"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-slate-500">Phone home screen</div>
            <div className="grid grid-cols-4 gap-3 rounded-xl bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  {i === 0 ? (
                    <IconImage source={source} edit={edit} preset={APP} size={44} className="squircle shadow-md" />
                  ) : (
                    <div className="squircle h-11 w-11 bg-white/15" />
                  )}
                  <span className="text-[8px] text-white/70">{i === 0 ? "My App" : ""}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-slate-500">Browser tab</div>
            <div className="rounded-t-xl bg-slate-200 px-2 pt-2">
              <div className="flex w-52 items-center gap-2 rounded-t-lg bg-white px-3 py-2 text-xs font-medium text-slate-700">
                <IconImage source={source} edit={edit} preset={FAV} size={16} scale={2} />
                My App
                <span className="ml-auto text-slate-400">×</span>
              </div>
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-slate-500">Checks</div>
            <ul className="space-y-2">
              {warnings.map((w) => (
                <li
                  key={w.text}
                  className={cx(
                    "flex gap-2 rounded-lg px-3 py-2 text-xs leading-relaxed",
                    w.level === "info" ? "bg-slate-50 text-slate-600" : "border border-amber-200 bg-amber-50 text-amber-900",
                  )}
                >
                  {w.level === "info" ? <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  {w.text}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1">
          <Button variant="ghost" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" /> Undo
          </Button>
          <Button variant="ghost" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" /> Redo
          </Button>
          <Button
            variant="ghost"
            onClick={onReset}
            disabled={JSON.stringify(edit) === JSON.stringify(DEFAULT_EDIT)}
          >
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
