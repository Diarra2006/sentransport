import { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import Recherche from './Recherche';
import LigneBus from './LigneBus';
import DetailLigne from './DetailLigne';
import Footer from './Footer';

function App() {
  // 1. Déclaration de tous les états (States)
  const [lignes, setLignes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [recherche, setRecherche] = useState("");
  const [ligneSelectionnee, setLigneSelectionnee] = useState(null);

  // État du compteur de recherche (Statistiques)
  const [compteurRecherche, setCompteurRecherche] = useState(0);

  // 2. Définition de la fonction de chargement globale (Exercice 1)
  const chargerDonnees = () => {
    setChargement(true); // On réactive l'écran d'attente graphique
    setErreur(null);     // On efface l'ancienne erreur s'il y en avait une

    fetch("http://localhost:5000/lignes")
      .then(response => {
        if (!response.ok) {
          throw new Error("Erreur serveur : " + response.status);
        }
        return response.json();
      })
      .then(data => {
        setLignes(data);
        setChargement(false);
      })
      .catch(error => {
        setErreur(error.message);
        setChargement(false);
      });
  };

  // 3. Appel réseau automatique au montage initial de l'application
  useEffect(() => {
    chargerDonnees();
  }, []); // Le tableau de dépendances vide évite les boucles infinies d'appels HTTP

  // 🌟 FONCTION PLACÉE AU BON ENDROIT : À l'intérieur de App()
  const gererChangementRecherche = (valeurSaisie) => {
    setRecherche(valeurSaisie);
    setCompteurRecherche(prevCompteur => prevCompteur + 1);
  };

  // 4. Filtrage dynamique des lignes selon la saisie de l'utilisateur
  const lignesFiltrees = lignes.filter(l =>
    l.depart.toLowerCase().includes(recherche.toLowerCase()) ||
    l.arrivee.toLowerCase().includes(recherche.toLowerCase()) ||
    l.numero.includes(recherche)
  );

  // 5. Gestion du clic et récupération asynchrone des arrêts par ID (Exercice 3)
  const handleClickLigne = (ligne) => {
    // Si la ligne cliquée est déjà ouverte, on la referme au clic (dé-sélection)
    if (ligneSelectionnee && ligneSelectionnee.id === ligne.id) {
      setLigneSelectionnee(null);
    } else {
      // Appel dynamique à l'endpoint spécifique de Flask avec l'ID de la ligne
      fetch(`http://localhost:5000/lignes/${ligne.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error("Impossible de charger les détails (Statut : " + response.status + ")");
          }
          return response.json();
        })
        .then(data => {
          // data contient l'objet unique de la ligne enrichi de ses arrêts
          setLigneSelectionnee(data);
        })
        .catch(error => {
          console.error("Erreur lors du chargement des détails :", error);
          alert(error.message);
        });
    }
  };

  // 6. Rendu conditionnel : Écran d'attente (Chargement)
  if (chargement) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <p className="message-chargement">
            Chargement des lignes...
          </p>
        </main>
      </div>
    );
  }

  // 7. Rendu conditionnel : Écran d'interception des pannes réseau
  if (erreur) {
    return (
      <div className="App">
        <Header />
        <main className="contenu">
          <div className="message-erreur">
            <p>Impossible de charger les lignes.</p>
            <p className="erreur-detail" style={{ color: '#c0392b', fontWeight: 'bold' }}>{erreur}</p>
            <p>Vérifiez que le serveur Flask est bien lancé sur le port 5000 (python api/app.py).</p>

            {/* Bouton de secours pour relancer la connexion */}
            <button className="btn-recharger" onClick={chargerDonnees} style={{ marginTop: '15px' }}>
              🔄 Réessayer la connexion
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 8. Rendu principal (Affichage nominal de SénTransport)
  return (
    <div className="App">
      <Header />
      <main className="contenu">
        
        {/* Section d'affichage du compteur statistique */}
        <div className="Statistiques" style={{ textAlign: 'center', margin: '10px 0', color: '#7f8c8d' }}>
          <p>Vous avez effectué <strong>{compteurRecherche}</strong> recherche(s)</p>
        </div>
        
        {/* Barre de recherche */}
        <Recherche 
          valeur={recherche}
          onChange={gererChangementRecherche}
          onClear={() => setRecherche("")}
        />
        
        {/* Bouton de rafraîchissement manuel au milieu de la page */}
        <div style={{ textAlign: 'center', margin: '15px 0' }}>
          <button className="btn-recharger" onClick={chargerDonnees}>
            🔄 Recharger les lignes
          </button>
        </div>
        
        {/* Compteur dynamique des lignes trouvées après filtrage */}
        <p className="resultat-recherche">
          {lignesFiltrees.length} ligne{lignesFiltrees.length > 1 ? 's' : ''} trouvée{lignesFiltrees.length > 1 ? 's' : ''}
        </p>
        
        {/* Liste des lignes ou affichage d'un message vide */}
        {lignesFiltrees.length === 0 ? (
          <div className="message-vide" style={{ textAlign: 'center', padding: '20px', color: '#e74c3c' }}>
            <p>Aucune ligne trouvée pour votre recherche.</p>
          </div>
        ) : (
          lignesFiltrees.map(ligne => (
            <LigneBus
              key={ligne.id}
              numero={ligne.numero}
              depart={ligne.depart}
              arrivee={ligne.arrivee}
              arrets={ligne.arrets}
              estSelectionnee={ligneSelectionnee && ligneSelectionnee.id === ligne.id}
              onClick={() => handleClickLigne(ligne)}
            />
          ))
        )}

        {/* Zone d'affichage détaillé de la ligne sélectionnée */}
        {ligneSelectionnee && <DetailLigne ligne={ligneSelectionnee} />}
        
      </main>
      <Footer />
    </div>
  );
}

export default App;