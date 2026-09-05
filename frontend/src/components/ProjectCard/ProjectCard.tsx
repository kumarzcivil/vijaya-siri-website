import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

interface FeaturedProject {
  id: string;
  name: string;
  location: string;
  city: string;
  type: string;
  size: string;
  bedrooms: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  statusLabel: string;
  rating: number;
  imageUrl: string;
  features: string[];
  tags: string[];
  featured: boolean;
  displayOrder: number;
}

interface ProjectCardProps {
  project: FeaturedProject;
}

const statusColors: Record<string, string> = {
  completed: 'project-status--completed',
  'in-progress': 'project-status--progress',
  upcoming: 'project-status--upcoming',
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <article className="project-card">
      <div className="project-card-image">
        {project.imageUrl ? (
          <img src={project.imageUrl} alt={project.name} />
        ) : (
          <div className="project-card-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.25">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
        )}
        <span className={`project-status ${statusColors[project.status] || ''}`}>
          {project.statusLabel}
        </span>
      </div>
      <div className="project-card-body">
        <h3 className="project-card-name">{project.name}</h3>
        <div className="project-card-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {project.location}
        </div>
        <div className="project-card-meta">
          <span className="project-card-type">{project.type}</span>
          <span className="project-card-size">{project.size}</span>
        </div>
        <div className="project-card-features">
          {project.features.map((feature, i) => (
            <span key={i} className="project-feature-tag">{feature}</span>
          ))}
        </div>
        <div className="project-card-footer">
          <div className="project-card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--color-rating)" stroke="var(--color-rating)" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>{project.rating}</span>
          </div>
          <button
            className="project-card-cta"
            onClick={() => navigate(`/projects/${project.id}`)}
            type="button"
          >
            View Project
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
}
