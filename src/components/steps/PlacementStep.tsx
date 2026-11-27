"use client";

import { Check, Plus, X } from "lucide-react";
import { useState } from "react";
import { CUSTOM_ID, PRESETS, customPreset, findPreset } from "@/lib/presets";
import type { EditSettings, Preset, Size, Source } from "@/lib/types";
import { IconImage } from "../IconImage";
import { Button, Card, ImageAllInTag, checker, cx } from "../ui";

export function SizeAdder({ onAdd }: { onAdd: (s: Size) => void }) {
  const [w, setW] = useState("72");
  const [h, setH] = useState("72");
  const valid = +w >= 8 && +w <= 4096 && +h >= 8 && +h <= 4096;
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onAdd({ w: Math.round(+w), h: Math.round(+h) });
      }}
    >
      <input
        aria-label="Width"
        value={w}
        onChange={(e) => setW(e.target.value.replace(/\D/g, ""))}
        className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm"
      />
      <span className="text-slate-400">×</span>
      <input
        aria-label="Height"
        value={h}
        onChange={(e) => setH(e.target.value.replace(/\D/g, ""))}
        className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm"
      />
      <Button type="submit" variant="secondary" className="px-3 py-1.5" disabled={!valid}>
        <Plus className="h-4 w-4" /> Add
      </Button>
    </form>
  );
}

export function SizeChips({ sizes, onRemove }: { sizes: Size[]; onRemove: (i: number) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s, i) => (
        <span
          key={`${s.w}x${s.h}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-white py-1 pl-3 pr-1.5 text-sm font-medium text-slate-700"
        >
          {s.w} × {s.h}
          <button
            onClick={() => onRemove(i)}
            aria-label={`Remove ${s.w} by ${s.h}`}
            className="grid h-5 w-5 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

function PresetCard({
  preset,
  selected,
  focused,
  source,
  edit,
  onClick,
}: {
  preset: Preset;
  selected: boolean;
  focused: boolean;
  source: Source;
  edit: EditSettings;
  onClick: () => void;
}) {
  const dark = preset.forceTint === "#FFFFFF";
  const custom = preset.id === CUSTOM_ID;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "group relative flex flex-col rounded-2xl border-2 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-blue-600 shadow-sm shadow-blue-600/20" : custom ? "border-dashed border-amber-300" : "border-slate-200",
        focused && "ring-4 ring-blue-100",
      )}
    >
      <span
        className={cx(
          "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-md border-2 transition",
          selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white",
        )}
      >
        {selected && <Check className="h-4 w-4" strokeWidth={3} />}
      </span>
      <div
        className={cx(
          "mb-4 grid h-16 w-16 place-items-center overflow-hidden rounded-xl",
          custom ? "bg-amber-50" : dark ? "bg-slate-800" : checker,
          preset.previewMask === "squircle" && "squircle",
          preset.previewMask === "circle" && "rounded-full",
        )}
      >
        {custom ? (
          <Plus className="h-7 w-7 text-amber-600" />
        ) : (
          <IconImage
            source={source}
            edit={edit}
            preset={preset}
            size={preset.previewMask === "none" ? 44 : 64}
          />
        )}
      </div>
      <div className="font-semibold text-slate-900">{preset.name}</div>
      <div className="mt-0.5 text-xs text-slate-500">{preset.summary}</div>
      {custom && <ImageAllInTag className="mt-3 self-start" />}
    </button>
  );
}

export function PlacementStep({
  source,
  edit,
  selected,
  onToggle,
  focused,
  onFocus,
  customSizes,
  onCustomSizes,
  fileCount,
  onBack,
  onNext,
}: {
  source: Source;
  edit: EditSettings;
  selected: string[];
  onToggle: (id: string) => void;
  focused: string;
  onFocus: (id: string) => void;
  customSizes: Size[];
  onCustomSizes: (s: Size[]) => void;
  fileCount: number;
  onBack: () => void;
  onNext: () => void;
}) {
  const all = [...PRESETS, customPreset(customSizes)];
  const fp = findPreset(focused, customSizes) ?? PRESETS[0];
  const safe = Math.round(fp.safeZone * 100);
  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Where will this icon be used?</h1>
        <p className="mt-1 text-slate-600">Pick one or more placements. Each preset knows its sizes and rules.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {all.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              selected={selected.includes(p.id)}
              focused={focused === p.id}
              source={source}
              edit={edit}
              onClick={() => {
                onFocus(p.id);
                onToggle(p.id);
              }}
            />
          ))}
        </div>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-slate-900">{fp.name} · preset details</h3>
            {fp.imageAllIn && <ImageAllInTag />}
          </div>
          <p className="mt-2 text-sm text-slate-600">{fp.description}</p>
          <dl className="mt-4 space-y-2 text-sm">
            {fp.details.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-right font-medium text-slate-800">{v}</dd>
              </div>
            ))}
          </dl>

          {fp.id === CUSTOM_ID ? (
            <div className="mt-5 space-y-3">
              <SizeChips sizes={customSizes} onRemove={(i) => onCustomSizes(customSizes.filter((_, j) => j !== i))} />
              <SizeAdder
                onAdd={(s) => {
                  if (!customSizes.some((c) => c.w === s.w && c.h === s.h)) onCustomSizes([...customSizes, s]);
                  if (!selected.includes(CUSTOM_ID)) onToggle(CUSTOM_ID);
                }}
              />
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-center">
              <div
                className={cx(
                  "relative grid h-40 w-40 place-items-center overflow-hidden",
                  fp.forceTint === "#FFFFFF" ? "bg-slate-800" : checker,
                  fp.previewMask === "squircle" && "squircle",
                  fp.previewMask === "circle" && "rounded-full",
                  fp.previewMask === "none" && "rounded-lg border border-slate-200",
                )}
              >
                <IconImage source={source} edit={edit} preset={fp} size={160} />
                <div
                  className="pointer-events-none absolute border-2 border-dashed border-orange-400"
                  style={{ inset: `${safe}%` }}
                />
              </div>
              <span className="mt-2 text-xs font-medium text-orange-600">safe zone · {safe}% margin</span>
            </div>
          )}
        </Card>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-800">
          {selected.length} placement{selected.length === 1 ? "" : "s"} selected · {fileCount} files will be generated
        </p>
        <div className="flex gap-3">
          <Button onClick={onBack} className="px-8 py-3">Back</Button>
          <Button variant="primary" className="px-8 py-3" disabled={!selected.length || fileCount === 0} onClick={onNext}>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
