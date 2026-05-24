"use client";
import React from "react";

function BlogCardTimestamps({ createdAt }: { createdAt: Date }) {
  const day = createdAt.getDate();

  const getSuffix = (day: number) => {
    switch (day) {
      case 1:
      case 21:
      case 31:
        return "st";
      case 2:
      case 22:
        return "nd";
      case 3:
      case 23:
        return "rd";
      default:
        return "th";
    }
  };

  const suffix = getSuffix(day);
  return (
    <span>
      {day}
      <sup>{suffix}</sup>{" "}
      {createdAt.toLocaleString("default", { month: "long" })}{" "}
      {createdAt.getFullYear()}
    </span>
  );
}

export default BlogCardTimestamps;
