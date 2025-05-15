// src/components/ReplyBox.jsx
import React from "react";
import CustomEditor from "./CustomEditor";

export default function ReplyBox({
  initialContent,
  onChange,
  onSend,
  onCancel,
  sending,
}) {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        Reply
      </h2>
      <CustomEditor initialContent={initialContent} onSave={onChange} />
      <div className="mt-3 flex space-x-2">
        <button
          onClick={onSend}
          disabled={sending}
          className={`px-4 py-2 text-white rounded transition-colors duration-300 ${
            sending
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          }`}
        >
          {sending ? "Sending..." : "Send"}
        </button>
        <button
          onClick={onCancel}
          disabled={sending}
          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors duration-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
