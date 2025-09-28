import React from "react";
import clsx from "clsx";
import { CaptionBar } from "./CaptionBar.tsx";


export const ReelCard: React.FC<{
  media: React.ReactNode;
  title: string;
  caption: string;
  actions: React.ReactNode;
  info: React.ReactNode;
  glassOverlay?: boolean;
}> = ({ media, title, caption, actions, info, glassOverlay }) => (
  <div
    className={clsx(
      "relative w-full h-[80vh] rounded-[var(--radius-2)] shadow-elevate overflow-hidden bg-[var(--color-surface)]",
      "transition-shadow duration-200 ease-out"
    )}
    tabIndex={0}
    style={{ outline: "none" }}
  >
    {/* Media */}
    <div className="absolute inset-0 w-full h-full object-cover">{media}</div>
    {/* Top gradient scrim */}
    <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
    {/* Bottom gradient scrim */}
    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
    {/* Action rail */}
    <div className="absolute right-0 top-1/4 flex flex-col gap-[var(--spacing-2)] pr-[var(--spacing-2)] z-10">
      {actions}
    </div>
    {/* Info bar pinned to bottom */}
    <div className="absolute bottom-0 left-0 w-full z-10 flex flex-col gap-[var(--spacing-1)] p-[var(--spacing-3)]">
      <h2
        className="text-[var(--color-on-surface)] font-semibold"
        style={{ fontSize: "var(--font-title)", lineHeight: 1.1 }}
      >
        {title}
      </h2>
      <CaptionBar text={caption} />
      <div className="flex items-center gap-[var(--spacing-2)]">{info}</div>
    </div>
    {/* Optional glass overlay */}
    {glassOverlay && (
      <div
        className="absolute inset-0 z-20 flex items-center justify-center"
        style={{
          background: "var(--color-glass-bg)",
          backdropFilter: "blur(12px)",
          border: "1.5px solid var(--color-glass-border)",
        }}
      >
        <span className="text-[var(--color-on-surface)] font-semibold text-lg">
          Overlay content
        </span>
      </div>
    )}
  </div>
);
