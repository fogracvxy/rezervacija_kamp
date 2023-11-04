import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonGroup,
  Flex,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { useContext, useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { AccountContext } from "../components/AccountContext";
import TextField from "../components/TextField";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { hr } from "date-fns/locale";

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
  ime: Yup.string()
    .required("Unesite ime")
    .min(2, "Ime je prekratko")
    .max(30, "Ime je predugo!"),
  prezime: Yup.string()
    .required("Unesite prezime")
    .min(2, "Prezime je prekratko")
    .max(30, "Prezime je predugo!"),
  mail: Yup.string()
    .email("Mail mora biti korektan")
    .max(255)
    .required("Unesite mail"),
  birthdate: Yup.date().required("Molimo unesite datum rođenja"),
  passwordConfirmation: Yup.string()
    .oneOf([Yup.ref("password"), null], "Lozinke se moraju podudarati")
    .required("Potvrdite lozinku"),
});
const SignUp = ({ isLoggedIn }) => {
  registerLocale("hr", hr);
  const { setUser } = useContext(AccountContext);
  const [showpass, setShowPass] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [birthdate, setBirthdate] = useState(new Date());
  console.log(birthdate);
  const handleShowClick = () => {
    setShowPass((lastShow) => !lastShow); // isto kao setShowPass(!showpass)
  };
  return (
    <>
      {isLoggedIn ? (
        <Navigate to="/" />
      ) : emailVerificationSent ? (
        <div>
          <h2>Email verification sent</h2>
          <p>
            Please check your inbox and follow the instructions to verify your
            email.
          </p>
        </div>
      ) : (
        <Grid gap={6} pb="100px" pt="100px">
          <GridItem>
            <Formik
              initialValues={{
                username: "",
                password: "",
                mail: "",
                ime: "",
                prezime: "",
                birthdate: birthdate,
              }}
              validationSchema={formSchema}
              onSubmit={(values, actions) => {
                const formattedBirthdate = format(birthdate, "yyyy-MM-dd");
                const vals = { ...values, birthdate: formattedBirthdate };
                console.log(vals);
                actions.resetForm();
                fetch("/auth/signup", {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(vals),
                })
                  .catch((err) => {
                    console.error("Fetch error:", err);
                    return;
                  })
                  .then((res) => {
                    if (!res || !res.ok || res.status >= 400) {
                      return;
                    }
                    return res.json();
                  })
                  .then((data) => {
                    if (!data) return;
                    if (data.status) {
                      setError(data.status);
                    } else if (data.registered) {
                      setEmailVerificationSent(true);
                    }
                  });
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
                {/*  <img src={Logo} className="logologin" alt="logo lucica" /> */}
                <Heading>Registracija</Heading>
                <Text as="p" color="red.500">
                  {error}
                </Text>
                <TextField
                  name="ime"
                  placeholder="Upišite vaše ime"
                  autoComplete="off"
                  label="Ime"
                  show="none"
                />
                <TextField
                  name="prezime"
                  placeholder="Upišite vaše prezime"
                  autoComplete="off"
                  show="none"
                  label="Prezime"
                />
                <TextField
                  name="mail"
                  placeholder="Upišite email"
                  autoComplete="off"
                  label="Mail"
                  show="none"
                />
                <Flex alignItems="flex-start" width="100%">
                  <FormLabel
                    style={{ width: "180px" }}
                    htmlFor="birthdate"
                    mt="2"
                  >
                    Datum rođenja
                  </FormLabel>
                  <DatePicker
                    name="birthdate"
                    id="birthdate"
                    wrapperClassName="datePicker"
                    selected={birthdate ? birthdate : null}
                    onChange={(date) => setBirthdate(date || new Date())} // Fallback to new Date if date is null
                    customInput={<Input />}
                    dateFormat="dd/MM/yyyy"
                    locale="hr"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Odaberite datum rođenja"
                  />
                </Flex>
                <TextField
                  name="username"
                  placeholder="Upišite korisničko ime"
                  autoComplete="off"
                  show="none"
                  label="Korisničko ime"
                />

                <TextField
                  name="password"
                  placeholder="Upišite lozinku"
                  autoComplete="off"
                  label="Lozinka"
                  type={showpass ? "password" : "text"}
                  showpass={showpass}
                  handleClick={() => handleShowClick()}
                />
                <TextField
                  name="passwordConfirmation"
                  placeholder="Potvrdite lozinku"
                  autoComplete="off"
                  label="Potvrdite Lozinku"
                  type={showpass ? "password" : "text"}
                />
                <ButtonGroup pt="1rem">
                  <Button
                    borderRadius="full"
                    onClick={() => navigate("/login")}
                    leftIcon={<ArrowBackIcon />}
                  >
                    Povratak
                  </Button>
                  <Button
                    borderRadius="full"
                    color="white"
                    bg="#698A2E"
                    type="submit"
                  >
                    Kreiraj Račun
                  </Button>
                </ButtonGroup>
              </VStack>
            </Formik>
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export default SignUp;
