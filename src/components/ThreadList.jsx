// src/components/ThreadList.jsx
import React from "react";

export default function ThreadList({
  threads,
  selectedThreadId,
  setSelectedThreadId,
  onDelete,
  onReply,
}) {
  if (threads.length === 0) {
    return (
      <p className="text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
        No threads found
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {threads.map((thread) => {
        const id = thread.threadId;
        const isSelected = id === selectedThreadId;
        return (
          <div
            key={id}
            onClick={() => setSelectedThreadId(id)}
            className={`p-4 rounded border cursor-pointer transition-colors duration-300
              ${
                isSelected
                  ? "border-blue-600 bg-blue-100 dark:bg-blue-900"
                  : "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              }
            `}
          >
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {thread.subject || "(No Subject)"}
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
              {thread.previewText || ""}
            </p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedThreadId(id);
                  onReply();
                }}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors duration-300"
              >
                Reply
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 transition-colors duration-300"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
