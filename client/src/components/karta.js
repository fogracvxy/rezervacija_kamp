import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

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
  return (
    <div>
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
        <CustomMarker
          isActive
          map={map}
          data={{
            position: [45.34416, 15.49005],
            title: "Robinzon kamp Lučica",
          }}
        />
      </MapContainer>
    </div>
  );
};

export default Karta;
