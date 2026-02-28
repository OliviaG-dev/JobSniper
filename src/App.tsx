import './App.css'

function App() {
  return (
    <div className="landing">
      <header className="hero">
        <div className="hero-bg" aria-hidden="true" />
        <nav className="nav">
          <span className="logo">JobSniper</span>
        </nav>
        <div className="hero-content">
          <p className="tagline">Arrête de chercher. Commence à sniper.</p>
          <h1 className="headline">
            Trouver un job ne devrait pas être un travail à plein temps.
          </h1>
          <p className="lead">
            JobSniper analyse, filtre et détecte automatiquement les offres qui correspondent vraiment à ton profil.
          </p>
          <p className="sub">
            Plus besoin de scroller pendant des heures. Plus besoin de rater des opportunités.
          </p>
          <p className="cta-line">
            Tu vises. Tu postules. Tu avances.
          </p>
          <a href="#features" className="btn btn-primary">
            Découvrir comment ça marche
          </a>
        </div>
      </header>

      <section className="pitch" id="pitch">
        <div className="container">
          <h2 className="section-title">L'assistant intelligent de recherche d'emploi</h2>
          <p className="pitch-text">
            JobSniper scanne automatiquement les plateformes, filtre selon ton profil et te notifie uniquement les opportunités réellement pertinentes. L'objectif ? Faire gagner du temps aux candidats et augmenter leur taux de réponse grâce à une approche stratégique et data-driven.
          </p>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <h2 className="section-title">Ce que JobSniper fait pour toi</h2>
          <ul className="feature-grid">
            <li className="feature">
              <span className="feature-icon">🔎</span>
              <h3>Surveillance automatique des offres</h3>
              <p>Les plateformes sont scannées pour toi. Indeed, Welcome to the Jungle, HelloWork.</p>
            </li>
            <li className="feature">
              <span className="feature-icon">🎯</span>
              <h3>Matching intelligent</h3>
              <p>Filtrage selon ton profil : métier, région, télétravail.</p>
            </li>
            <li className="feature">
              <span className="feature-icon">📊</span>
              <h3>Suivi de candidatures</h3>
              <p>Garder la main sur tes candidatures et priorités.</p>
            </li>
            <li className="feature">
              <span className="feature-icon">⚡</span>
              <h3>Alertes rapides</h3>
              <p>Tu es notifié en premier sur les meilleures opportunités.</p>
            </li>
            <li className="feature">
              <span className="feature-icon">🧠</span>
              <h3>Optimisation stratégique</h3>
              <p>Passe du mode « chercheur » au mode « sniper ».</p>
            </li>
          </ul>
        </div>
      </section>

      <section className="bold-cta">
        <div className="container">
          <p className="bold-quote">
            80% des candidats postulent trop tard.<br />
            JobSniper t'aide à frapper en premier.
          </p>
          <p className="bold-sub">
            Repérage automatique. Filtrage intelligent. Candidature stratégique.<br />
            <strong>Sois celui qu'on appelle.</strong>
          </p>
        </div>
      </section>

      <section className="premium">
        <div className="container">
          <h2 className="section-title">Un avantage stratégique</h2>
          <p className="premium-text">
            JobSniper transforme la recherche d'emploi en avantage stratégique. Analyse automatisée des offres, matching précis, décisions guidées par la donnée. Parce que ta carrière mérite mieux que du hasard.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p className="footer-brand">JobSniper</p>
          <p className="footer-tagline">Arrête de chercher. Commence à sniper.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
