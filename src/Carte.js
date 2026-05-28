import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Carte.css';

// Correctif pour résoudre le bug d'affichage des icônes par défaut de Leaflet avec React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
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

// Calculer la distance entre 2 points GPS (km)
function calculerDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // rayon de la Terre en km
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

function Carte() {
  const [arrets, setArrets] = useState([]);
  const [positionUtilisateur, setPositionUtilisateur] = useState(null);
  const [arretProche, setArretProche] = useState(null);
  const DAKAR = [14.6928, -17.4467];

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

  // Trouver l'arrêt le plus proche
  useEffect(() => {
    if (positionUtilisateur && arrets.length > 0) {
      let proche = null;
      let dMin = Infinity;

      arrets.forEach((a) => {
        // Adaptation stricte à lat et lon de ton fichier arrets.json
        if (a.lat !== undefined && a.lon !== undefined) {
          const d = calculerDistance(
            positionUtilisateur[0],
            positionUtilisateur[1],
            a.lat,
            a.lon
          );
          if (d < dMin) {
            dMin = d;
            proche = { ...a, distance: d };
          }
        }
      });
      setArretProche(proche);
    }
  }, [positionUtilisateur, arrets]);

  return (
    <div className="carte-container">
      <h2 className="carte-titre">
        📍 Carte des arrêts{" "}
        {arretProche && (
          <span className="info-proche-bulle">
            (Arrêt le plus proche : <strong>{arretProche.nom}</strong> à{" "}
            {arretProche.distance.toFixed(1)} km)
          </span>
        )}
      </h2>

      <MapContainer center={DAKAR} zoom={13} className="carte">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Affichage de tous les arrêts avec les clés lat et lon */}
        {arrets.map((a) => {
          if (a.lat === undefined || a.lon === undefined) return null;

          return (
            <Marker key={a.id} position={[a.lat, a.lon]}>
              <Popup>
                <strong>{a.nom}</strong>
                <br />
                Lignes : {a.lignes ? a.lignes.join(", ") : "Non spécifiées"}
              </Popup>
            </Marker>
          );
        })}

        {/* Affichage du marqueur de l'utilisateur */}
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