/* global google */
import { useEffect, useState, useRef } from "react";
// Se precisar converter ESRI -> GeoJSON
import * as Terraformer from "terraformer";
import "terraformer-arcgis-parser";

// Cache global do GeoJSON
let geoJsonCache = null;

// Debounce ninja
const debounce = (fn, delay = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export default function MapComponent({ center, zoom }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);

  // 1️⃣ Inicializa o mapa com lazy-load da API
  useEffect(() => {
    if (window.google && window.google.maps) return initializeMap();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=`;
    script.async = true;
    script.defer = true;
    script.onload = initializeMap;
    document.head.appendChild(script);

    function initializeMap() {
      if (!mapRef.current || !window.google) return;

      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapId: null, // Map ID opcional
      });
      setMap(newMap);
    }
  }, []);

  // 2️⃣ Carrega polígonos com cache + conversão ESRI -> GeoJSON
  useEffect(() => {
    if (!map) return;
    let isMounted = true;
    const listeners = [];

    const loadGeoJSON = async () => {
      try {
        let geoJson;
        if (geoJsonCache) {
          geoJson = geoJsonCache;
        } else {
          const wfsUrl =
            "https://www.geoservicos.ide.df.gov.br/arcgis/rest/services/Aplicacoes/ENDERECAMENTO_ATIVIDADES_LUOS_PPCUB/FeatureServer/0/query?where=pu_end_usual LIKE '%QNG 4 LT 37%'&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Foot&returnGeometry=true&returnDistinctValues=false&returnIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnZ=false&returnM=false&multipatchOption=xyFootprint&returnTrueCurves=false&returnExceededLimitFeatures=false&returnCentroid=false&sqlFormat=none&featureEncoding=esriDefault&f=json&outFields=*";
          const res = await fetch(wfsUrl);
          if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
          const esriData = await res.json();
          geoJson = Terraformer.ArcGIS.parse(esriData); // converte pro formato GeoJSON
          geoJsonCache = geoJson;
        }

        if (!isMounted || !map.data) return;

        // Limpa dados antigos e adiciona novos
        map.data.forEach((f) => map.data.remove(f));
        map.data.addGeoJson(geoJson);

        // Estilo padrão
        map.data.setStyle({
          fillColor: "#007BFF",
          strokeWeight: 1,
          strokeColor: "#FFFFFF",
          fillOpacity: 0.35,
        });

        // InfoWindow
        const infoWindow = new window.google.maps.InfoWindow();

        const handleMouseOver = debounce((event) => {
          map.data.revertStyle();
          map.data.overrideStyle(event.feature, {
            strokeWeight: 3,
            strokeColor: "#FFFF00",
          });
        });

        const handleMouseOut = debounce(() => map.data.revertStyle());

        const handleClick = (event) => {
          let content = '<div style="font-family:Arial,sans-serif;font-size:14px;max-height:150px;overflow-y:auto">';
          event.feature.forEachProperty((value, property) => {
            content += `<strong>${property}:</strong> ${value}<br>`;
          });
          content += "</div>";
          infoWindow.setContent(content);
          infoWindow.setPosition(event.latLng);
          infoWindow.setOptions({ pixelOffset: new window.google.maps.Size(0, -10) });
          infoWindow.open(map);
        };

        listeners.push(map.data.addListener("mouseover", handleMouseOver));
        listeners.push(map.data.addListener("mouseout", handleMouseOut));
        listeners.push(map.data.addListener("click", handleClick));
      } catch (err) {
        console.error("Erro carregando GeoJSON:", err);
      }
    };

    loadGeoJSON();

    return () => {
      isMounted = false;
      if (map && map.data) {
        window.google.maps.event.clearInstanceListeners(map.data);
        map.data.forEach((f) => map.data.remove(f));
      }
    };
  }, [map]);

  // 3️⃣ Inicializa DrawingManager
  useEffect(() => {
    if (!map || !window.google.maps.drawing) return;

    const drawingManager = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: "#FFC107",
        fillOpacity: 0.5,
        strokeWeight: 2,
        strokeColor: "#FFC107",
        editable: true,
        zIndex: 1,
      },
    });

    drawingManager.setMap(map);

    const handlePolygonComplete = (polygon) => {
      const path = polygon.getPath();
      const coords = path.getArray().map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));
      console.log("Polígono desenhado:", coords);

      // Monitorar edição do polígono
      const updateCoords = () => {
        const newCoords = path.getArray().map((latLng) => ({ lat: latLng.lat(), lng: latLng.lng() }));
        console.log("Polígono editado:", newCoords);
      };

      path.addListener("set_at", updateCoords);
      path.addListener("insert_at", updateCoords);
      path.addListener("remove_at", updateCoords);

      drawingManager.setDrawingMode(null); // sai do modo desenho
    };

    const polygonCompleteListener = window.google.maps.event.addListener(
      drawingManager,
      "polygoncomplete",
      handlePolygonComplete
    );

    return () => {
      window.google.maps.event.removeListener(polygonCompleteListener);
      drawingManager.setMap(null);
    };
  }, [map]);

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />;
}
