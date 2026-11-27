"use client";

import { Check, FileType, FolderOpen, Info, Plus, Ruler, X } from "lucide-react";
import { FormatBadges, MaskGlyph, PlatformBadge, SafeZoneGlyph, Swatch, Thumb } from "../preset-ui";
import { useState } from "react";
import { planFiles } from "@/lib/export";
import { CUSTOM_ID, PRESETS, customPreset, findPreset, presetSpecs } from "@/lib/presets";
import { extractArtwork } from "@/lib/render";
import type { EditSettings, ExportSettings, Preset, Size, Source } from "@/lib/types";
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

function SpecRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="flex items-center gap-1.5 whitespace-nowrap text-slate-500">
        <span className="grid w-4 place-items-center">{icon}</span>
        {label}
      </dt>
      <dd className="flex min-w-0 items-center gap-1.5 font-medium text-slate-800">{children}</dd>
    </>
  );
}

function PresetCard({
  preset,
  selected,
  focused,
  files,
  source,
  edit,
  onClick,
}: {
  preset: Preset;
  selected: boolean;
  focused: boolean;
  files: number;
  source: Source;
  edit: EditSettings;
  onClick: () => void;
}) {
  const custom = preset.id === CUSTOM_ID;
  const spec = presetSpecs(preset);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cx(
        "group flex flex-col rounded-2xl border-2 text-left transition hover:-translate-y-0.5 hover:shadow-md",
        selected ? "border-blue-600 bg-blue-50/40 shadow-sm shadow-blue-600/20" : custom ? "border-dashed border-amber-300 bg-white" : "border-slate-200 bg-white",
        focused && "ring-4 ring-blue-100",
      )}
    >
      <div className="flex items-start gap-3 p-4 pb-3">
        <Thumb preset={preset} source={source} edit={edit} size={52} />
        <div className="min-w-0 flex-1">
          <div className="font-semibold leading-snug text-slate-900">{preset.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <PlatformBadge platform={preset.platform} />
            {custom ? <ImageAllInTag /> : <span className="text-xs text-slate-500">{files} files</span>}
          </div>
        </div>
        <span
          className={cx(
            "grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 transition",
            selected ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 bg-white group-hover:border-slate-400",
          )}
        >
          {selected && <Check className="h-4 w-4" strokeWidth={3} />}
        </span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 border-t border-slate-100 px-4 py-3 text-xs">
        <SpecRow icon={<Ruler className="h-3.5 w-3.5" />} label="Sizes">
          <span className="truncate tabular-nums">{spec.sizesShort}</span>
        </SpecRow>
        <SpecRow icon={<SafeZoneGlyph pct={spec.safeZonePct} />} label="Safe zone">
          {spec.safeZonePct}% margin
        </SpecRow>
        <SpecRow icon={<MaskGlyph p={preset} />} label="Mask">
          <span className="truncate">{spec.mask}</span>
        </SpecRow>
        <SpecRow icon={<Swatch color={spec.colour.swatch} />} label="Colour">
          <span className="truncate">{spec.colour.label}</span>
        </SpecRow>
        <SpecRow icon={<FileType className="h-3.5 w-3.5" />} label="Formats">
          <FormatBadges formats={spec.formats} />
        </SpecRow>
      </dl>
    </button>
  );
}

function DetailSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-100 py-3.5">
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {icon}
        {title}
      </h4>
      <div className="text-sm text-slate-800">{children}</div>
    </section>
  );
}

