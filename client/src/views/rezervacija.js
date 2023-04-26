import React, { useState, useEffect, useRef, useContext } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  chakra,
  Stack,
  SimpleGrid,
  GridItem,
  Input,
  FormLabel,
  FormControl,
  Select,
  Box,
  Text,
  Button,
  Grid,
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import { hr } from "date-fns/locale";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { isEmail } from "validator";
import "react-phone-number-input/style.css";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { AccountContext } from "../components/AccountContext";
const Rezervacija = () => {
  //Locale za hrvatski prikaz datuma u kalendaru
  registerLocale("hr", hr);
  const { user } = useContext(AccountContext);
  const navigate = useNavigate();
  const [mailGosta, setMailGost] = useState(user.mail);
  const [imeGosta, setImeGosta] = useState(user.ime + " " + user.prezime);
  const [brojGosta, setBrojGosta] = useState("");
  const [pocetniDatum, setPocetniDatum] = useState(new Date());
  //ovime je popravljen oblik rezervacije null u slucaju rezervacije bez odabira krajnjeg datuma
  const [krajniDatum, setKrajniDatum] = useState(
    new Date(new Date().valueOf() + 1000 * 3600 * 24)
  );
  const [smjestajIme, setSmjestajIme] = useState("");
  const [smjestajList, setSmjestajList] = useState([]);
  const [datumiList, setDatumiList] = useState([]);
  const [validated, setValidated] = useState(false);
  // errorForma provjera polja u for mi zbog event.preventDefault();
  const [errorForma, setErrorForma] = useState({});
  const formRef = useRef(null);
  //funckija za reset forme nakon klika submit jer ne vrsimo reset reloadom stranice
  const handleReset = () => {
    formRef.current.reset();
    setValidated(false);
  };
  // useEffect za dohvacanje smjestaja koje stavljamo u select form dio
  useEffect(() => {
    Axios.get("/auth/smjestaj").then((response) => {
      setSmjestajList(response.data);
    });
  }, []);
  // dohvacanje slobodnih datuma na temelju zatrazenog imena smjestaja(ID)
  useEffect(() => {
    Axios.post("/auth/rezerviranidatumi", {
      smjestajIme: Number(smjestajIme),
    }).then((response) => {
      setDatumiList(response.data);
    });
  }, [smjestajIme]);
  const pronadiErroreForma = () => {
    const mailGostaProvjera = mailGosta;
    const smjestajImeProvjera = smjestajIme;
    const imeGostaProvjera = imeGosta;
    const brojGostaProvjera = brojGosta;
    const noviErrori = {};
    //mail gosta ne smije biti blank ili prazan
    if (!mailGostaProvjera || mailGostaProvjera === "")
      noviErrori.mailGostaProvjera = " Polje ne može biti prazno!";
    else if (!isEmail(String(mailGosta).toLowerCase())) {
      noviErrori.mailGostaProvjera = "Upišite korektan mail";
    }
    if (!isValidPhoneNumber(brojGosta)) {
      noviErrori.brojGostaProvjera = "Unesite korektan broj!";
    }
    if (imeGostaProvjera === "") {
      noviErrori.imeGostaProvjera = "Polje za ime ne smije biti prazno!";
    }
    // odabir smjestaja ne smije biti prazan
    if (smjestajImeProvjera === "") {
      noviErrori.smjestajImeProvjera = "Odaberite smještaj";
    }
    return noviErrori;
  };
  //funkcija za upis rezervacije i response u obliku toasta(notifikacije) gdje dohvacamo response.data
  const terminRezervacija = (event) => {
    //event.preventDefault() preventiramo klik gumba submit kako se prozor nebi refreshao  te onda saljemo podatke i prikazujemo notoficikaciju
    event.preventDefault();
    const noviErrori = pronadiErroreForma();
    //provjera koliko ima errora Object.keys za vracanja arraya po imenima ne po vrijednostima tipa
    if (Object.keys(noviErrori).length > 0) {
      // We got errors!
      setErrorForma(noviErrori);
    } else {
      Axios.post("/auth/rezervirajtermin", {
        imeGosta: imeGosta,
        brojGosta: brojGosta,
        mailGosta: mailGosta,
        pocetniDatum: pocetniDatum,
        krajniDatum: krajniDatum,
        smjestajIme: Number(smjestajIme),
      }).then((response) =>
        toast(response.data, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        })
      );
      //brisanje forme
      //setiranje statea na default kako bi maknuli errore od formi
      setErrorForma({});
      setValidated(true);
      handleReset();
      //postavljanje mailGosta i smjestajIme na pocetne vrijednosti zbog problema sa klikom na rezervaciju kad su prazna polja nakon prve rezervacije svejedno
      // je moguce rezervirati bez upisa jer vrijednosti ostanu u stateu

      setSmjestajIme("");
      setBrojGosta("");
      setPocetniDatum(new Date());
      setKrajniDatum(new Date(new Date().valueOf() + 1000 * 3600 * 24));
      //vracanje na rezervaciju
    }
  };
  //onChange handler za spremanje pocetnog i zavrsnog datuma iz react.datepickera
  const onChange = (dates) => {
    const [start, end] = dates;
    setPocetniDatum(start);
    setKrajniDatum(end);
  };
  //polje za datume
  let poljeDatuma = new Array([]);
  //funkcija za dodavanje datuma +1
  const addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  //stavljanje datuma u polja kako bi booking zabranili an odredene datume u datepickeru(excludedDates)
  datumiList.map((elementi) => {
    let startDatum = new Date(elementi.t_start);
    let endDatum = new Date(elementi.t_end);
    while (startDatum <= endDatum) {
      poljeDatuma.push(startDatum);
      startDatum = addDays.call(startDatum, 1);
    }
    return null;
  });
  console.log(brojGosta);
  console.log(imeGosta);
  console.log(mailGosta);
  const isSmjestajError = smjestajIme === "";
  const isEmailError = mailGosta === "";
  const isImeError = imeGosta === "";

  //prikaz
  return (
    <div className="">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <chakra.form
        ref={formRef}
        method="POST"
        shadow="lg"
        rounded={[null, "md"]}
        overflow={{
          sm: "hidden",
        }}
      >
        <Stack
          px={4}
          py={5}
          p={{ lg: [null, 16], base: [null, 6] }}
          bg="white"
          direction={{ base: "column", lg: "column" }}
          _dark={{
            bg: "#141517",
          }}
          spacing={6}
        >
          <Grid
            templateAreas={{
              lg: `"smjestaj kalendar bungalov bungalov"
                  "imeprezime kalendar bungalov bungalov"
                  "email kalendar bungalov bungalov"
                  "broj kalendar bungalov bungalov"`,
              base: `"smjestaj"
                  "imeprezime"
                  "email"
                  "broj"
                  "kalendar"
                  "bungalov"`,
            }}
            columns={{ "2xl": 4, lg: 4, base: 1, md: 2 }}
            spacing={6}
          >
            <GridItem
              area={"smjestaj"}
              colStart={{ base: 1 }}
              colEnd={{ base: 1, lg: 2 }}
            >
              <FormControl isInvalid={isSmjestajError}>
                <FormLabel
                  htmlFor="country"
                  fontSize="sm"
                  fontWeight="md"
                  color="gray.700"
                  _dark={{
                    color: "gray.50",
                  }}
                >
                  Oblik smještaja
                </FormLabel>
                <Select
                  required
                  id="country"
                  name="country"
                  autoComplete="country"
                  placeholder="Odabir smještaja"
                  mt={1}
                  focusBorderColor="brand.400"
                  shadow="sm"
                  size="md"
                  w="full"
                  rounded="md"
                  onChange={(e) => setSmjestajIme(e.target.value)}
                >
                  {smjestajList.map((val, key) => {
                    return (
                      <option key={key} value={val.id}>
                        {val.room_name}
                      </option>
                    );
                  })}
                </Select>
                {!isSmjestajError ? (
                  <FormHelperText>Odaberite smještaj</FormHelperText>
                ) : (
                  <FormErrorMessage>
                    Odaberite korektan smještaj
                  </FormErrorMessage>
                )}
              </FormControl>
            </GridItem>
            {smjestajIme !== "" ? (
              <>
                <GridItem
                  colStart={{ base: 1, lg: 2 }}
                  colEnd={{ base: 1, lg: 2 }}
                  area={"kalendar"}
                  textAlign="center"
                  pt={{ base: 5, lg: 0 }}
                >
                  <Text pb={{ base: 5, lg: 5 }}>
                    Odaberite datum dolaska i datum odlaska
                  </Text>{" "}
                  <DatePicker
                    dateFormat="dd.MM.yyyy."
                    wrapperClassName="datePicker"
                    selected={pocetniDatum}
                    onChange={onChange}
                    startDate={pocetniDatum}
                    endDate={krajniDatum}
                    excludeDates={poljeDatuma}
                    locale="hr"
                    selectsRange
                    inline
                    isClearable
                    placeholderText="Odaberite datum"
                  />
                  <Text pt={{ base: 5, lg: 12 }}>
                    <span style={{ color: "red" }}>*</span>crveno su označeni
                    zauzeti datumi za odabrani smještaj <br />
                    *za odabir jednog datuma kliknite dva puta na isti datum
                  </Text>{" "}
                </GridItem>
                <GridItem
                  area={"imeprezime"}
                  colStart={{ base: 1 }}
                  colEnd={{ base: 1, lg: 2 }}
                >
                  <FormControl isInvalid={isImeError}>
                    <FormLabel
                      htmlFor="first_name"
                      fontSize="sm"
                      fontWeight="md"
                      color="gray.700"
                      _dark={{
                        color: "gray.50",
                      }}
                    >
                      Ime i prezime
                    </FormLabel>
                    <Input
                      type="text"
                      name="first_name"
                      id="first_name"
                      autoComplete="given-name"
                      mt={1}
                      focusBorderColor="brand.400"
                      shadow="sm"
                      size="md"
                      w="full"
                      rounded="md"
                      defaultValue={user.ime + " " + user.prezime}
                      onChange={(e) => setImeGosta(e.target.value)}
                    />
                    {!isImeError ? (
                      <FormHelperText>
                        Unesite vaše ime i prezime
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>
                        Ime i prezime ne smije biti prazno
                      </FormErrorMessage>
                    )}
                  </FormControl>
                </GridItem>
                <GridItem
                  area={"email"}
                  colStart={{ base: 1 }}
                  colEnd={{ base: 1, lg: 2 }}
                >
                  <FormControl isInvalid={errorForma.mailGostaProvjera}>
                    <FormLabel
                      htmlFor="email_address"
                      fontSize="sm"
                      fontWeight="md"
                      color="gray.700"
                      _dark={{
                        color: "gray.50",
                      }}
                    >
                      Email address
                    </FormLabel>
                    <Input
                      type="email"
                      name="email_address"
                      id="email_address"
                      autoComplete="email"
                      mt={1}
                      focusBorderColor="brand.400"
                      shadow="sm"
                      size="md"
                      w="full"
                      rounded="md"
                      defaultValue={user.mail}
                      onChange={(e) => setMailGost(e.target.value)}
                    />
                    {!errorForma.mailGostaProvjera ? (
                      <FormHelperText>Unesite vaš mail</FormHelperText>
                    ) : (
                      <FormErrorMessage>Unesite mail ispravno</FormErrorMessage>
                    )}
                  </FormControl>
                </GridItem>
                <GridItem
                  area={"broj"}
                  colStart={{ base: 1 }}
                  colEnd={{ base: 1, lg: 2 }}
                >
                  <Text
                    fontSize="sm"
                    fontWeight="md"
                    color="gray.700"
                    _dark={{
                      color: "gray.50",
                    }}
                    style={{ marginTop: "25px" }}
                    pb={2}
                  >
                    Vaš broj telefona/mobitela
                  </Text>
                  <PhoneInput
                    name="brojForma"
                    type="text"
                    placeholder="Unesite broj mobitela"
                    value={brojGosta}
                    onChange={setBrojGosta}
                    error={
                      brojGosta
                        ? isValidPhoneNumber(brojGosta)
                          ? undefined
                          : "Invalid phone number"
                        : "Phone number required"
                    }
                  />
                  <p
                    style={{
                      width: "100%",
                      marginTop: "0.25rem",
                      fontSize: "80%",
                      color: "#dc3545",
                    }}
                  >
                    {errorForma.brojGostaProvjera}
                  </p>
                </GridItem>
                <GridItem textAlign="center" area={"bungalov"}>
                  {" "}
                  <Text
                    pt={{ base: 5, md: 0 }}
                    as={GridItem}
                    colStart={{ base: 1, lg: 2 }}
                    colEnd={{ base: 1, lg: 2 }}
                    fontWeight="bold"
                  >
                    Detaljno o bungalovu {smjestajIme}
                  </Text>
                </GridItem>
              </>
            ) : (
              <>
                <GridItem pt={5} colStart={1}>
                  <Text>
                    Molim vas odaberite smještaj kako bi nastavili sa
                    rezervacijom
                  </Text>
                </GridItem>
              </>
            )}
          </Grid>
        </Stack>
        <Box
          px={{
            base: 4,
            sm: 6,
            lg: 16,
          }}
          py={3}
          bg="gray.50"
          _dark={{
            bg: "#121212",
          }}
          textAlign="right"
        >
          <Button
            type="submit"
            _hover={{ backgroundColor: "#65842e", color: "#DC4A2C" }}
            onClick={terminRezervacija}
            bg="#65842e"
            color="white"
            _focus={{
              shadow: "",
            }}
            fontWeight="md"
          >
            Rezerviraj
          </Button>
        </Box>
      </chakra.form>
    </div>
  );
};

export default Rezervacija;
