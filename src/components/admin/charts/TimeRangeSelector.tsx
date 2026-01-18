"use client";

interface TimeRangeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}

export default function TimeRangeSelector({
  value,
  onChange,
  options,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
            value === option.value
              ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
