"use client";

import { AlertTriangle, CheckCircle2, ImageIcon, Sparkles, UploadCloud, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatBytes, loadSource } from "@/lib/render";
import type { Source } from "@/lib/types";
import { Button, Card, checker, cx } from "../ui";

const ACCEPT = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
const MAX_BYTES = 15 * 1024 * 1024;
const RECENT_KEY = "icon-refactor:recent";

interface Recent {
  name: string;
  type: string;
  dataUrl: string;
}

function readRecent(): Recent[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]") as Recent[];
  } catch {
    return [];
  }
}

function saveRecent(r: Recent) {
  try {
    const list = [r, ...readRecent().filter((x) => x.name !== r.name)].slice(0, 5);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked: recent files are optional */
  }
}

export function validate(src: Source): { level: "ok" | "warn" | "error"; text: string } {
  const min = Math.min(src.width, src.height);
  if (src.isSvg) return { level: "ok", text: "Vector image: every size will be perfectly sharp." };
  if (min < 64) return { level: "error", text: `${src.name} is ${src.width} × ${src.height} px, too small to make icons from. Upload at least 512 px, or use the SVG version.` };
  if (min < 512)
    return {
      level: "warn",
      text: `${src.name} is ${src.width} × ${src.height} px, too small for app icons. Tip: upload at least 512 px, or use the SVG version.`,
    };
  if (Math.abs(src.width - src.height) / Math.max(src.width, src.height) > 0.2)
    return { level: "warn", text: "This image isn't square. You can crop and position it in the Edit step." };
  return { level: "ok", text: `Great: ${src.width} × ${src.height} px is big enough for every placement.` };
}

export function UploadStep({
  source,
  onSource,
  onNext,
}: {
  source: Source | null;
  onSource: (s: Source) => void;
  onNext: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [recent, setRecent] = useState<Recent[]>([]);

  useEffect(() => setRecent(readRecent()), []);

  async function handle(file: Blob, name: string, remember = true) {
    setError(null);
    const type = file.type || (/\.svg$/i.test(name) ? "image/svg+xml" : "");
    if (!ACCEPT.includes(type)) {
      setError(`${name} isn't a supported image. Use PNG, JPG, SVG or WebP.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`${name} is ${formatBytes(file.size)}. The limit is 15 MB.`);
      return;
    }
    setBusy(true);
    try {
      const src = await loadSource(file, name);
      onSource(src);
      if (remember && file.size < 1.5 * 1024 * 1024) {
        saveRecent({ name, type: src.type, dataUrl: src.dataUrl });
        setRecent(readRecent());
      }
    } catch {
      setError(`Couldn't read ${name}. The file may be damaged.`);
    } finally {
      setBusy(false);
    }
  }

  async function loadSample() {
    const res = await fetch("/samples/sample-logo.svg");
    await handle(await res.blob(), "sample-logo.svg", false);
  }

  async function loadRecent(r: Recent) {
    const blob = await (await fetch(r.dataUrl)).blob();
    await handle(new Blob([blob], { type: r.type }), r.name, false);
  }

  const v = source ? validate(source) : null;

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Upload your image</h1>
        <p className="mt-1 text-slate-600">One image in, icons for every placement out.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const f = e.dataTransfer.files[0];
            if (f) handle(f, f.name);
          }}
          className={cx(
            "relative flex min-h-[360px] flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition",
            drag ? "border-blue-500 bg-blue-50" : "border-slate-300 bg-white hover:border-slate-400",
          )}
        >
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-600">
            <UploadCloud className="h-10 w-10" />
          </div>
          <p className="text-xl font-semibold text-slate-900">Drag and drop an image here</p>
          <p className="my-3 text-sm text-slate-500">or</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="primary" onClick={() => input.current?.click()} disabled={busy}>
              <ImageIcon className="h-4 w-4" /> Browse files
            </Button>
            <Button variant="ghost" onClick={loadSample} disabled={busy}>
              <Sparkles className="h-4 w-4" /> Try a sample logo
            </Button>
          </div>
          <p className="mt-5 text-sm text-slate-500">PNG · JPG · SVG · WebP · at least 512 × 512 px</p>
          <p className="mt-2 text-xs text-slate-400">
            Only use images you have the rights to. By using this tool you agree to the{" "}
            <Link href="/terms" className="underline hover:text-slate-600">Terms of Use</Link>.
          </p>
          <input
            ref={input}
            type="file"
            accept={ACCEPT.join(",") + ",.svg"}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handle(f, f.name);
              e.target.value = "";
            }}
          />
          {busy && <div className="absolute inset-0 grid place-items-center rounded-3xl bg-white/70 text-sm font-medium">Reading image…</div>}
        </div>

        <Card className="flex flex-col p-5">
          <h3 className="text-sm font-semibold text-slate-900">Your image</h3>
          {source ? (
            <div className="mt-4 flex flex-1 flex-col">
              <div className={cx("grid aspect-square place-items-center overflow-hidden rounded-xl border border-slate-200", checker)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={source.dataUrl} alt={source.name} className="max-h-[85%] max-w-[85%] object-contain" />
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-sm">
                <dt className="text-slate-500">File</dt>
                <dd className="truncate text-right font-medium text-slate-800" title={source.name}>{source.name}</dd>
                <dt className="text-slate-500">Size</dt>
                <dd className="text-right font-medium text-slate-800">{source.isSvg ? "Vector" : `${source.width} × ${source.height} px`}</dd>
                <dt className="text-slate-500">File size</dt>
                <dd className="text-right font-medium text-slate-800">{formatBytes(source.bytes)}</dd>
              </dl>
            </div>
          ) : (
            <div className="mt-4 grid flex-1 place-items-center rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Nothing uploaded yet
            </div>
          )}
        </Card>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {v && !error && (
        <div
          className={cx(
            "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm",
            v.level === "ok" && "border-emerald-200 bg-emerald-50 text-emerald-800",
            v.level === "warn" && "border-red-200 bg-red-50 text-red-800",
            v.level === "error" && "border-red-300 bg-red-100 text-red-900",
          )}
        >
          {v.level === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
          {v.text}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Recent files</h3>
          <div className="flex gap-3">
            {recent.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 w-20 rounded-xl border border-dashed border-slate-200 bg-white" />
              ))}
            {recent.map((r) => (
              <button
                key={r.name}
                title={r.name}
                onClick={() => loadRecent(r)}
                className={cx("grid h-20 w-20 place-items-center overflow-hidden rounded-xl border border-slate-200 transition hover:border-blue-400 hover:shadow", checker)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.dataUrl} alt={r.name} className="max-h-[80%] max-w-[80%] object-contain" />
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!source && <span className="text-sm text-slate-500">Enabled once the image is valid</span>}
          <Button variant="primary" className="px-8 py-3" disabled={!source || v?.level === "error"} onClick={onNext}>
            Next →
          </Button>
        </div>
      </div>
    </div>
  );
}
