import './App.css';
import Header from './Header';
import ListeLignes from './ListeLignes';
import Footer from './Footer';
import StatReseau from './StatReseau';
function App() {
const lignes = [
{ id: 1, numero: "1", depart: "Parcelles Assainies",
arrivee: "Plateau",arrets: 14 , couleur:"#e74c3c"},
{ id: 2, numero: "7", depart: "Guediawaye",
arrivee: "Place Obe", arrets: 18 , couleur:"#f1bc0f"},
{ id: 3, numero: "15", depart: "Pikine",
arrivee: "Medina",arrets: 12 , couleur:"#3498"},
{ id: 4, numero: "23", depart: "Ouakam",
arrivee: "Grand Dakar", arrets: 10 , couleur:"#9b59b6"},
{ id: 5, numero: "8", depart: "Almadies",
arrivee: "Colobane",arrets: 16 , couleur:"#e67e22"},
{ id: 6, numero: "12", depart: "Yoff",
arrivee: "Sandaga",arrets: 11 , couleur:"#2ecc71"},
{ id: 7, numero: "10", depart: "Liberte 5",
arrivee: "Faan",arrets: 9 , couleur:"#cc2e5d"},
{ id: 8, numero: "20", depart: "Medina",
arrivee: "Dieuppeul",arrets: 12 , couleur:"#2eccc475"},
{ id: 9, numero: "18", depart: "Sicap",
arrivee: "HLM",arrets: 10 , couleur:"#ac2ecc"},
{ id: 10, numero: "14", depart: "Parcelle",
arrivee: "Ruffisque",arrets: 15 , couleur:"#a2cc2e"},
];
return (
<div className="App">
<Header />
<main className="contenu">
<StatReseau lignes={lignes} />
<ListeLignes lignes={lignes} />
</main>
<Footer />
</div>
);
}
export default App;

