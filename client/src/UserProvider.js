import React, { useState, useEffect, createContext } from "react";
import { auth } from "./firebase";

export const UserContext = createContext({ user: null });

export default ({ children }) => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        const { displayName, email, photoURL, uid } = user;
        setUser({
          displayName,
          email,
          photoURL,
          uid,
        });
      }
    });
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};