export function PlacementStep({
  source,
  edit,
  exp,
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
  exp: ExportSettings;
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
  const spec = presetSpecs(fp);
  const filesOf = (p: Preset) => planFiles([p], exp, false).length;
  const art = selected.some((id) => PRESETS.find((p) => p.id === id)?.forceTint) ? extractArtwork(source) : null;

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Where will this icon be used?</h1>
        <p className="mt-1 text-slate-600">
          Pick one or more placements. Each card shows its sizes, safe zone, mask, colour rule and formats. Click a card
          to select it and see full details on the right.
        </p>
      </div>

      {art && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Your image has a solid background
            <span className="mx-1 inline-block h-3 w-3 translate-y-0.5 rounded-sm border border-blue-300" style={{ background: art.background }} />
            {art.background}. Monochrome placements (Tab bar, Toolbar, Notification) automatically use only the artwork.
          </span>
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {all.map((p) => (
            <PresetCard
              key={p.id}
              preset={p}
              selected={selected.includes(p.id)}
              focused={focused === p.id}
              files={filesOf(p)}
              source={source}
              edit={edit}
              onClick={() => {
                onFocus(p.id);
                onToggle(p.id);
              }}
            />
          ))}
        </div>

        <Card className="p-5 lg:sticky lg:top-24">
          <div className="flex items-start gap-3">
            <Thumb preset={fp} source={source} edit={edit} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{fp.name}</h3>
                <PlatformBadge platform={fp.platform} />
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{fp.description}</p>
            </div>
          </div>
          {fp.imageAllIn && <ImageAllInTag className="mt-3" />}

          {fp.id !== CUSTOM_ID && (
            <div className="mt-4 flex items-center gap-4 rounded-xl bg-slate-50 p-3">
              <div
                className={cx(
                  "relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden",
                  fp.forceTint === "#FFFFFF" ? "bg-slate-800" : checker,
                  fp.previewMask === "squircle" && "squircle",
                  fp.previewMask === "circle" && "rounded-full",
                  fp.previewMask === "none" && "rounded-lg border border-slate-200",
                )}
              >
                <IconImage source={source} edit={edit} preset={fp} size={112} />
                <div className="pointer-events-none absolute border-2 border-dashed border-orange-400" style={{ inset: `${spec.safeZonePct}%` }} />
              </div>
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-orange-600">Dashed line = safe zone.</span> Keep important artwork
                inside it ({spec.safeZonePct}% margin). The outer shape shows the mask.
              </p>
            </div>
          )}

          <div className="mt-2">
            <DetailSection icon={<Ruler className="h-3.5 w-3.5" />} title={`Sizes (${fp.sizes.length})`}>
              {fp.id === CUSTOM_ID ? (
                <div className="space-y-3">
                  {customSizes.length === 0 && <p className="text-sm text-slate-500">No sizes yet. Add any width × height.</p>}
                  <SizeChips sizes={customSizes} onRemove={(i) => onCustomSizes(customSizes.filter((_, j) => j !== i))} />
                  <SizeAdder
                    onAdd={(s) => {
                      if (!customSizes.some((c) => c.w === s.w && c.h === s.h)) onCustomSizes([...customSizes, s]);
                      if (!selected.includes(CUSTOM_ID)) onToggle(CUSTOM_ID);
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {spec.sizes.map((z, i) => (
                    <span key={i} className="inline-flex items-baseline gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs">
                      <span className="font-semibold tabular-nums text-slate-900">{z.px}</span>
                      {z.note && <span className="text-slate-500">{z.note}</span>}
                    </span>
                  ))}
                  {fp.ico && (
                    <span className="inline-flex items-baseline gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs">
                      <span className="font-semibold text-slate-900">ICO</span>
                      <span className="text-slate-500">{fp.ico.sizes.join(" / ")}</span>
                    </span>
                  )}
                </div>
              )}
            </DetailSection>
            <div className="grid grid-cols-2 gap-x-4">
              <DetailSection icon={<SafeZoneGlyph pct={spec.safeZonePct} size={13} />} title="Safe zone">
                {spec.safeZonePct}% margin
              </DetailSection>
              <DetailSection icon={<MaskGlyph p={fp} />} title="Mask">
                {spec.mask}
              </DetailSection>
              <DetailSection icon={<Swatch color={spec.colour.swatch} />} title="Colour">
                {spec.colour.label}
              </DetailSection>
              <DetailSection icon={<FileType className="h-3.5 w-3.5" />} title="Formats">
                <FormatBadges formats={spec.formats} />
              </DetailSection>
            </div>
            {spec.folders.length > 0 && (
              <DetailSection icon={<FolderOpen className="h-3.5 w-3.5" />} title="Saved in ZIP at">
                <div className="space-y-1">
                  {spec.folders.slice(0, 3).map((f) => (
                    <code key={f} className="block truncate rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700">
                      {f}
                    </code>
                  ))}
                  {spec.folders.length > 3 && <span className="text-xs text-slate-500">+ {spec.folders.length - 3} more folders</span>}
                </div>
              </DetailSection>
            )}
          </div>
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
