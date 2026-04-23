import './App.css';
import Header from './Header';
import Footer from './Footer';
import Statistique from './Statistique';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="contenu">
      <h1>Bienvenue sur SenTransport</h1>
      <p>Le transport en commun a Dakar</p>
      <section className='Stat-container'>
          <Statistique />
          <Statistique />
          <Statistique />
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
