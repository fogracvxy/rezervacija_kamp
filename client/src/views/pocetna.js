import React from "react";
import Logo from "../images/logo.png";
import { Gallery, Karta } from "../components/index";
import { Container, Row, Col } from "react-bootstrap";
import { FaToilet, FaCampground, FaDog, FaParking } from "react-icons/fa";
const Pocetna = () => {
  return (
    <div className="pocetna">
      <Container>
        <Row>
          <Col sm={12}>
            <h1 className="text-center">ROBINZONSKI KAMP LUČICA</h1>
            <hr />
          </Col>
          <Col sm={12} className="logopocetna">
            <div className="text-center">
              <img
                src={Logo}
                className="align-items-center"
                style={{ width: "250px", marginBottom: "30px" }}
                alt="Logo"
              />
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3 className="text-center mt-5">O KAMPU</h3>
            <hr />
          </Col>
        </Row>
        <Row>
          <Col sm={6}>
            <h3 className="mt-5 mb-5 text-center" style={{ color: "#776808" }}>
              Što nudimo?
            </h3>
            <p className="text-justify">
              U kampu Vam nudimo usluge smještaja. Ukoliko ste već iskusni u
              kampiranju dođite s vlastitim šatorom i opremom te iznajmite kamp
              mjesto, a za one malo manje hrabre koji će tek otkriti ovakvu
              vrstu boravka omogućili smo smještaj u drvenim kućicama. Za hranu
              i vodu se brinete sami, a mi smo Vam pripremili mjesta za
              roštiljanje. Kamp je pogodan za sve uzraste, a za goste kampa
              osiguran je sanitarni čvor. Ovo mjesto savršeno je za opuštanje,
              uživanje i bijeg od užurbane svakodnevice. Sami odaberite kako
              ćete provoditi vrijeme kod nas, iskoristite što Vam priroda nudi.
              Kupajte se u Korani, smaragdnoj ljepotici našeg kraja. U blizini
              kampa nalaze se slapovi, uživajte u samom pogledu, sjednite pod
              slapiće i isprobajte „prirodnu masažu“ vodom.
            </p>
          </Col>
          <Col sm={6}>
            <h3 className="mt-5 mb-5 text-center" style={{ color: "#776808" }}>
              O Korani
            </h3>
            <p className="text-justify">
              Rijeka Korana izvire kod Plitvičkih jezera (nacionalni park).
              Njena dužina iznosi 134,2 km, a ulijeva se u rijeku Kupu kod
              Karlovca. Pripada crnomorskom slivu i nije plovna. Na mnogim
              dijelovima Korana protiče kroz slikovite, krečnjačke kanjone
              visoke stotinjak i više metara. Ovi kanjoni obrasli su bukovom
              šumom ili su ogoljeli. U gornjem toku nalaze se slikovite pećine.
              Ispunite svoj dan raznim aktivnostima ili se jednostavno opuštajte
              i ljenčarite u potpuno prirodnom okruženju uz prekrasnu rijeku
              Koranu.
            </p>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3 className="text-center">SADRŽAJI</h3>
            <hr />
          </Col>
        </Row>
        <Row className="mt-4 ikonice text-center">
          <Col sm={3}>
            <FaToilet size={70} style={{ marginTop: "20px", color: "black" }} />
            <h4>Toilet</h4>
          </Col>
          <Col sm={3}>
            <FaCampground
              size={70}
              style={{ marginTop: "20px", color: "black" }}
            />
            <h4>Kampiranje 24/7</h4>
          </Col>
          <Col sm={3}>
            <FaParking
              size={70}
              style={{ marginTop: "20px", color: "black" }}
            />
            <h4>Parking</h4>
          </Col>
          <Col sm={3}>
            <FaDog size={70} style={{ marginTop: "20px", color: "black" }} />
            <h4>Dozvoljene životinje</h4>
          </Col>
        </Row>
        <Row className="mt-5 text-center">
          <Col sm={12}>
            <hr />
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Gallery />
            <hr />
          </Col>
        </Row>
        <Row className="mt-3 mb-3 text-center">
          <Col sm={12}>
            <h3>LOKACIJA</h3>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Karta />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Pocetna;
