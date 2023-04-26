import { Box } from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import ReactLeafletKml from "react-leaflet-kml";

//funkcija za odrzat popup upaljen cijelo virjeme
const CustomMarker = ({ isActive, data, map }) => {
  const [refReady, setRefReady] = useState(false);
  let popupRef = useRef();

  useEffect(() => {
    if (refReady && isActive) {
      map.openPopup(popupRef);
    }
  }, [isActive, refReady, map]);

  return (
    <Marker position={data.position}>
      <Popup
        ref={(r) => {
          popupRef = r;
          setRefReady(true);
        }}
      >
        {data.title}
      </Popup>
    </Marker>
  );
};
const Karta = () => {
  const [map, setMap] = useState(null);
  const [kml, setKml] = React.useState(null);

  React.useEffect(() => {
    fetch("../assets/korana.kml")
      .then((res) => res.text())
      .then((kmlText) => {
        const parser = new DOMParser();
        const kml = parser.parseFromString(kmlText, "text/xml");
        setKml(kml);
      });
  }, []);

  console.log(kml);
  return (
    <>
      <Box py={{ lg: 20, base: 20 }} px={8} bg="#edf3f8">
        <MapContainer
          ref={setMap}
          center={[45.34416, 15.49005]}
          zoom={15}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {kml && <ReactLeafletKml kml={kml} />}
          <CustomMarker
            isActive
            map={map}
            data={{
              position: [45.34416, 15.49005],
              title: "Robinzon kamp Lučica",
            }}
          />
        </MapContainer>
      </Box>
    </>
  );
};

export default Karta;
