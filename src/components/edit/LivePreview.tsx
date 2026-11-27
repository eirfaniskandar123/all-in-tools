"use client";

import { Bell, Bookmark, Lock, Share2, Star, Wifi } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { CUSTOM_ID } from "@/lib/presets";
import type { EditSettings, Preset, Source } from "@/lib/types";
import { IconImage } from "../IconImage";
import { PlatformBadge } from "../preset-ui";
import { Card, cx } from "../ui";

type MockProps = { p: Preset; source: Source; edit: EditSettings };

function TabBarMock({ p, source, edit }: MockProps) {
  // iOS tints template icons: blue when selected (light) and system blue in dark mode.
  const light = useMemo<Preset>(() => ({ ...p, forceTint: "#007AFF", tintLocked: true }), [p]);
  const dark = useMemo<Preset>(() => ({ ...p, forceTint: "#0A84FF", tintLocked: true }), [p]);
  const bar = (variant: Preset, isDark: boolean) => (
    <div className={cx("flex items-end justify-around rounded-xl px-2 pb-1.5 pt-2.5", isDark ? "bg-zinc-900" : "border border-slate-200 bg-white")}>
      {["Home", "Explore", "Inbox", "Me"].map((label, i) => (
        <div key={label} className="flex flex-col items-center gap-1">
          {i === 1 ? (
            <IconImage source={source} edit={edit} preset={variant} size={24} scale={3} />
          ) : (
            <div className={cx("h-6 w-6 rounded-md", isDark ? "bg-zinc-700" : "bg-slate-200")} />
          )}
          <span className={cx("text-[9px] font-medium", i === 1 ? (isDark ? "text-[#0A84FF]" : "text-[#007AFF]") : "text-slate-400")}>{label}</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="space-y-2">
      {bar(light, false)}
      {bar(dark, true)}
    </div>
  );
}

function IosHomeMock({ p, source, edit }: MockProps) {
  return (
    <div className="grid grid-cols-4 gap-3 rounded-xl bg-gradient-to-br from-slate-800 via-indigo-950 to-slate-900 p-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          {i === 0 ? <IconImage source={source} edit={edit} preset={p} size={44} className="squircle shadow-md" /> : <div className="squircle h-11 w-11 bg-white/15" />}
          <span className="h-2 text-[8px] text-white/80">{i === 0 ? "My App" : ""}</span>
        </div>
      ))}
    </div>
  );
}

function AndroidMock({ p, source, edit }: MockProps) {
  return (
    <div className="rounded-xl bg-gradient-to-b from-teal-800 to-slate-900 p-4">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            {i === 0 ? (
              <IconImage source={source} edit={edit} preset={p} size={44} className="rounded-full shadow-md" />
            ) : (
              <div className="h-11 w-11 rounded-full bg-white/20" />
            )}
            <span className="h-2 text-[8px] text-white/80">{i === 0 ? "My App" : ""}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-8 rounded-full bg-white/15" />
    </div>
  );
}

function BrowserMock({ p, source, edit }: MockProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="flex items-end gap-1 bg-slate-200 px-2 pt-2">
        <div className="flex w-44 items-center gap-2 rounded-t-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
          <IconImage source={source} edit={edit} preset={p} size={16} />
          <span className="truncate">My App</span>
          <span className="ml-auto text-slate-400">×</span>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white px-3 py-1.5 text-[11px] text-slate-500">
        <Lock className="h-3 w-3" /> myapp.com
        <Star className="ml-auto h-3 w-3" />
      </div>
      <div className="flex items-center gap-1.5 border-t border-slate-100 bg-white px-3 py-1.5 text-[11px] text-slate-600">
        <Bookmark className="h-3 w-3 text-slate-400" />
        <IconImage source={source} edit={edit} preset={p} size={14} />
        My App
      </div>
    </div>
  );
}

function ToolbarMock({ p, source, edit }: MockProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-800">
        <IconImage source={source} edit={edit} preset={p} size={18} scale={3} /> My action
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-slate-500">
        <Share2 className="h-4 w-4" /> Share
      </span>
      <span className="ml-auto grid h-8 w-8 place-items-center rounded-lg border border-slate-200">
        <IconImage source={source} edit={edit} preset={p} size={16} scale={3} />
      </span>
    </div>
  );
}

function NotificationMock({ p, source, edit }: MockProps) {
  return (
    <div className="overflow-hidden rounded-xl bg-slate-900">
      <div className="flex items-center gap-2 px-3 py-1.5 text-[11px] font-medium text-white">
        9:41
        <IconImage source={source} edit={edit} preset={p} size={14} scale={3} />
        <Bell className="h-3 w-3 text-white/60" />
        <Wifi className="ml-auto h-3 w-3" />
      </div>
      <div className="m-2 mt-0 rounded-lg bg-slate-800 p-2.5">
        <div className="flex items-center gap-1.5 text-[10px] text-white/70">
          <IconImage source={source} edit={edit} preset={p} size={14} scale={3} /> My App · now
        </div>
        <div className="mt-1 text-xs font-medium text-white">You have a new message</div>
      </div>
    </div>
  );
}

function AvatarMock({ p, source, edit }: MockProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <IconImage source={source} edit={edit} preset={p} size={40} />
      <div className="min-w-0">
        <div className="text-xs font-semibold text-slate-900">
          My App <span className="font-normal text-slate-400">· 2m</span>
        </div>
        <div className="mt-1 rounded-lg rounded-tl-none bg-slate-100 px-2.5 py-1.5 text-xs text-slate-700">Looks great on every screen!</div>
      </div>
    </div>
  );
}

function CustomMock({ p, source, edit }: MockProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-amber-300 bg-amber-50/40 p-3">
      {p.sizes.map((z) => {
        const k = Math.min(1, 64 / Math.max(z.w, z.h));
        return (
          <div key={`${z.w}x${z.h}`} className="flex flex-col items-center gap-1">
            <IconImage source={source} edit={edit} preset={p} size={Math.round(z.w * k)} height={Math.round(z.h * k)} className="rounded border border-slate-200 bg-white" />
            <span className="text-[10px] font-medium tabular-nums text-slate-600">
              {z.w}×{z.h}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const MOCKS: Record<string, (props: MockProps) => ReactNode> = {
  "tab-bar": TabBarMock,
  "ios-app": IosHomeMock,
  "android-app": AndroidMock,
  favicon: BrowserMock,
  toolbar: ToolbarMock,
  notification: NotificationMock,
  avatar: AvatarMock,
  [CUSTOM_ID]: CustomMock,
};

export function LivePreview({
  source,
  edit,
  presets,
  activeId,
  onPick,
  onBack,
}: {
  source: Source;
  edit: EditSettings;
  presets: Preset[];
  activeId?: string;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold text-slate-900">Live preview</h3>
      <p className="mt-0.5 text-xs text-slate-500">Your selected placements in context. Click one to edit it in the big preview.</p>
      {presets.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No placements selected.{" "}
          <button onClick={onBack} className="font-medium text-blue-600 hover:underline">
            Choose placements
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {presets.map((p) => {
            const Mock = MOCKS[p.id];
            const active = p.id === activeId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPick(p.id)}
                className={cx(
                  "block w-full rounded-2xl border-2 p-2.5 text-left transition",
                  active ? "border-blue-600 bg-blue-50/40" : "border-transparent hover:border-slate-200 hover:bg-slate-50",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">{p.name}</span>
                  <PlatformBadge platform={p.platform} />
                  {active && <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-blue-600">In big preview</span>}
                </div>
                {Mock && <Mock p={p} source={source} edit={edit} />}
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
