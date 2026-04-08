//hooks/useUserAuth.jsx

import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContext";

export const useUserAuth = () => {
  const { user, loading, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait for user data to load
    if (user) return;    // Already authenticated — nothing to do

    // Not authenticated: clear any stale data and redirect
    clearUser();
    navigate("/login");
  }, [user, loading, clearUser, navigate]);

  return { user, loading };
};
