// src/components/ThreadSearch.jsx
import React from "react";

export default function ThreadSearch({ searchTerm, onSearch }) {
  return (
    <input
      type="text"
      placeholder="Search threads..."
      value={searchTerm}
      onChange={(e) => onSearch(e.target.value)}
      className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 
                 bg-white text-gray-900 border-gray-300
                 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600
                 transition-colors duration-300"
    />
  );
}
