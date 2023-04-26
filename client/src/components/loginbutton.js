import React from "react";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router";

const LoginButton = () => {
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };
  return (
    <div>
      <Button
        onClick={() => handleLogin()}
        borderRadius="full"
        style={{ backgroundColor: "#DC4A2C", color: "white" }}
      >
        Login
      </Button>
    </div>
  );
};

export default LoginButton;
