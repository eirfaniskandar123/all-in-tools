"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost";

export function Button({
  variant = "secondary",
  className,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      {...rest}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
        variant === "primary" &&
          "bg-blue-600 text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none",
        variant === "secondary" &&
          "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50",
        variant === "ghost" && "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cx("rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60", className)}>
      {children}
    </div>
  );
}

export function ImageAllInTag({ className }: { className?: string }) {
  return (
    <span
      title="This feature comes from the Image All-in proposal"
      className={cx(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      from Image All-in
    </span>
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="text-sm font-semibold text-slate-900">{children}</h3>
      {aside}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  display: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="block">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-slate-700">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range"
        style={{ ["--pct" as string]: `${pct}%` }}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-xl bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx(
            "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition",
            value === o.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-sm font-medium text-slate-700"
    >
      <span className={cx("relative h-6 w-11 rounded-full transition", checked ? "bg-blue-600" : "bg-slate-300")}>
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  disabled,
  title,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <label
      title={title}
      className={cx(
        "inline-flex select-none items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition",
        disabled
          ? "cursor-not-allowed border-slate-200 text-slate-400"
          : checked
            ? "cursor-pointer border-blue-600 bg-blue-50 text-blue-800"
            : "cursor-pointer border-slate-300 bg-white text-slate-700 hover:border-slate-400",
      )}
    >
      <input
        type="checkbox"
        className="h-4 w-4 accent-blue-600"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

/** Transparent-background checkerboard. */
export const checker =
  "bg-[conic-gradient(#e2e8f0_25%,#fff_0_50%,#e2e8f0_0_75%,#fff_0)] bg-[length:16px_16px]";
