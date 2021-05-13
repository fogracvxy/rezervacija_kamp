import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const position = [45.34416, 15.49005];
const Karta = () => {
  return (
    <div>
      <MapContainer center={position} zoom={15} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>Robinzonski kamp Lučica</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Karta;
