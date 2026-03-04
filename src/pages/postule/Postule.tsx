import { useEffect, useState } from "react";
import { Link } from "react-router";
import "../offres/Offres.css";

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

function Postule() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
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
      if (!parsed || typeof parsed !== "object") return;
      const ids = Object.keys(parsed).filter((id) => parsed[id]);
      setAppliedIds(new Set(ids));
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const toggleApplied = (id: string) => {
    setAppliedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        const obj: Record<string, boolean> = {};
        next.forEach((jobId) => {
          obj[jobId] = true;
        });
        window.localStorage.setItem("jobsniper-applied", JSON.stringify(obj));
      } catch {
        // ignore localStorage errors
      }
      return next;
    });
  };

  const appliedJobs = jobs.filter((job) => appliedIds.has(job.id));

  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(appliedJobs.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const paginated = appliedJobs.slice(startIndex, startIndex + pageSize);

  return (
    <div className="offres-page">
      <nav className="offres-nav">
        <Link to="/" className="offres-logo">
          <img src="/logo.png" alt="" className="offres-logo-img" />
          <span>JobSniper</span>
        </Link>
        <Link to="/offres" className="offres-nav-link">
          Offres
        </Link>
      </nav>

      <div className="offres-header">
        <h1 className="offres-title">Postulées</h1>
        {updatedAt && (
          <p className="offres-updated">
            Dernière mise à jour : {timeAgo(updatedAt)}
          </p>
        )}
      </div>

      {loading ? (
        <p className="offres-empty">Chargement...</p>
      ) : appliedJobs.length === 0 ? (
        <p className="offres-empty">Aucune offre marquée comme postulée.</p>
      ) : (
        <>
          <p className="offres-count">{appliedJobs.length} offres postulées</p>
          <ul className="offres-list">
            {paginated.map((job) => (
              <li
                key={job.id}
                className="offre-card offre-card-applied"
              >
                <label className="offre-applied-toggle">
                  <input
                    type="checkbox"
                    checked={appliedIds.has(job.id)}
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
                    <span className="offre-date">
                      {timeAgo(job.postedAt)}
                    </span>
                  )}
                  <span className="offre-scraped">
                    {timeAgo(job.scrapedAt)}
                  </span>
                </div>
              </li>
            ))}
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

export default Postule;

