import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import UserContext from "./components/AccountContext";
import theme from "./theme";
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <Router>
    <UserContext>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <App />
      </ChakraProvider>
    </UserContext>
  </Router>
);
