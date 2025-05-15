// src/components/CustomEditor.jsx
import React, { useState, useEffect, useRef } from "react";

const variables = [
  { label: "User Name", value: "{{user_name}}" },
  { label: "Date", value: "{{date}}" },
  { label: "Email", value: "{{email}}" },
];

export default function CustomEditor({ initialContent, onSave }) {
  const [showVariablesMenu, setShowVariablesMenu] = useState(false);
  const [content, setContent] = useState(initialContent || "");
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || "";
      setContent(initialContent || "");
    }
  }, [initialContent]);

  function insertAtCursor(text) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);

    sel.removeAllRanges();
    sel.addRange(range);

    editorRef.current.focus();
    setContent(editorRef.current.innerHTML);
  }

  function handleInput() {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  }

  function handleSave() {
    onSave(content);
    setShowVariablesMenu(false);
  }

  return (
    <div className="custom-editor border rounded p-2 bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-300"
        >
          SAVE
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVariablesMenu((v) => !v)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
          >
            Variables
          </button>

          {showVariablesMenu && (
            <ul className="absolute mt-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded shadow w-40 z-10 transition-colors duration-300">
              {variables.map((v) => (
                <li
                  key={v.value}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    insertAtCursor(v.value);
                    setShowVariablesMenu(false);
                  }}
                >
                  {v.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="min-h-[100px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 transition-colors duration-300"
        onInput={handleInput}
        suppressContentEditableWarning={true}
        spellCheck={false}
      />
    </div>
  );
}
