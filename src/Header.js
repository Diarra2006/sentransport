import './Header.css';

function Header() {
    const dateJour = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return (
        <header className='header'>
            <h1 className='header-titre'>SenTransport</h1>
            <p className='header-soustitre'>
                Votre guide du transport en commun a Dakar
            </p>
            <p className='header-date'>Date du Jour : {dateJour}</p>
        </header>
    );
}

export default Header;
