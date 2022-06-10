import React from "react";
import { useNavigate } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
const Auth0ProviderWithHistory = ({ children }) => {
  const navigate = useNavigate();

  const onRedirectCallback = (appState) => {
    navigate(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain={process.env.REACT_APP_AUTH0_DOMAIN}
      clientId={process.env.REACT_APP_AUTH0_CLIENT_ID}
      redirectUri={window.location.origin}
      onRedirectCallBack={onRedirectCallback}
      audience="https://lucica.eu.auth0.com/api/v2/"
      scope="read:current_user update:current_user_metadata"
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithHistory;
