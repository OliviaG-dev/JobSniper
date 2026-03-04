import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./Offres.css";

interface Job {
  id: string;
  title: string;
  company: string;
  link: string;
  source: string;
  postedAt: string;
  scrapedAt: string;
}

interface JobsData {
  updatedAt: string;
  jobs: Job[];
}

const SOURCE_LABELS: Record<string, string> = {
  indeed: "Indeed",
  wtj: "Welcome to the Jungle",
  hellowork: "HelloWork",
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.startsWith("il y a")) return dateStr;
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `il y a ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function Offres() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
   const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch("/jobs.json")
      .then((res) => res.json())
      .then((data: JobsData) => {
        setJobs(data.jobs);
        setUpdatedAt(data.updatedAt);
      })
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("jobsniper-applied");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      if (parsed && typeof parsed === "object") {
        // Avoid extra render if nothing changed
        const keysPrev = Object.keys(appliedMap);
        const keysNext = Object.keys(parsed);
        const sameLength = keysPrev.length === keysNext.length;
        const sameKeys =
          sameLength && keysPrev.every((k) => parsed[k] === appliedMap[k]);
        if (!sameKeys) {
          setAppliedMap(parsed);
        }
      }
    } catch {
      // ignore localStorage errors
    }
    // we only want to run this once on mount with the initial state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("jobsniper-applied", JSON.stringify(appliedMap));
    } catch {
      // ignore localStorage errors
    }
  }, [appliedMap]);

  const toggleApplied = (id: string) => {
    setAppliedMap((prev) => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  };

  const filtered = jobs
    .filter((job) => {
      if (job.title === "Offre" || job.title === "Emploi") return false;
      const matchSearch =
        !search ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.company.toLowerCase().includes(search.toLowerCase());
      const matchSource = sourceFilter === "all" || job.source === sourceFilter;
      return matchSearch && matchSource;
    })
    .sort((a, b) => {
      const dateA = new Date(a.scrapedAt).getTime();
      const dateB = new Date(b.scrapedAt).getTime();
      if (isNaN(dateA)) return 1;
      if (isNaN(dateB)) return -1;
      return dateB - dateA;
    });

  const activeJobs = filtered.filter((job) => !appliedMap[job.id]);

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(activeJobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginated = activeJobs.slice(startIndex, startIndex + pageSize);

  const sources = [...new Set(jobs.map((j) => j.source))];

  const renderJobCard = (job: Job) => {
    const isApplied = !!appliedMap[job.id];
    return (
      <li
        key={job.id}
        className={`offre-card ${isApplied ? "offre-card-applied" : ""}`}
      >
        <label className="offre-applied-toggle">
          <input
            type="checkbox"
            checked={isApplied}
            onChange={() => toggleApplied(job.id)}
          />
        </label>
        <div className="offre-info">
          <a
            href={job.link}
            target="_blank"
            rel="noopener noreferrer"
            className="offre-title"
          >
            {job.title}
          </a>
          <p className="offre-company">{job.company}</p>
        </div>
        <div className="offre-meta">
          <span className={`offre-source source-${job.source}`}>
            {SOURCE_LABELS[job.source] || job.source}
          </span>
          {job.postedAt && (
            <span className="offre-date">{timeAgo(job.postedAt)}</span>
          )}
          <span className="offre-scraped">{timeAgo(job.scrapedAt)}</span>
        </div>
      </li>
    );
  };

  return (
    <div className="offres-page">
      <nav className="offres-nav">
        <Link to="/" className="offres-logo">
          <img src="/logo.png" alt="" className="offres-logo-img" />
          <span>JobSniper</span>
        </Link>
        <Link to="/postulees" className="offres-nav-link">
          Postulées
        </Link>
      </nav>

      <div className="offres-header">
        <h1 className="offres-title">Offres</h1>
        {updatedAt && (
          <p className="offres-updated">
            Dernière mise à jour : {timeAgo(updatedAt)}
          </p>
        )}
      </div>

      <div className="offres-filters">
        <input
          type="text"
          className="offres-search"
          placeholder="Rechercher un poste, une entreprise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="offres-source-filters">
          <button
            className={`source-btn ${sourceFilter === "all" ? "active" : ""}`}
            onClick={() => setSourceFilter("all")}
          >
            Tous
          </button>
          {sources.map((s) => (
            <button
              key={s}
              className={`source-btn ${sourceFilter === s ? "active" : ""}`}
              onClick={() => setSourceFilter(s)}
            >
              {SOURCE_LABELS[s] || s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="offres-empty">Chargement...</p>
      ) : filtered.length === 0 ? (
        <p className="offres-empty">Aucune offre trouvée.</p>
      ) : (
        <>
          <p className="offres-count">{filtered.length} offres</p>
          <ul className="offres-list">
            {paginated.map(renderJobCard)}
          </ul>
          {totalPages > 1 && (
            <div className="offres-pagination">
              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                Précédent
              </button>
              <span className="page-info">
                Page {safePage} / {totalPages}
              </span>
              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Offres;
