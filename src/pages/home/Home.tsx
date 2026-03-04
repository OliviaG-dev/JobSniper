import "./Home.css";
import { Link } from "react-router";

function Home() {
  return (
    <div className="landing">
      <header className="hero">
        <nav className="nav">
          <img src="/logo.png" alt="" className="logo-img" />
          <span className="logo">JobSniper</span>
        </nav>
        <div className="hero-content">
          <p className="tagline">Arrête de chercher. Commence à sniper.</p>
          <h1 className="headline">
            Trouver un job ne devrait pas être un travail à plein temps.
          </h1>
          <p className="lead">
            JobSniper analyse et filtre les offres qui correspondent à ton
            profil. Moins de bruit, plus de pertinence.
          </p>
          <Link to="/offres" className="btn">
            Voir les offres
          </Link>
        </div>
      </header>
    </div>
  );
}

export default Home;
