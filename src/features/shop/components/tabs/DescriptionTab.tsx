"use client";

import React from "react";
import parse, { domToReact, HTMLReactParserOptions, Element } from "html-react-parser";

interface DescriptionTabProps {
  description?: string;
}

/**
 * Custom parse options:
 * - Strip dangerous tags (script, iframe, object, embed)
 * - Headings, lists, bold, italic etc. are styled via the prose wrapper
 */
const parseOptions: HTMLReactParserOptions = {
  replace(domNode) {
    if (domNode instanceof Element) {
      // Remove dangerous tags
      const blocked = ["script", "iframe", "object", "embed", "form"];
      if (blocked.includes(domNode.name)) return <></>;

      // Strip on* event attributes for security
      const { attribs } = domNode;
      if (attribs) {
        Object.keys(attribs).forEach((key) => {
          if (key.startsWith("on")) delete attribs[key];
        });
      }
    }
  },
};

/**
 * Renders Tiptap-generated HTML safely with full typography styling.
 * The `prose` class from @tailwindcss/typography handles all rich-text styles.
 */
export default function DescriptionTab({ description }: DescriptionTabProps) {
  if (!description?.trim()) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium">No description available</p>
      </div>
    );
  }

  return (
    <article
      className={`
        prose prose-slate max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-p:text-gray-600 prose-p:leading-relaxed
        prose-a:text-[#FF5714] prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-800 prose-strong:font-semibold
        prose-em:text-gray-600
        prose-ul:list-disc prose-ul:pl-6
        prose-ol:list-decimal prose-ol:pl-6
        prose-li:text-gray-600 prose-li:my-1
        prose-blockquote:border-l-[#88D9E6] prose-blockquote:bg-cyan-50/30 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
        prose-code:bg-gray-100 prose-code:text-[#FF5714] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
        prose-img:rounded-xl prose-img:shadow-md
        prose-hr:border-gray-200
        prose-table:border-collapse prose-th:bg-gray-50 prose-th:p-3 prose-td:p-3 prose-table:border prose-table:border-gray-200
      `}
    >
      {parse(description, parseOptions)}
    </article>
  );
}
