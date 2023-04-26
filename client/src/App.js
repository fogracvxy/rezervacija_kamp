import Views from "./views/views";
import { Loading, Meta } from "./components";
import { useContext, useEffect } from "react";
import { AccountContext } from "./components/AccountContext";
import { useColorMode } from "@chakra-ui/react";

function App() {
  const { colorMode, toggleColorMode } = useColorMode();
  useEffect(() => {
    if (colorMode === "light") return;
    toggleColorMode();
  }, [colorMode]);
  const { checkedForUser } = useContext(AccountContext);
  return (
    <div className="App">
      {!checkedForUser ? (
        <Loading />
      ) : (
        <>
          <Meta />
          <Views />
        </>
      )}
    </div>
  );
}

export default App;
