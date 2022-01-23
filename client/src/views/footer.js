import React from "react";
import moment from "moment";
import { FaFacebook, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
const Footer = () => {
  const datum = Date();
  return (
    <footer className="footer text-center">
      <div className="logo" />
      <p>
        Copyright @{moment(datum).format("YYYY")} | Robinzonski Kamp Lučica| Sva
        prava zadržana{" "}
        <a
          style={{ color: "green" }}
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/fogracvxy/"
        >
          <br /> Marin Spudić
        </a>
      </p>
      <h4 className="footerikone">
        {" "}
        <a href="https://www.facebook.com/robinzonlucica/">
          <FaFacebook />
        </a>
        <a href="https://www.instagram.com/robinzonlucica/">
          <FaInstagram />
        </a>
        <a href="https://goo.gl/maps/4KEa1KxUtjLtFY4b6">
          <FaMapMarkerAlt />
        </a>
      </h4>
    </footer>
  );
};

export default Footer;
