import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setToken as storeToken, getToken } from "../utils/auth";
import CustomEditor from "../components/CustomEditor";

const API_BASE = "https://hiring.reachinbox.xyz/api/v1/onebox";

export default function OneboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [threads, setThreads] = useState([]);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [replyBoxOpen, setReplyBoxOpen] = useState(false);
  const [replyBody, setReplyBody] = useState("");

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
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(({ status, data, message }) => {
        if (status === 200 && Array.isArray(data)) {
          setThreads(data);
          if (data.length > 0) {
            setSelectedThreadId(data[0].threadId || data[0].id);
          }
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
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(({ status, message }) => {
        if (status === 200) {
          setThreads((prev) => prev.filter((t) => (t.threadId || t.id) !== threadId));
          setReplyBoxOpen(false);
          setSelectedThreadId(null);
        } else {
          throw new Error(message || "Failed to delete thread");
        }
      })
      .catch((err) => setError("Error deleting thread: " + err.message));
  };

  const resetInbox = () => {
    setError("");
    fetch(`${API_BASE}/reset`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(({ status, data, message }) => {
        if (status === 200) {
          alert(data);
          return fetch(`${API_BASE}/list`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          throw new Error(message || "Failed to reset inbox");
        }
      })
      .then((res) => res.json())
      .then(({ data }) => {
        setThreads(data);
        if (data.length > 0) {
          setSelectedThreadId(data[0].threadId || data[0].id);
        }
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

  const sendReply = () => {
    if (!replyBody.trim()) {
      alert("Reply cannot be empty");
      return;
    }
    setError("");
    const thread = threads.find((t) => (t.threadId || t.id) === selectedThreadId);
    if (!thread) {
      setError("Selected thread not found");
      return;
    }

    const payload = {
      toName: thread.fromName || "",
      to: thread.fromEmail,
      from: "your-email@example.com", // replace as needed
      fromName: "Your Name", // replace as needed
      subject: `Re: ${thread.subject}`,
      body: replyBody,
      references: [],
      inReplyTo: thread.messageId || "",
    };

    fetch(`${API_BASE}/reply/${selectedThreadId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then(({ status, message }) => {
        if (status === 200) {
          alert("Reply sent!");
          setReplyBody("");
          setReplyBoxOpen(false);
        } else {
          throw new Error(message || "Failed to send reply");
        }
      })
      .catch((err) => setError("Error sending reply: " + err.message));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-3xl mx-auto">
      <h1 className="text-center text-3xl font-bold mb-6">📬 Onebox</h1>

      {error && (
        <div className="text-red-600 mb-4 text-center font-semibold">{error}</div>
      )}

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
            const id = thread.threadId || thread.id;
            const isSelected = id === selectedThreadId;
            return (
              <div
                key={id}
                onClick={() => setSelectedThreadId(id)}
                className={`p-4 rounded border cursor-pointer ${
                  isSelected ? "border-blue-600 bg-blue-100" : "border-gray-300"
                }`}
              >
                <h2 className="font-semibold text-lg">{thread.subject}</h2>
                <p className="text-sm text-gray-700">From: {thread.fromEmail}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(id);
                  }}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>

                {/* Reply box with CustomEditor */}
                {isSelected && replyBoxOpen && (
                  <div className="mt-4">
                    <CustomEditor
                      initialContent={replyBody}
                      onSave={(content) => {
                        setReplyBody(content);
                        alert("Content saved!");
                      }}
                    />

                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={() => setReplyBoxOpen(false)}
                        className="px-3 py-1 border rounded hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => sendReply()}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-center text-gray-600 text-sm">
        Select a thread, press <b>D</b> to delete, or <b>R</b> to reply.
      </p>
    </div>
  );
}
