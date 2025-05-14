// src/utils/privateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "./auth";

const PrivateRoute = ({ children }) => {
  if (!getToken()) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default PrivateRoute;
