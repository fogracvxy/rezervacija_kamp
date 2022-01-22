import React from "react";
import moment from "moment";
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
    </footer>
  );
};

export default Footer;
