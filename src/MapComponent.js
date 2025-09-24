import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Polygon,
  DrawingManager,
  useLoadScript,
} from "@react-google-maps/api";

// Configuração do mapa
const mapContainerStyle = { width: "100vw", height: "100vh" };
const center = { lat: -15.793889, lng: -47.882778 };
const zoom = 15;

// Função turbo pra converter GeoJSON em paths do Google Maps
const geoJsonToPaths = (geojson) =>
  geojson.features.map((feature) =>
    feature.geometry.coordinates[0].map((coord) => ({
      lat: coord[1],
      lng: coord[0],
    }))
  );

export default function MapComponent() {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "", // <--- coloca sua chave
    libraries: ["drawing"], // necessário pro DrawingManager
  });

  const [paths, setPaths] = useState([]);
  const [userPolygons, setUserPolygons] = useState([]);

  // Fetch GeoJSON turbo
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        const res = await fetch("URL_DA_SUA_API_GEOJSON"); // <--- coloca sua URL real
        const data = await res.json();
        const convertedPaths = geoJsonToPaths(data);
        setPaths(convertedPaths);
      } catch (err) {
        console.error("Erro ao buscar GeoJSON:", err);
      }
    };
    fetchGeoJson();
  }, []);

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <GoogleMap mapContainerStyle={mapContainerStyle} zoom={zoom} center={center}>
      {/* Polígonos do GeoJSON */}
      {paths.map((path, i) => (
        <Polygon
          key={`geojson-${i}`}
          paths={path}
          options={{
            fillColor: "#FF0000",
            fillOpacity: 0.4,
            strokeColor: "#FF0000",
            strokeOpacity: 1,
            strokeWeight: 2,
          }}
        />
      ))}

      {/* Polígonos desenhados pelo usuário */}
      {userPolygons.map((path, i) => (
        <Polygon
          key={`user-${i}`}
          paths={path}
          options={{
            fillColor: "#0000FF",
            fillOpacity: 0.3,
            strokeColor: "#0000FF",
            strokeOpacity: 1,
            strokeWeight: 2,
          }}
        />
      ))}

      {/* DrawingManager turbo */}
      <DrawingManager
        options={{
          drawingControl: true,
          drawingControlOptions: {
            position: window.google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ["polygon"],
          },
          polygonOptions: {
            fillColor: "#0000FF",
            fillOpacity: 0.3,
            strokeColor: "#0000FF",
            strokeWeight: 2,
          },
        }}
        onPolygonComplete={(polygon) => {
          const path = polygon.getPath().getArray().map((latLng) => ({
            lat: latLng.lat(),
            lng: latLng.lng(),
          }));
          setUserPolygons((prev) => [...prev, path]);
          polygon.setMap(null); // opcional: remove o polígono nativo pra usar nosso state
        }}
      />
    </GoogleMap>
  );
}
