"use client";

import React from "react";

interface RatingStarsProps {
  rating: number;  // e.g. 4.23
  outOf?: number;  // default 5
  size?: number;   // px
}

export default function RatingStars({
  rating,
  outOf = 5,
  size = 22,
}: RatingStarsProps) {
  const fullStars = Math.floor(rating);
  const decimal = rating - fullStars; // 0–1
  const partialFill = Math.round(decimal * 100); // % for the last star

  return (
    <div className="flex items-center gap-2.5">
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <Star key={`full-${i}`} size={size} fillPercentage={100} />
      ))}

      {/* Fractional star */}
      {decimal > 0 && fullStars < outOf && (
        <Star size={size} fillPercentage={partialFill} />
      )}

      {/* Empty stars */}
      {Array.from({
        length: outOf - fullStars - (decimal > 0 ? 1 : 0),
      }).map((_, i) => (
        <Star key={`empty-${i}`} size={size} fillPercentage={0} />
      ))}
    </div>
  );
}

/* ------------------ STAR COMPONENT ------------------ */

interface StarProps {
  size: number;
  fillPercentage: number; // 0–100
}

const Star: React.FC<StarProps> = ({ size, fillPercentage }) => {
  const id = Math.random().toString(36).substring(2, 9); // unique gradient id

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      className="transition-transform duration-200 hover:scale-110"
    >
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fillPercentage}%`} stopColor="#facc15" />
          <stop offset={`${fillPercentage}%`} stopColor="#faf4f4" />
        </linearGradient>
      </defs>

      <path
        fill={`url(#${id})`}
        stroke="#facc15"
        strokeWidth="1"
        d="
          M10 1.5 
          L12.6 7.2 
          L18.8 7.8 
          L14 12 
          L15.3 18.2 
          L10 15 
          L4.7 18.2 
          L6 12 
          L1.2 7.8 
          L7.4 7.2 
          Z"
      />
    </svg>
  );
};
