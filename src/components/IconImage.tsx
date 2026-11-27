"use client";

import { useMemo } from "react";
import { drawIcon } from "@/lib/render";
import type { EditSettings, Preset, Source } from "@/lib/types";

/** Renders the icon exactly as it will be exported (at 2x for sharp display). */
export function IconImage({
  source,
  edit,
  preset,
  size,
  height,
  className,
  style,
  scale = 2,
}: {
  source: Source;
  edit: EditSettings;
  preset?: Preset;
  size: number;
  /** Height for non-square icons (defaults to size). */
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  scale?: number;
}) {
  const url = useMemo(
    () => drawIcon(source, size * scale, (height ?? size) * scale, edit, preset).toDataURL("image/png"),
    [source, edit, preset, size, height, scale],
  );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} width={size} height={height ?? size} alt="" className={className} style={style} draggable={false} />;
}
