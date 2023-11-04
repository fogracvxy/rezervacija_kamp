import Views from "./views/views";
import { Loading, Meta } from "./components";
import { useContext, useEffect } from "react";
import { AccountContext } from "./components/AccountContext";
import { useColorMode } from "@chakra-ui/react";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  const isOn = true;
  useEffect(() => {
    if (colorMode === "light") return;
    toggleColorMode();
  }, [colorMode]);
  const { checkedForUser } = useContext(AccountContext);
  return (
    <div className="App">
      {isOn ? (
        !checkedForUser ? (
          <Loading />
        ) : (
          <>
            <Meta />
            <Views />
          </>
        )
      ) : (
        <div style={{ color: "red", textAlign: "center", fontSize: "70px" }}>
          <h1>Stranica je u izgradnji</h1>
        </div>
      )}
    </div>
  );
}

export default App;
