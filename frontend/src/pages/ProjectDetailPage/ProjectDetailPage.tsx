import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectAPI, type Project } from '../../api/projects';
import './ProjectDetailPage.css';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apiProject, setApiProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getProjectAPI(id)
      .then((res) => {
        if (res.success && res.data) {
          setApiProject(res.data.project);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const project = apiProject
    ? {
        id: apiProject._id,
        name: apiProject.name,
        location: apiProject.location,
        city: apiProject.city,
        type: apiProject.type,
        size: apiProject.size,
        bedrooms: apiProject.bedrooms,
        status: apiProject.status,
        statusLabel: apiProject.status === 'completed' ? 'Completed' : apiProject.status === 'in-progress' ? 'In Progress' : 'Upcoming',
        rating: apiProject.rating,
        imageUrl: apiProject.imageUrl,
        features: [apiProject.bedrooms, apiProject.type, apiProject.size].filter(Boolean),
        tags: apiProject.tags,
        featured: apiProject.featured,
        displayOrder: apiProject.displayOrder,
      }
    : null;

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="section-container">
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-detail-page">
        <div className="section-container">
          <div className="project-detail-not-found">
            <h2>Project Not Found</h2>
            <p>The project you are looking for does not exist.</p>
            <button className="project-detail-back" onClick={() => navigate('/projects')} type="button">
              Back to Projects
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    completed: 'pd-status--completed',
    'in-progress': 'pd-status--progress',
    upcoming: 'pd-status--upcoming',
  };

  return (
    <div className="project-detail-page">
      <div className="section-container">
        <button className="project-detail-back" onClick={() => navigate('/projects')} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Projects
        </button>

        <div className="pd-hero">
          <div className="pd-hero-image">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.name} />
            ) : (
              <div className="pd-hero-placeholder">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
            )}
            <span className={`pd-status ${statusColors[project.status] || ''}`}>
              {project.statusLabel}
            </span>
          </div>
        </div>

        <div className="pd-content">
          <div className="pd-main">
            <h1 className="pd-title">{project.name}</h1>
            <div className="pd-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {project.location}
            </div>

            <div className="pd-rating">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-rating)" stroke="var(--color-rating)" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{project.rating} / 5.0</span>
            </div>

            <div className="pd-tags">
              {project.features.map((feature, i) => (
                <span key={i} className="pd-tag">{feature}</span>
              ))}
            </div>
          </div>

          <div className="pd-sidebar">
            <div className="pd-info-card">
              <h3 className="pd-info-title">Project Details</h3>
              <div className="pd-info-row">
                <span className="pd-info-label">Type</span>
                <span className="pd-info-value">{project.type}</span>
              </div>
              <div className="pd-info-row">
                <span className="pd-info-label">Size</span>
                <span className="pd-info-value">{project.size}</span>
              </div>
              <div className="pd-info-row">
                <span className="pd-info-label">Bedrooms</span>
                <span className="pd-info-value">{project.bedrooms}</span>
              </div>
              <div className="pd-info-row">
                <span className="pd-info-label">Status</span>
                <span className="pd-info-value">{project.statusLabel}</span>
              </div>
              {project.tags.length > 0 && (
                <div className="pd-info-row">
                  <span className="pd-info-label">Tags</span>
                  <span className="pd-info-value">{project.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
