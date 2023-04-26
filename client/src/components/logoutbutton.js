import React, { useContext } from "react";
import { useNavigate } from "react-router";
import { Button } from "@chakra-ui/react";
import { AccountContext } from "./AccountContext";
const LogoutButton = () => {
  const { setUser } = useContext(AccountContext);
  const navigate = useNavigate();
  const handleLogout = () => {
    fetch("/auth/logout", {
      method: "GET",
      credentials: "include",
    })
      .then(() => {})
      .then(() => {
        setUser({ loggedIn: false });
        navigate("/"); // navigate nakon logouta
      });
  };
  return (
    <div>
      <Button
        className="btn-margin"
        onClick={() => handleLogout()}
        variant="danger"
      >
        Logout
      </Button>
    </div>
  );
};

export default LogoutButton;
