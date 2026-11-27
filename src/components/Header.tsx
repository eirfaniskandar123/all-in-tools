"use client";

import { Check, CircleHelp, Shapes } from "lucide-react";
import { cx } from "./ui";

export const STEPS = ["Upload", "Placement", "Edit", "Export"];

export function Header({
  step,
  maxStep,
  onStep,
  onHelp,
}: {
  step: number;
  maxStep: number;
  onStep: (s: number) => void;
  onHelp: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
            <Shapes className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-bold text-slate-900">Icon Refactor</div>
            <div className="hidden text-[11px] text-slate-500 sm:block">by All-in Tools</div>
          </div>
        </div>

        <nav className="mx-auto flex items-center gap-1 sm:gap-2" aria-label="Steps">
          {STEPS.map((label, i) => {
            const active = i === step;
            const done = i < step;
            const enabled = i <= maxStep;
            return (
              <div key={label} className="flex items-center gap-1 sm:gap-2">
                {i > 0 && <span className="hidden h-px w-6 bg-slate-300 md:block" />}
                <button
                  type="button"
                  disabled={!enabled}
                  onClick={() => onStep(i)}
                  aria-current={active ? "step" : undefined}
                  className={cx(
                    "flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium transition sm:px-3",
                    active && "bg-blue-600 text-white shadow-sm shadow-blue-600/30",
                    !active && enabled && "text-slate-700 hover:bg-slate-100",
                    !enabled && "cursor-not-allowed text-slate-400",
                  )}
                >
                  <span
                    className={cx(
                      "grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold",
                      active ? "bg-white/25" : done ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600",
                    )}
                  >
                    {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onHelp}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          <CircleHelp className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </button>
      </div>
    </header>
  );
}

export function HelpPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const items = [
    ["1 · Upload", "Drop a PNG, JPG, SVG or WebP. SVG or 512 px+ works best."],
    ["2 · Placement", "Pick where the icon is used. Each preset knows its sizes, safe zone and rules."],
    ["3 · Edit", "Crop, zoom, pad and tint. Drag the image to move it. Previews and warnings update live."],
    ["4 · Export", "Choose formats, compression and extra sizes, then download one ZIP with code snippets."],
  ];
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" onClick={onClose}>
      <aside
        className="fade-in h-full w-full max-w-sm overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">How it works</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>
        <ol className="space-y-4">
          {items.map(([t, d]) => (
            <li key={t}>
              <div className="font-semibold text-slate-900">{t}</div>
              <p className="text-sm text-slate-600">{d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
          Features tagged <b>from Image All-in</b> (format convert, compression, custom sizes) come from the Image
          All-in proposal and are built into this tool.
        </div>
        <p className="mt-6 text-xs text-slate-500">
          Everything runs in your browser. Your images are never uploaded to a server.
        </p>
      </aside>
    </div>
  );
}
