// src/App.js
import './App.css';
import MapComponent from './MapComponent';

function App() {
  const mapCenter = { lat: -15.793889, lng: -47.882778 }; // Brasília, DF

  return (
    <div className="App">
      {/* Container do mapa */}
      <main className="map-container">
        {/* Aqui você pode passar markers futuramente */}
        <MapComponent center={mapCenter} zoom={12} />
      </main>
    </div>
  );
}

export default App;
