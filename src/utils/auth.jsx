// src/utils/auth.js

// Store the token in localStorage
export const setToken = (token) => {
  localStorage.setItem("authToken", token);
};

// Get the token from localStorage
export const getToken = () => {
  return localStorage.getItem("authToken");
};

// Remove the token from localStorage
export const removeToken = () => {
  localStorage.removeItem("authToken");
};
