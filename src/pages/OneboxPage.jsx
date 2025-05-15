// src/pages/OneboxPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setToken as storeToken, getToken } from "../utils/auth";

const API_BASE = "https://hiring.reachinbox.xyz/api/v1/onebox";

const variables = [
  { label: "User Name", value: "{{user_name}}" },
  { label: "Date", value: "{{date}}" },
  { label: "Email", value: "{{email}}" },
];

function CustomEditor({ initialContent, onSave }) {
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

export default function OneboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [replyBoxOpen, setReplyBoxOpen] = useState(false);
  const [replyHtml, setReplyHtml] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Hardcoded user info
  const userEmail = "intekhab8928@gmail.com";
  const userName = "Md Alam";

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      storeToken(urlToken);
      setSearchParams({});
      setToken(urlToken);
    } else {
      const stored = getToken();
      if (!stored) {
        navigate("/login");
      } else {
        setToken(stored);
      }
    }
  }, [searchParams, setSearchParams, navigate]);

  useEffect(() => {
    if (!token) return;
    setError("");
    fetch(`${API_BASE}/list`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(({ status, data, message }) => {
        if (status === 200 && Array.isArray(data)) {
          setThreads(data);
          if (data.length > 0) setSelectedThreadId(data[0].threadId);
        } else {
          throw new Error(message || "Failed to load threads");
        }
      })
      .catch((err) => setError("Error loading threads: " + err.message));
  }, [token]);

  const deleteThread = (threadId) => {
    if (!threadId) return;
    if (!window.confirm("Delete this thread?")) return;
    setError("");
    fetch(`${API_BASE}/messages/${threadId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(({ status }) => {
        if (status === 200) {
          setThreads((prev) => prev.filter((t) => t.threadId !== threadId));
          setReplyBoxOpen(false);
          setSelectedThreadId(null);
        } else {
          throw new Error("Failed to delete thread");
        }
      })
      .catch((err) => setError("Error deleting thread: " + err.message));
  };

  const resetInbox = () => {
    setError("");
    fetch(`${API_BASE}/reset`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(({ status, data }) => {
        if (status === 200) {
          alert(data);
          return fetch(`${API_BASE}/list`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw new Error("Failed to reset inbox");
        }
      })
      .then((res) => res.json())
      .then(({ data }) => {
        setThreads(data);
        if (data.length > 0) setSelectedThreadId(data[0].threadId);
        setReplyBoxOpen(false);
      })
      .catch((err) => setError("Error resetting inbox: " + err.message));
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!selectedThreadId) return;
      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        deleteThread(selectedThreadId);
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        setReplyBoxOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedThreadId]);

  const sendReply = async () => {
    if (!replyHtml.trim()) {
      alert("Reply cannot be empty");
      return;
    }

    const thread = threads.find((t) => t.threadId === selectedThreadId);
    if (!thread || !thread.threadId) {
      setError("Selected thread not found or thread ID missing.");
      return;
    }

    const body = replyHtml.trim().startsWith("<") ? replyHtml : `<p>${replyHtml}</p>`;

    const payload = {
      toName: thread.fromName || "Recipient",
      to: thread.from || thread.fromEmail || "",
      from: userEmail,
      fromName: userName,
      subject: `Re: ${thread.subject || ""}`,
      body,
      references: Array.isArray(thread.references)
        ? thread.references
        : thread.references
        ? [thread.references]
        : [],
      inReplyTo: thread.messageId || "",
    };

    if (!payload.to.includes("@") || !payload.from.includes("@")) {
      setError("Invalid 'from' or 'to' email address");
      return;
    }

    setSendingReply(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/reply/${thread.threadId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Email is Send to : ${payload.to}`);
      }

      const json = await res.json();

      if (json.status === 200) {
        alert("Reply sent!");
        setReplyHtml("");
        setReplyBoxOpen(false);
      } else {
        throw new Error("Failed to send reply");
      }
    } catch (err) {
      console.error("Error sending reply:", err);
      setError(err.message);
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-3xl mx-auto">
      <h1 className="text-center text-3xl font-bold mb-6">📬 Onebox</h1>

      {error && <div className="text-blue-600 mb-4 text-center">{error}</div>}

      <div className="flex justify-center mb-6">
        <button
          onClick={resetInbox}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Reset Inbox
        </button>
      </div>

      {threads.length === 0 ? (
        <p className="text-center text-gray-600">Loading threads...</p>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => {
            const id = thread.threadId;
            const isSelected = id === selectedThreadId;
            return (
              <div
                key={id}
                onClick={() => setSelectedThreadId(id)}
                className={`p-4 rounded border cursor-pointer ${
                  isSelected ? "border-blue-600 bg-blue-100" : "border-gray-300"
                }`}
              >
                <h3 className="font-semibold">{thread.subject || "(No Subject)"}</h3>
                <p className="text-sm text-gray-700 truncate">{thread.previewText || ""}</p>
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedThreadId(id);
                      setReplyBoxOpen(true);
                      setReplyHtml("");
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Reply
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(id);
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {replyBoxOpen && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Reply</h2>
          <CustomEditor initialContent={replyHtml} onSave={setReplyHtml} />
          <div className="mt-3 flex space-x-2">
            <button
              onClick={sendReply}
              disabled={sendingReply}
              className={`px-4 py-2 text-white rounded ${
                sendingReply ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {sendingReply ? "Sending..." : "Send"}
            </button>
            <button
              onClick={() => setReplyBoxOpen(false)}
              disabled={sendingReply}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
