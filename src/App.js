// src/App.js
import './App.css';
import MapComponent from './MapComponent';

function App() {
  const mapCenter = { lat: -15.793889, lng: -47.882778 }; // Brasília, DF

  return (
    <div className="App">
      {/* Sidebar fixa */}
      <aside className="sidebar">
        <h2>Filtros</h2>
        <ul>
          <li><input type="checkbox" /> Camada 1</li>
          <li><input type="checkbox" /> Camada 2</li>
          <li><input type="checkbox" /> Camada 3</li>
        </ul>

        <h2>Legenda</h2>
        <div className="legend">
          <span className="legend-color blue"></span> Área Azul <br />
          <span className="legend-color yellow"></span> Área Amarela
        </div>
      </aside>

      {/* Container do mapa */}
      <main className="map-container">
        {/* Aqui você pode passar markers futuramente */}
        <MapComponent center={mapCenter} zoom={12} />
      </main>
    </div>
  );
}

export default App;
