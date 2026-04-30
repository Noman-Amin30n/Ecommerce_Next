"use client";

import React, { useState, useCallback, useId } from "react";

interface StarRatingInputProps {
  value: number;        // 0–5 (0 = none selected)
  onChange: (rating: number) => void;
  size?: number;        // px for each star
  disabled?: boolean;
}

/**
 * Interactive 5-star rating input.
 * Supports hover preview, click to set, and keyboard navigation.
 */
export default function StarRatingInput({
  value,
  onChange,
  size = 32,
  disabled = false,
}: StarRatingInputProps) {
  const [hovered, setHovered] = useState(0);
  const groupId = useId();

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (disabled) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        onChange(Math.min(5, index + 1));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        onChange(Math.max(1, index - 1));
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange(index);
      }
    },
    [disabled, onChange]
  );

  const displayRating = hovered || value;

  return (
    <div
      className="flex items-center gap-1"
      role="radiogroup"
      aria-label="Star rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        return (
          <button
            key={star}
            id={`${groupId}-star-${star}`}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
            disabled={disabled}
            onClick={() => onChange(star)}
            onMouseEnter={() => !disabled && setHovered(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            className={`transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5714] rounded-sm
              ${disabled ? "cursor-default opacity-50" : "cursor-pointer hover:scale-110 active:scale-95"}
            `}
            style={{ width: size, height: size }}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 20 20"
              fill={isFilled ? "#facc15" : "none"}
              stroke={isFilled ? "#facc15" : "#d1d5db"}
              strokeWidth={1.5}
              className="transition-all duration-150"
            >
              <path d="M10 1.5 L12.6 7.2 L18.8 7.8 L14 12 L15.3 18.2 L10 15 L4.7 18.2 L6 12 L1.2 7.8 L7.4 7.2 Z" />
            </svg>
          </button>
        );
      })}
      {displayRating > 0 && (
        <span className="ml-2 text-sm font-medium text-gray-500 tabular-nums">
          {displayRating}/5
        </span>
      )}
    </div>
  );
}
