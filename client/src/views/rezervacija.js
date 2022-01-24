import React, { useState, useEffect, useRef } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { Form, Col, Row, Button, Container } from "react-bootstrap";
import "react-datepicker/dist/react-datepicker.css";
import { hr } from "date-fns/locale";
import Axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useHistory } from "react-router-dom";
import { isEmail, isMobilePhone } from "validator";
const Rezervacija = () => {
  //Locale za hrvatski prikaz datuma u kalendaru
  registerLocale("hr", hr);
  const history = useHistory();
  const [mailGosta, setMailGost] = useState("");
  const [imeGosta, setImeGosta] = useState("");
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
  // errorForma provjera polja u formi zbog event.preventDefault();
  const [errorForma, setErrorForma] = useState({});
  const formRef = useRef(null);
  //funckija za reset forme nakon klika submit jer ne vrsimo reset reloadom stranice
  const handleReset = () => {
    formRef.current.reset();
    setValidated(false);
  };
  // useEffect za dohvacanje smjestaja koje stavljamo u select form dio
  useEffect(() => {
    Axios.get("/smjestaj").then((response) => {
      setSmjestajList(response.data);
    });
  }, []);
  // dohvacanje slobodnih datuma na temelju zatrazenog imena smjestaja(ID)
  useEffect(() => {
    Axios.post("/rezerviranidatumi", {
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
    if (brojGostaProvjera === "") {
      noviErrori.brojGostaProvjera = "Polje broja ne smije biti prazno!";
    } else if (!isMobilePhone(String(brojGosta))) {
      noviErrori.brojGostaProvjera = "Upišite korektan broj mobitela";
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
      Axios.post("/rezervirajtermin", {
        imeGosta: imeGosta,
        brojGosta: brojGosta,
        mailGosta: mailGosta,
        pocetniDatum: pocetniDatum,
        krajniDatum: krajniDatum,
        smjestajIme: Number(smjestajIme),
      }).then((response) =>
        toast.dark(response.data, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
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
      setMailGost("");
      setSmjestajIme("");
      setPocetniDatum(new Date());
      setKrajniDatum(new Date(new Date().valueOf() + 1000 * 3600 * 24));
      //vracanje na rezervaciju
      history.push("/rezervacija");
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
  //prikaz
  return (
    <div className="rezervacija">
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <h1 className="text-center">Rezervacija</h1>
      <hr />
      <Container className="rezervacijaforma">
        <Row>
          <Form className="mb-5" ref={formRef} validated={validated}>
            <Col sm="12">
              <Form.Group controlId="formGridState">
                <Form.Label>Smještaj</Form.Label>
                <Form.Control
                  className="smjestajForma"
                  name="smjestajForma"
                  required
                  as="select"
                  defaultValue="0"
                  isInvalid={!!errorForma.smjestajImeProvjera}
                  onChange={(event) => setSmjestajIme(event.target.value)}
                >
                  <option>Odaberite...</option>
                  {smjestajList.map((val, key) => {
                    return (
                      <option key={key} value={val.id}>
                        {val.room_name}
                      </option>
                    );
                  })}
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                  {errorForma.smjestajImeProvjera}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Odabir smještaja koji rezervirate
                  <br />
                  <span style={{ color: "red" }}>
                    {" "}
                    *odabire se prije odabira datuma
                  </span>
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={12} className="text-center">
              <h5>Odaberite datum dolaska i datum odlaska</h5>
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
              <h6>
                <span style={{ color: "red" }}>*</span>crveno su označeni
                zauzeti datumi za odabrani smještaj <br />
                *za odabir jednog datuma kliknite dva puta na isti datum
              </h6>
            </Col>
            <Form.Group controlId="formBasicName">
              <Form.Label column sm="12">
                Ime
              </Form.Label>
              <Col sm="12">
                <Form.Control
                  name="imeForma"
                  type="text"
                  className="imeForma"
                  onChange={(event) => setImeGosta(event.target.value)}
                  isInvalid={!!errorForma.imeGostaProvjera}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorForma.imeGostaProvjera}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">Vaše ime</Form.Text>
              </Col>
            </Form.Group>
            <Form.Group controlId="formBasicName">
              <Form.Label column sm="12">
                Broj telefona/mobitela
              </Form.Label>
              <Col sm="12">
                <Form.Control
                  name="brojForma"
                  type="text"
                  className="brojForma"
                  onChange={(event) => setBrojGosta(event.target.value)}
                  isInvalid={!!errorForma.brojGostaProvjera}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorForma.brojGostaProvjera}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Vaš broj telefona/mobitela
                </Form.Text>
              </Col>
            </Form.Group>
            <Form.Group controlId="formBasicEmail">
              <Form.Label column sm="12">
                Mail adresa
              </Form.Label>
              <Col sm="12">
                <Form.Control
                  name="mailForma"
                  type="email"
                  className="mailForma"
                  onChange={(event) => setMailGost(event.target.value)}
                  isInvalid={!!errorForma.mailGostaProvjera}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errorForma.mailGostaProvjera}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Email za rezervaciju.
                </Form.Text>
              </Col>
            </Form.Group>
            <Col sm="12 text-center">
              <Button
                variant="success"
                type="submit"
                onClick={terminRezervacija}
              >
                Rezerviraj
              </Button>
            </Col>
          </Form>
        </Row>
      </Container>
    </div>
  );
};

export default Rezervacija;
