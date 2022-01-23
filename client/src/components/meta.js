import React from "react";
import { Helmet } from "react-helmet";
const Meta = () => {
  return (
    <div className="application">
      <Helmet>
        <meta charSet="utf-8" />
        <title>Robinzonski kamp Lučica | Rezervacija</title>
        <meta
          name="description"
          content="Robinzonski kamp Lučica aplikacija za rezervaciju turista"
        />
        <meta
          property="og:title"
          content="Robinzonski kamp Lučica | Rezervacija"
        />
        <meta
          name="keywords"
          content="Robinzon, Robinzonski, Lučica, Kampiranje, Kamp, Rezervacija, Korana"
        />
        <meta
          property="og:image"
          content="https://robinzonlucica.hr/Slike/galerija/DSC_1673.jpg"
        />
        <link
          rel="canonical"
          href="https://rezervacija-lucica.herokuapp.com/"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
    </div>
  );
};

export default Meta;
