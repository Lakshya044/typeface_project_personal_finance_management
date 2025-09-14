"use client";
import { useState } from "react";
import { currentMonthId } from "@/lib/budget";

export default function MonthPicker({ month, onChange }) {
  const [value, setValue] = useState(month || currentMonthId());

  function handle(e) {
    setValue(e.target.value);
    onChange(e.target.value);
  }

  return (
    <div className="flex items-center space-x-2">
      {/* <svg
        className="w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg> */}
      <input
        type="month"
        value={value}
        onChange={handle}
        className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      />
    </div>
  );
}
