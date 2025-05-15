// src/components/ThreadManager.jsx
import React, { useState, useEffect } from "react";
import ThreadSearch from "./ThreadSearch";
import ThreadList from "./ThreadList";
import ReplyBox from "./ReplyBox";

const API_BASE = "https://hiring.reachinbox.xyz/api/v1/onebox";

export default function ThreadManager({ token, userEmail, userName, setError }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [threads, setThreads] = useState([]);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [replyBoxOpen, setReplyBoxOpen] = useState(false);
  const [replyHtml, setReplyHtml] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

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
  }, [token, setError]);

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
        throw new Error(`Email is Send Successfully`);
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

  const filteredThreads = threads.filter((thread) =>
    (thread.subject || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-center mb-6">
        <button
          onClick={resetInbox}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 transition-colors duration-300"
        >
          Reset Inbox
        </button>
      </div>

      <ThreadSearch
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
      />

      {threads.length === 0 && !setError ? (
        <p className="text-center text-gray-600 dark:text-gray-400 transition-colors duration-300">
          Loading threads...
        </p>
      ) : (
        <ThreadList
          threads={filteredThreads}
          selectedThreadId={selectedThreadId}
          setSelectedThreadId={setSelectedThreadId}
          onDelete={deleteThread}
          onReply={() => {
            setReplyBoxOpen(true);
            setReplyHtml("");
          }}
        />
      )}

      {replyBoxOpen && (
        <ReplyBox
          initialContent={replyHtml}
          onChange={setReplyHtml}
          onSend={sendReply}
          onCancel={() => setReplyBoxOpen(false)}
          sending={sendingReply}
        />
      )}
    </>
  );
}
