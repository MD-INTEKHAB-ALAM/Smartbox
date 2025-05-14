import React from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">
        Welcome to <span className="text-blue-600">Smartbox</span>
      </h1>
      <button
        onClick={handleLoginClick}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl text-lg hover:bg-blue-700"
      >
        Login
      </button>
    </div>
  );
};

export default HomePage;
