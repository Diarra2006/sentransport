import './StatReseau.css';
function StatReseau({lignes}) {
    const totalLignes = lignes.length;
    const totalArrets = lignes.reduce((sum, ligne) => 
        sum + ligne.arrets , 0);
    const ligneMaxArrets = lignes.reduce((prev,current) => 
        (prev.arrets > current.arrets) ? prev : current);
    return (
        <div className="stat-reseau">
            <div className="stat-card">
                <h3>{totalLignes}</h3>
                <p>Lignes DDD</p>
            </div>
            <div className="stat-card">
                <h3>{totalArrets}</h3>
                <p>Arrets au total</p>
            </div>
            <div className="stat-card">
                <h3>Ligne {ligneMaxArrets.numero}</h3>
                <p>La plus longue {ligneMaxArrets.numero} arrets</p>
            </div>
        </div>
    );
}
export default StatReseau;
