import { useContext } from "react";
import { AccountContext } from "./AccountContext";
const { Outlet, Navigate } = require("react-router");

const PrivateRoutes = () => {
  const { user, checkedForUser } = useContext(AccountContext);
  if (!checkedForUser) return null;
  return user.loggedIn ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoutes;
