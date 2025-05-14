import React from "react";
import { useNavigate } from "react-router-dom";

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href =
      "https://hiring.reachinbox.xyz/api/v1/auth/google-login?redirect_to=http://localhost:5173/onebox";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700"
    >
      Login with Google
    </button>
  );
};

export default GoogleLoginButton;
