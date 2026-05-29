import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// 1. Constantes globales (Placées TOUT EN HAUT pour éviter l'erreur d'initialisation)
const DAKAR = [14.6928, -17.4467];

// Fix pour les icônes Leaflet par défaut
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Icône rouge pour l'utilisateur
const iconeUtilisateurRouge = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Exercice 1 : Icône orange pour l'arrêt le plus proche
const iconeArretProcheOrange = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Formule de Haversine pour le calcul des distances
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Exercice 2 : Composant enfant pour piloter la carte via useMap()
function GestionnaireCarte({ centre, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (centre) {
      map.setView(centre, zoom);
    }
  }, [centre, zoom, map]);
  return null;
}

// Composant Principal
function Carte() {
  // États de l'application
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretProche, setArretProche] = useState(null);
  const [ligneSelectionnee, setLigneSelectionnee] = useState("Toutes"); // Filtre de l'exercice 3
  
  // États pour le contrôle de la carte (Initialisés avec DAKAR qui est bien déclaré en haut)
  const [centreCarte, setCentreCarte] = useState(DAKAR);
  const [zoomCarte, setZoomCarte] = useState(13);

  // Charger les arrêts depuis l'API Flask
  useEffect(() => {
    fetch("http://localhost:5000/arrets")
      .then((r) => r.json())
      .then((data) => setArrets(data))
      .catch((err) => console.error("Erreur chargement arrêts :", err));
  }, []);

  // Géolocalisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPositionUtilisateur([pos.coords.latitude, pos.coords.longitude]);
        },
        () => console.log("Géolocalisation refusée")
      );
    }
  }, []);

  // Exercice 3 : Extraction unique des lignes (Déclarée UNE SEULE FOIS ici)
  const toutesLesLignes = Array.from(
    new Set(arrets.flatMap((a) => a.lignes || []))
  ).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Exercice 3 : Filtrage des arrêts selon la ligne sélectionnée
  const arretsFiltres = arrets.filter((a) => {
    if (ligneSelectionnee === "Toutes") return true;
    return a.lignes && a.lignes.includes(ligneSelectionnee);
  });

  // Exercice 1 & 3 : Trouver l'arrêt le plus proche parmi les arrêts filtrés
  useEffect(() => {
    if (arretsFiltres.length > 0) {
      let proche = null;
      let dMin = Infinity;

      const maLat = positionUtilisateur ? positionUtilisateur[0] : DAKAR[0];
      const maLon = positionUtilisateur ? positionUtilisateur[1] : DAKAR[1];

      arretsFiltres.forEach((a) => {
        if (a.lat !== undefined && a.lon !== undefined) {
          const d = calculerDistance(maLat, maLon, a.lat, a.lon);
          if (d < dMin) {
            dMin = d;
            proche = { ...a, distance: d };
          }
        }
      });

      if (!proche) {
        proche = { ...arretsFiltres[0], distance: 0.0 };
      }
      setArretProche(proche);
    } else {
      setArretProche(null);
    }
  }, [positionUtilisateur, arretsFiltres]);

  return (
    <div className="carte-container">
      <h2 className="carte-titre">📍 Carte des arrêts</h2>
      
      {/* Interface Exercice 3 : Menu déroulant de filtrage */}
      <div className="filtre-container">
        <label htmlFor="select-ligne">🚌 Filtrer par ligne de bus : </label>
        <select
          id="select-ligne"
          value={ligneSelectionnee}
          onChange={(e) => setLigneSelectionnee(e.target.value)}
          className="select-ligne"
        >
          <option value="Toutes">-- Toutes les lignes --</option>
          {toutesLesLignes.map((ligne) => (
            <option key={ligne} value={ligne}>
              Ligne {ligne}
            </option>
          ))}
        </select>
      </div>

      {/* Infos de l'arrêt le plus proche + Bouton de l'Exercice 2 */}
      {arretProche && (
        <div className="arret-proche">
          <p>
            📢 <strong>Arrêt le plus proche :</strong> {arretProche.nom} ({arretProche.distance.toFixed(1)} km)
          </p>
          <button 
            onClick={() => {
              setCentreCarte([arretProche.lat, arretProche.lon]);
              setZoomCarte(16);
            }}
            className="btn-centrer"
          >
            🎯 Centrer sur l'arrêt proche
          </button>
        </div>
      )}

      {/* Cartographie Leaflet */}
      <MapContainer center={centreCarte} zoom={zoomCarte} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Gestionnaire d'auto-centrage de l'Exercice 2 */}
        <GestionnaireCarte centre={centreCarte} zoom={zoomCarte} />

        {/* Rendu des marqueurs filtrés (Exercice 3) */}
        {arretsFiltres.map((a) => {
          if (a.lat === undefined || a.lon === undefined) return null;
          const estLePlusProche = arretProche && arretProche.id === a.id;

          return (
            <Marker 
              key={a.id} 
              position={[a.lat, a.lon]}
              icon={estLePlusProche ? iconeArretProcheOrange : new L.Icon.Default()}
            >
              <Popup>
                <strong>{a.nom}</strong>
                {estLePlusProche && <span style={{ color: 'orange', fontWeight: 'bold' }}><br />🌟 L'arrêt le plus proche !</span>}
                <br />
                Lignes : {a.lignes ? a.lignes.join(", ") : "Non spécifiées"}
              </Popup>
            </Marker>
          );
        })}

        {/* Position GPS de l'utilisateur */}
        {positionUtilisateur && (
          <Marker position={positionUtilisateur} icon={iconeUtilisateurRouge}>
            <Popup><strong>📍 Vous êtes ici</strong></Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default Carte;