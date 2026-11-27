"use client";

import { AlertTriangle, CheckCircle2, ChevronDown, Info, Wand2 } from "lucide-react";
import type { EditSettings, Warning } from "@/lib/types";
import { Card, cx } from "../ui";

function Item({ w, onEdit }: { w: Warning; onEdit: (patch: Partial<EditSettings>) => void }) {
  const warn = w.level === "warn" || w.level === "error";
  return (
    <li
      className={cx(
        "flex gap-3 rounded-xl border p-3.5",
        warn ? "border-amber-200 bg-amber-50" : "border-blue-100 bg-blue-50/60",
      )}
    >
      {warn ? (
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
      ) : (
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
      )}
      <div className="min-w-0 flex-1">
        <div className={cx("text-sm font-semibold", warn ? "text-amber-900" : "text-blue-900")}>{w.title}</div>
        <p className={cx("mt-0.5 text-sm leading-relaxed", warn ? "text-amber-800" : "text-blue-800")}>{w.text}</p>
        {(w.presets?.length || w.action) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {w.presets?.map((p) => (
              <span key={p} className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-700">
                {p}
              </span>
            ))}
            {w.action && (
              <button
                onClick={() => onEdit(w.action!.patch)}
                className={cx(
                  "ml-auto inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-white shadow-sm",
                  warn ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700",
                )}
              >
                <Wand2 className="h-3.5 w-3.5" />
                {w.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

export function ChecksPanel({ warnings, onEdit }: { warnings: Warning[]; onEdit: (patch: Partial<EditSettings>) => void }) {
  const warn = warnings.filter((w) => w.level === "warn" || w.level === "error");
  const info = warnings.filter((w) => w.level === "info");
  const ok = warnings.filter((w) => w.level === "ok");
  const plural = (n: number, s: string) => `${n} ${s}${n === 1 ? "" : "s"}`;

  return (
    <Card className="p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Checks</h3>
        <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
          {warn.length > 0 && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-800">{plural(warn.length, "warning")}</span>}
          {info.length > 0 && <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-800">{plural(info.length, "note")}</span>}
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-800">{ok.length} passed</span>
        </div>
      </div>

      {warn.length + info.length > 0 && (
        <ul className="mb-3 space-y-2">
          {[...warn, ...info].map((w) => (
            <Item key={w.id} w={w} onEdit={onEdit} />
          ))}
        </ul>
      )}

      {ok.length > 0 && (
        <details className="group rounded-xl border border-emerald-200 bg-emerald-50/60" open={warn.length === 0}>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3.5 py-2.5 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            {plural(ok.length, "check")} passed
            <ChevronDown className="ml-auto h-4 w-4 transition group-open:rotate-180" />
          </summary>
          <ul className="space-y-2 px-3.5 pb-3">
            {ok.map((w) => (
              <li key={w.id} className="flex gap-2 text-sm">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span>
                  <span className="font-medium text-slate-800">{w.title}</span>
                  <span className="text-slate-500"> · {w.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
