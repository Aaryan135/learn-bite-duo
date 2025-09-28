import React from "react";

export const LikeButton: React.FC<{
  liked: boolean;
  onLike: () => void;
}> = ({ liked, onLike }) => (
  <button
    className="rounded-full p-2 bg-[var(--color-surface)] shadow transition-transform duration-150 ease-out focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    aria-pressed={liked}
    onClick={onLike}
    style={{
      transform: liked ? "scale(1.15)" : "scale(1)",
      transition: "transform 140ms cubic-bezier(0.4,0,0.2,1)",
    }}
  >
    <span
      className={liked ? "text-[var(--color-primary)]" : "text-[var(--color-outline)]"}
      aria-label={liked ? "Liked" : "Like"}
      role="img"
    >
      {/* Replace with your HeartIcon component or SVG */}
      ♥
    </span>
  </button>
);
