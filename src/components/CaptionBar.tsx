import React from "react";
export const CaptionBar: React.FC<{ text: string }> = ({ text }) => (
  <div
    className="inline-block px-4 py-1 rounded-full bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] text-[var(--font-caption)] font-medium shadow"
    style={{
      maxWidth: "90%",
      whiteSpace: "pre-line",
      overflowWrap: "break-word",
      marginTop: "var(--spacing-1)",
      marginBottom: "var(--spacing-1)",
    }}
    aria-label="Caption"
  >
    {text}
  </div>
);
