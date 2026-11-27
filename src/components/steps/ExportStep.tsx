"use client";

import { ArrowRight, Check, Copy, Download, FolderTree, Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supportsAvif } from "@/lib/encode";
import { buildSnippets, buildZip, generateFiles, planFiles } from "@/lib/export";
import { formatBytes } from "@/lib/render";
import type { EditSettings, ExportSettings, Format, GeneratedFile, Preset, Size, Source } from "@/lib/types";
import { Button, Card, Checkbox, ImageAllInTag, SectionTitle, Slider, checker, cx } from "../ui";
import { SizeAdder, SizeChips } from "./PlacementStep";

const FORMATS: { id: Format; label: string }[] = [
  { id: "png", label: "PNG" },
  { id: "webp", label: "WebP" },
  { id: "svg", label: "SVG" },
  { id: "ico", label: "ICO" },
  { id: "avif", label: "AVIF" },
];

type Tab = "html" | "android" | "ios";

export function ExportStep({
  source,
  edit,
  presets,
  exp,
  onExp,
  customSizes,
  onCustomSizes,
  onBack,
}: {
  source: Source;
  edit: EditSettings;
  presets: Preset[];
  exp: ExportSettings;
  onExp: (patch: Partial<ExportSettings>) => void;
  customSizes: Size[];
  onCustomSizes: (s: Size[]) => void;
  onBack: () => void;
}) {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [busy, setBusy] = useState(true);
  const [zipping, setZipping] = useState(false);
  const [avifOk, setAvifOk] = useState(false);
  const [tab, setTab] = useState<Tab>("html");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supportsAvif().then(setAvifOk);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const avif = await supportsAvif();
        const plan = planFiles(presets, exp, avif);
        const out = await generateFiles(source, plan, presets, edit, exp, () => cancelled);
        if (!cancelled) {
          setFiles(out);
          setError(null);
          setBusy(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Export failed");
          setBusy(false);
        }
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [source, presets, edit, exp]);

  const urls = useMemo(() => new Map(files.map((f) => [f.key, URL.createObjectURL(f.blob)])), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const snippets = useMemo(() => buildSnippets(files), [files]);
  const total = files.reduce((a, f) => a + f.bytes, 0);
  const saved = !source.isSvg && source.bytes > total ? 1 - total / source.bytes : 0;
  const webpVsPng = useMemo(() => {
    const png = new Map(files.filter((f) => f.format === "png").map((f) => [`${f.presetId}|${f.w}x${f.h}`, f.bytes]));
    let a = 0;
    let b = 0;
    for (const f of files) {
      const p = f.format === "webp" ? png.get(`${f.presetId}|${f.w}x${f.h}`) : undefined;
      if (p !== undefined) {
        a += p;
        b += f.bytes;
      }
    }
    return a > 0 ? 1 - b / a : null;
  }, [files]);
  const over = files.filter((f) => f.overBudget).length;
  const folders = [...new Set(files.map((f) => f.path.split("/")[0] + "/"))];

  const code =
    tab === "html"
      ? snippets.html ?? "<!-- Select the Favicon placement to get HTML link tags -->"
      : tab === "android"
        ? snippets.android ?? "<!-- Select an Android placement to get the manifest snippet -->"
        : snippets.ios ?? "// Select an iOS placement to get Contents.json";

  async function download() {
    setZipping(true);
    try {
      const blob = await buildZip(files, snippets);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${source.name.replace(/\.[^.]+$/, "") || "icons"}-icons.zip`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Export your icons</h1>
          <p className="mt-1 text-slate-600">
            {busy ? "Generating…" : `${files.length} files across ${presets.length} placement${presets.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Button variant="primary" className="px-6 py-3" disabled={busy || zipping || !files.length} onClick={download}>
          {zipping || busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          Download ZIP
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="min-w-0 space-y-5">
          <Card className="overflow-hidden">
            <div className="max-h-[430px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">File name</th>
                    <th className="px-4 py-3 font-semibold">Size</th>
                    <th className="px-4 py-3 font-semibold">Format</th>
                    <th className="px-4 py-3 text-right font-semibold">File size</th>
                  </tr>
                </thead>
                <tbody className={cx("divide-y divide-slate-100 transition", busy && "opacity-50")}>
                  {files.map((f) => (
                    <tr key={f.key} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <div className={cx("grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-md border border-slate-200", f.presetId === "notification" ? "bg-slate-800" : checker)}>
                            {f.format !== "ico" ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={urls.get(f.key)} alt="" className="max-h-6 max-w-6 object-contain" />
                            ) : (
                              <span className="text-[9px] font-bold text-slate-500">ICO</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-slate-900">{f.name}</div>
                            <div className="truncate text-xs text-slate-400">{f.path.slice(0, f.path.length - f.name.length)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-700">
                        {f.format === "ico" ? "16 / 32 / 48" : f.format === "svg" ? "vector" : `${f.w} × ${f.h}`}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase text-slate-700">{f.format}</span>
                      </td>
                      <td
                        className={cx("whitespace-nowrap px-4 py-2.5 text-right tabular-nums", f.overBudget ? "font-semibold text-red-600" : "text-slate-700")}
                        title={f.overBudget ? "Over the target size" : f.qualityUsed ? `Quality ${Math.round(f.qualityUsed * 100)}%` : undefined}
                      >
                        {formatBytes(f.bytes)}
                      </td>
                    </tr>
                  ))}
                  {!files.length && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-slate-400">
                        <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" /> Generating icons…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex flex-wrap items-center gap-2 text-base font-semibold text-slate-900">
              {saved > 0 ? (
                <>
                  <span className="text-slate-500">Before</span> {formatBytes(source.bytes)}
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-500">After</span> {formatBytes(total)}
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm text-emerald-700">{Math.round(saved * 100)}% saved</span>
                </>
              ) : (
                <>
                  <span className="text-slate-500">Total</span> {formatBytes(total)}
                  <span className="text-sm font-medium text-slate-500">· {files.length} files</span>
                </>
              )}
              {webpVsPng !== null && webpVsPng > 0 && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-sm text-emerald-700">
                  WebP is {Math.round(webpVsPng * 100)}% smaller than PNG
                </span>
              )}
              {over > 0 && <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-sm text-red-700">{over} over target</span>}
            </div>
            <ImageAllInTag />
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5">
              <div className="flex gap-1">
                {(
                  [
                    ["html", "HTML"],
                    ["android", "Android XML"],
                    ["ios", "iOS Contents.json"],
                  ] as [Tab, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={cx(
                      "rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                      tab === id ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-white",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                className="px-3 py-1.5"
                onClick={async () => {
                  await navigator.clipboard.writeText(code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <pre className="max-h-64 overflow-auto bg-slate-900 p-4 text-[13px] leading-relaxed text-slate-100">
              <code>{code}</code>
            </pre>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="divide-y divide-slate-100">
            <div className="p-5">
              <SectionTitle aside={<ImageAllInTag />}>Formats</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {FORMATS.map((f) => (
                  <Checkbox
                    key={f.id}
                    label={f.label}
                    checked={exp.formats[f.id] && (f.id !== "avif" || avifOk)}
                    disabled={f.id === "avif" && !avifOk}
                    title={f.id === "avif" && !avifOk ? "This browser can't encode AVIF yet (a WebAssembly encoder is on the roadmap)." : undefined}
                    onChange={(v) => onExp({ formats: { ...exp.formats, [f.id]: v } })}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Each placement only uses the formats its platform supports (iOS app icons are always PNG).
              </p>
            </div>

            <div className="space-y-4 p-5">
              <SectionTitle aside={<ImageAllInTag />}>Compression</SectionTitle>
              <Slider label="Quality" min={0.4} max={1} step={0.01} value={exp.quality} display={`${Math.round(exp.quality * 100)}%`} onChange={(quality) => onExp({ quality })} />
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2 font-medium text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-600"
                    checked={exp.targetKB !== null}
                    onChange={(e) => onExp({ targetKB: e.target.checked ? 50 : null })}
                  />
                  Target max size
                </label>
                <input
                  type="number"
                  min={1}
                  value={exp.targetKB ?? ""}
                  disabled={exp.targetKB === null}
                  onChange={(e) => onExp({ targetKB: Math.max(1, Number(e.target.value) || 1) })}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-center disabled:bg-slate-50 disabled:text-slate-400"
                />
                <span className="text-slate-500">KB per file</span>
              </div>
              <p className="text-xs text-slate-500">WebP and AVIF lower their quality until they fit. PNG is lossless, so oversized PNGs are flagged in red.</p>
            </div>

            <div className="space-y-3 p-5">
              <SectionTitle aside={<ImageAllInTag />}>Extra sizes</SectionTitle>
              <SizeChips sizes={customSizes} onRemove={(i) => onCustomSizes(customSizes.filter((_, j) => j !== i))} />
              <SizeAdder
                onAdd={(s) => {
                  if (!customSizes.some((c) => c.w === s.w && c.h === s.h)) onCustomSizes([...customSizes, s]);
                }}
              />
            </div>

            <div className="space-y-2 p-5">
              <SectionTitle>File naming</SectionTitle>
              <input
                value={exp.pattern}
                onChange={(e) => onExp({ pattern: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm"
                spellCheck={false}
              />
              <p className="text-xs text-slate-500">
                Tokens: <code>{"{name}"}</code> <code>{"{placement}"}</code> <code>{"{size}"}</code> <code>{"{scale}"}</code>{" "}
                <code>{"{format}"}</code>. <code>{"{name}"}</code> keeps each platform&apos;s standard names.
              </p>
              <p className="flex items-center gap-1.5 pt-1 text-xs text-slate-600">
                <FolderTree className="h-3.5 w-3.5" /> ZIP has one folder per platform: {folders.join(", ") || "—"}
              </p>
            </div>
          </Card>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <div className="flex gap-3">
            <Button onClick={onBack} className="px-6 py-3">Back</Button>
            <Button variant="primary" className="flex-1 py-3 text-base" disabled={busy || zipping || !files.length} onClick={download}>
              {zipping || busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
              Download ZIP
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
