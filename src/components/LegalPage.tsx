import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_UPDATED = "27 November 2026";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="text-[15px] font-bold text-slate-900">
            ← Icon Refactor
          </Link>
          <nav className="flex gap-4 text-sm text-slate-600">
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {LEGAL_UPDATED}</p>
        <div className="legal mt-8 space-y-6 text-[15px] leading-relaxed text-slate-700">{children}</div>
      </main>
    </div>
  );
}
