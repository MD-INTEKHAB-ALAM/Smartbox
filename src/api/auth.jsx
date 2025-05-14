// src/api/auth.js
const BASE_URL = "https://hiring.reachinbox.xyz/api/v1/onebox";  // Replace with actual API URL

// Login API call
export const loginUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Login failed");
  return response.json(); // Returns the token and other user data
};

// Signup API call (if you have a signup endpoint)
export const signupUser = async (email, password) => {
  const response = await fetch(`${BASE_URL}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Signup failed");
  return response.json(); // Returns the token and user info
};
