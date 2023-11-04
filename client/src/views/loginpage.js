import { useContext, useState } from "react";
import "./login.css";
import { useNavigate, Navigate } from "react-router";
import Logo from "../assets/logo.png";
import {
  Button,
  ButtonGroup,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
//import { useTranslation } from "react-i18next";
import { Form, Formik } from "formik";
import { AccountContext } from "../components/AccountContext";
import TextField from "../components/TextField";
const Yup = require("yup");

const formSchema = Yup.object({
  username: Yup.string()
    .required("Unesite korisničko ime")
    .min(2, "Korisničko ime je prekratko")
    .max(28, "Korisničko ime je predugo!"),
  password: Yup.string()
    .required("Unesite lozinku")
    .min(6, "Lozinka je prekratna")
    .max(28, "Lozinka je preduga!"),
});

const LoginPage = ({ isLoggedIn }) => {
  /*   const { t } = useTranslation(); */
  const { setUser } = useContext(AccountContext);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isTwoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFACode, setTwoFACode] = useState("");
  const [loginInfo, setLoginInfo] = useState(null);
  const verifyTwoFA = async () => {
    if (!loginInfo) return;

    try {
      const res = await fetch("/auth/verify-login-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: loginInfo.username,
          password: loginInfo.password,
          token: twoFACode,
        }),
      });

      const data = await res.json();

      if (data.loggedIn) {
        setUser(data); // Assuming setUser updates your authentication state
        navigate("/home");
      } else {
        setError(data.status || "Invalid 2FA code");
      }
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <>
      {isLoggedIn ? (
        <Navigate to="/" />
      ) : (
        <Grid templateColumns="repeat(1, 1fr)" gap={6} pb="100px" pt="100px">
          <GridItem height="screen">
            <Formik
              initialValues={{ username: "", password: "" }}
              validationSchema={formSchema}
              onSubmit={(values, actions) => {
                fetch("/auth/login", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(values),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.twoFactorEnabled) {
                      setTwoFAEnabled(true);
                      setLoginInfo(values);
                    } else if (data.loggedIn) {
                      navigate("/");
                    }
                    setUser(data);
                    console.log(data);
                    setError(data.status);
                  })
                  .catch((err) => setError(err.message));
                actions.resetForm();
              }}
            >
              <VStack
                as={Form}
                w={{ base: "90%", md: "500px" }}
                m="auto"
                justify="center"
                px="50px"
                py="50px"
                spacing="1rem"
                className="form__login"
                bg="white"
              >
                {/* <img src={Logo} className="logologin" alt="logo lucica" /> */}
                <Heading> Prijava{/* {t("PrijavaNaslov")} */}</Heading>
                <Text as="p" color="red.500">
                  {error}
                </Text>
                {isTwoFAEnabled ? (
                  <>
                    <TextField
                      name="twoFACode"
                      placeholder="Enter 2FA code"
                      value={twoFACode}
                      onChange={(e) => setTwoFACode(e.target.value)}
                      label="2FA Code"
                      show="none"
                      autoComplete="off"
                    />
                    <Button onClick={verifyTwoFA}>Verify 2FA</Button>
                  </>
                ) : (
                  <>
                  
                    <TextField
                      name="username"
                      placeholder="Korisničko ime"
                      autoComplete="off"
                      label="Korisničko ime"
                      borderColor="black"
                      focusBorderColor="#325731"
                      show="none"
                    />
                    <TextField
                      name="password"
                      placeholder="Password"
                      autoComplete="off"
                      label="Password"
                      type="password"
                      borderColor="black"
                      focusBorderColor="#325731"
                      show="none"
                    />
                    <ButtonGroup pt="1rem">
                      <Button
                        borderRadius="full"
                        style={{ backgroundColor: "#698A2E", color: "white" }}
                        type="submit"
                      >
                        Prijava
                        {/* {t("Prijava")} */}
                      </Button>
                      <Button
                        borderRadius="full"
                        style={{ backgroundColor: "#6E633A", color: "white" }}
                        onClick={() => navigate("/register")}
                      >
                        Registracija
                        {/* {t("Kreiraj")} */}
                      </Button>
                    </ButtonGroup>
                  </>
                )}
              </VStack>
            </Formik>
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export default LoginPage;
