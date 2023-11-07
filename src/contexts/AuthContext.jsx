import React, { useContext, createContext, useEffect, useState } from "react";
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const signUserOut = async () => {
  try {
    await signOut(auth);
    // localStorage.removeItem("isAuth");
    navigate("/");
  } catch (err) {
    setError(err.message);
  }
};

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    error,
    signUserOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
