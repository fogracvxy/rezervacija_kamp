import { createContext, useState, useEffect } from "react";

export const AccountContext = createContext();

const UserContext = ({ children }) => {
  const [user, setUser] = useState({ loggedIn: false });
  const [checkedForUser, setCheckedForUser] = useState(false);
  useEffect(() => {
    fetch("/auth/login", {
      credentials: "include",
    })
      .catch((err) => {
        setUser({ loggedIn: false });
        setCheckedForUser(true);
        return;
      })
      .then((r) => {
        if (!r.ok) {
          throw new Error("Request not OK");
        }
        return r.json();
      })
      .then((data) => {
        setUser({ ...data });
        setCheckedForUser(true);
      })
      .catch(() => {
        setUser({ loggedIn: false });
        setCheckedForUser(true);
      });
  }, []);
  return (
    <AccountContext.Provider value={{ user, setUser, checkedForUser }}>
      {children}
    </AccountContext.Provider>
  );
};

export default UserContext;
