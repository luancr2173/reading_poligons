// src/App.js
import React, { useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
};

const center = {
  lat: -15.721487,
  lng: -48.1021702,
};

// Array de marcadores ninja
const markers = [
  { id: 1,  lat: -15.721487, lng: -48.1021702, title: "Uluru" },
];

export default function App() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY, // segurança ninja
  });

  const [selectedMarker, setSelectedMarker] = useState(null);

  if (loadError) return <div>Erro ao carregar o mapa</div>;
  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      zoom={15}
      center={center}
      mapTypeId="terrain"
      options={{
        disableDefaultUI: true, // limpa UI
        zoomControl: true,      // deixa zoom
        streetViewControl: false,
      }}
      onClick={() => setSelectedMarker(null)} // clica fora, desmarca
    >
      {markers.map(marker => (
        <Marker
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          title={marker.title}
          onClick={() => setSelectedMarker(marker)}
        />
      ))}

      {selectedMarker && (
        <div
          style={{
            position: "absolute",
            bottom: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            padding: "10px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          {selectedMarker.title}
        </div>
      )}
    </GoogleMap>
  );
}
