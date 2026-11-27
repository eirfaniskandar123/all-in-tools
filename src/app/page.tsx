"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Header, HelpPanel } from "@/components/Header";
import { EditStep } from "@/components/steps/EditStep";
import { ExportStep } from "@/components/steps/ExportStep";
import { PlacementStep } from "@/components/steps/PlacementStep";
import { UploadStep } from "@/components/steps/UploadStep";
import { DEFAULT_EXPORT, planFiles } from "@/lib/export";
import { CUSTOM_ID, resolvePresets } from "@/lib/presets";
import { DEFAULT_EDIT } from "@/lib/render";
import type { EditSettings, ExportSettings, Size, Source } from "@/lib/types";

export default function Home() {
  const [step, setStep] = useState(0);
  const [help, setHelp] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [selected, setSelected] = useState<string[]>(["tab-bar", "favicon"]);
  const [focused, setFocused] = useState("tab-bar");
  const [customSizes, setCustomSizes] = useState<Size[]>([]);
  const [exp, setExp] = useState<ExportSettings>(DEFAULT_EXPORT);

  // Edit settings with undo/redo. Rapid changes (slider drags) are merged into one history entry.
  const [hist, setHist] = useState<{ stack: EditSettings[]; i: number }>({ stack: [DEFAULT_EDIT], i: 0 });
  const lastEdit = useRef(0);
  const edit = hist.stack[hist.i];
  const updateEdit = useCallback((patch: Partial<EditSettings>) => {
    const now = Date.now();
    const merge = now - lastEdit.current < 600;
    lastEdit.current = now;
    setHist((h) => {
      const next = { ...h.stack[h.i], ...patch };
      const keep = h.stack.slice(0, merge && h.i > 0 ? h.i : h.i + 1);
      return { stack: [...keep, next].slice(-100), i: Math.min(keep.length, 99) };
    });
  }, []);

  const presets = useMemo(() => resolvePresets(selected, customSizes), [selected, customSizes]);
  const fileCount = useMemo(() => planFiles(presets, exp, false).length, [presets, exp]);
  const maxStep = !source ? 0 : presets.length ? 3 : 1;

  const go = (s: number) => {
    setStep(Math.min(s, maxStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const setSizes = (sizes: Size[]) => {
    setCustomSizes(sizes);
    if (sizes.length && !selected.includes(CUSTOM_ID)) setSelected((s) => [...s, CUSTOM_ID]);
  };

  return (
    <div className="min-h-screen">
      <Header step={step} maxStep={maxStep} onStep={go} onHelp={() => setHelp(true)} />
      <HelpPanel open={help} onClose={() => setHelp(false)} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {step === 0 && (
          <UploadStep
            source={source}
            onSource={(s) => {
              setSource(s);
              setHist({ stack: [DEFAULT_EDIT], i: 0 });
            }}
            onNext={() => go(1)}
          />
        )}
        {step === 1 && source && (
          <PlacementStep
            source={source}
            edit={edit}
            selected={selected}
            onToggle={toggle}
            focused={focused}
            onFocus={setFocused}
            customSizes={customSizes}
            onCustomSizes={setSizes}
            fileCount={fileCount}
            onBack={() => go(0)}
            onNext={() => go(2)}
          />
        )}
        {step === 2 && source && (
          <EditStep
            source={source}
            edit={edit}
            presets={presets}
            onEdit={updateEdit}
            onReset={() => updateEdit(DEFAULT_EDIT)}
            canUndo={hist.i > 0}
            canRedo={hist.i < hist.stack.length - 1}
            onUndo={() => {
              lastEdit.current = 0;
              setHist((h) => ({ ...h, i: Math.max(0, h.i - 1) }));
            }}
            onRedo={() => {
              lastEdit.current = 0;
              setHist((h) => ({ ...h, i: Math.min(h.stack.length - 1, h.i + 1) }));
            }}
            onBack={() => go(1)}
            onNext={() => go(3)}
          />
        )}
        {step === 3 && source && (
          <ExportStep
            source={source}
            edit={edit}
            presets={presets}
            exp={exp}
            onExp={(p) => setExp((e) => ({ ...e, ...p }))}
            customSizes={customSizes}
            onCustomSizes={setSizes}
            onBack={() => go(2)}
          />
        )}
      </main>
      <footer className="mx-auto max-w-7xl px-6 pb-10 pt-4 text-center text-xs text-slate-400">
        Icon Refactor · All-in Tools · Runs entirely in your browser. Images are never uploaded.
      </footer>
    </div>
  );
}
