import React, { useState, useEffect, useRef } from "react";

const variables = [
  { label: "User Name", value: "{{user_name}}" },
  { label: "Date", value: "{{date}}" },
  { label: "Email", value: "{{email}}" },
];

export default function CustomEditor({ initialContent, onSave }) {
  const [showVariablesMenu, setShowVariablesMenu] = useState(false);
  const editorRef = useRef(null);

  // On initial load, set content once only
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent || "";
    }
  }, [initialContent]);

  // Insert text at cursor inside contentEditable
  function insertAtCursor(text) {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;

    const range = sel.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    // Move caret after inserted text
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);

    sel.removeAllRanges();
    sel.addRange(range);

    editorRef.current.focus();
  }

  function handleInput() {
    // We do not set state on every input to avoid re-render issues
    // User can save content explicitly by clicking SAVE button
  }

  function handleSave() {
    if (editorRef.current) {
      onSave(editorRef.current.innerHTML);
    }
    setShowVariablesMenu(false);
  }

  return (
    <div className="custom-editor border rounded p-2 bg-white">
      <div className="flex space-x-2 mb-2">
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          SAVE
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowVariablesMenu((v) => !v)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Variables
          </button>

          {showVariablesMenu && (
            <ul className="absolute mt-1 bg-white border rounded shadow w-40 z-10">
              {variables.map((v) => (
                <li
                  key={v.value}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
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
        className="min-h-[100px] p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        onInput={handleInput}
        suppressContentEditableWarning={true}
        spellCheck={false}
      />
    </div>
  );
}
