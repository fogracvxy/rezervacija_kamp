import React from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";
import { Loading } from "../components/index";

const ProtectedRoute = ({ component, ...args }) => {
  const Cp = withAuthenticationRequired(component, {
    onRedirecting: () => <Loading />,
  });
  return <Cp {...args} />;
};

export default ProtectedRoute;
