import React, { useState, useEffect, useRef } from "react";
import { Table, Button, Image, Col, Row } from "react-bootstrap";
import Axios from "axios";
import { useHistory } from "react-router-dom";
import moment from "moment";
import { useAuth0 } from "@auth0/auth0-react";
import { ToastContainer, toast } from "react-toastify";
import ReactToPrint from "react-to-print";
import { FiPrinter } from "react-icons/fi";
import { FaUserAlt } from "react-icons/fa";
function RezervacijaAdmin() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [userMetadata, setUserMetadata] = useState(null);
  const history = useHistory();
  const [rezervacijaList, setRezervacijaList] = useState([]);
  const [danasDatum] = useState(new Date());
  const componentRef = useRef();
  useEffect(() => {
    Axios.get("/rezervacijelista").then((response) => {
      setRezervacijaList(response.data);
    });
  }, []);
  useEffect(() => {
    const getUserMetadata = async () => {
      const domain = "lucica.eu.auth0.com";

      try {
        const accessToken = await getAccessTokenSilently({
          audience: `https://${domain}/api/v2/`,
          scope: "read:current_user",
        });

        const userDetailsByIdUrl = `https://${domain}/api/v2/users/${user.sub}`;

        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const { user_metadata } = await metadataResponse.json();

        setUserMetadata(user_metadata);
      } catch (e) {
        console.log(e.message);
      }
    };

    getUserMetadata();
  }, [user.sub, getAccessTokenSilently]);
  const deleteRezervacija = (id) => {
    Axios.delete(`/rezervacijadelete/${id}`).then((response) =>
      toast.dark("❌" + response.data, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    );
    history.push("/rezervacijaadmin");
  };
  const odobriRezervaciju = (id) => {
    Axios.put(`/rezervacijaodobri/${id}`).then((response) =>
      toast.dark("✔️" + response.data, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    );
    history.push("/rezervacijaadmin");
  };
  return (
    <div className="adminpanel">
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
      <Row>
        <Col md={6} className="administracijapanel">
          <h3 className="text-center">Administracija</h3>
          <hr className="mb-4" />
        </Col>
      </Row>
      {userMetadata ? (
        <div className="administracija">
          <Row>
            <Col md={6} className="text-center">
              <Image
                src={userMetadata.picture}
                roundedCircle
                style={{ width: "200px", height: "200px", objectFit: "cover" }}
              />
            </Col>
            <Col md={4}>
              <h4 className="mt-4 text-center">
                {" "}
                <FaUserAlt size={20} className="mr-4" />
                {user.email}
              </h4>
              <hr className="mb-5" />
              <h4 className=" text-center">{userMetadata.role}</h4>
            </Col>
          </Row>
        </div>
      ) : (
        "No user metadata defined"
      )}
      <h3 className="naslovrezervacija text-center mt-5">Rezervacije</h3>
      <hr className="mb-5" />
      <div className="tablicarezervacije">
        <Table ref={componentRef} striped bordered hover responsive>
          <thead>
            <tr>
              <th>Šifra</th>
              <th className="text-center">Smještaj</th>
              <th className="text-center">Ime</th>
              <th className="text-center">Broj tel/mob</th>
              <th className="text-center">Email</th>
              <th className="text-center">Datum rezervacije početni</th>
              <th className="text-center">Datum rezervacije krajni</th>
              <th className="text-center">Datum kreiranja</th>
              <th className="mogucnostiText text-center">Mogućnosti</th>
            </tr>
          </thead>
          <tbody>
            {rezervacijaList.map((val, key) => {
              return (
                <tr key={key}>
                  <td>{val.id}</td>
                  <td className="text-center">{val.room_id}</td>
                  <td className="text-center">{val.user_name}</td>
                  <td className="text-center">{val.user_phone}</td>
                  <td className="text-center">{val.user_mail}</td>
                  <td className="text-center">
                    {moment(val.t_start).format("DD.MM.YYYY.")}
                  </td>
                  <td className="text-center">
                    {moment(val.t_end).format("DD.MM.YYYY.")}
                  </td>
                  <td className="text-center">
                    {moment(val.created_at).format("DD.MM.YYYY.")}
                  </td>
                  <td className="mogucnostiButton text-center">
                    {val.odobreno ? (
                      <Button
                        variant="outline-danger"
                        onClick={() => deleteRezervacija(val.id)}
                      >
                        Obriši rezervaciju
                      </Button>
                    ) : (
                      <Button onClick={() => odobriRezervaciju(val.id)}>
                        Odobri rezervaciju
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {/* Dio za printanje tablice rezervacije*/}
      <div className="text-right mt-5">
        <ReactToPrint
          bodyClass="naslovrezervacija"
          documentTitle={
            "Lista_rezervacija_" + moment(danasDatum).format("DD_MM_YYYY")
          }
          trigger={() => (
            <Button>
              <FiPrinter
                size={35}
                style={{ boxShadow: "0px 14px 30px rgba(34, 35, 58, 0.4)" }}
              />
            </Button>
          )}
          content={() => componentRef.current}
        />
      </div>
    </div>
  );
}

export default RezervacijaAdmin;
