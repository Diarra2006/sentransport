import './Recherche.css';
// Ajout de Onclear dans les props recues
function Recherche({ valeur, onChange, onClear}) {
    return (
        <div className="recherche">
            <input type="text" className="recherche-input"
            placeholder="Rechercher une ligne (depart, arrivee)..." 
            value={valeur} onChange={e => onChange(e.target.value)} />
            {/* Ajout du bouton Effacer */}
            <button onClick={onClear} className='btn-effacer'>Effacer</button>

        </div>
    );
}
export default Recherche;
