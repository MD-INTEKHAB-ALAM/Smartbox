// src/pages/OneboxPage.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { setToken as storeToken, getToken } from "../utils/auth";
import ThreadManager from "../components/ThreadManager";
import DarkModeToggle from "../components/DarkModeToggle";

export default function OneboxPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState("");
  const [error, setError] = useState("");

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 max-w-3xl mx-auto transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100 flex-grow">
          📬 Onebox
        </h1>
        <DarkModeToggle />
      </div>

      {error && (
        <div className="text-blue-600 dark:text-blue-400 mb-4 text-center">
          {error}
        </div>
      )}

      {token && (
        <ThreadManager
          token={token}
          userEmail={userEmail}
          userName={userName}
          setError={setError}
        />
      )}
    </div>
  );
}
