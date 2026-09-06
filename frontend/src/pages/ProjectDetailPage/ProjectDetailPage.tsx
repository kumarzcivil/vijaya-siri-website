import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectAPI, type Project } from '../../api/projects';
import './ProjectDetailPage.css';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [apiProject, setApiProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getProjectAPI(id)
      .then((res) => { if (res.success && res.data) setApiProject(res.data.project); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const allImages = apiProject
    ? (apiProject.images && apiProject.images.length > 0
        ? apiProject.images.map((img) => img.url)
        : apiProject.imageUrl
          ? [apiProject.imageUrl]
          : [])
    : [];

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((i) => (i! - 1 + allImages.length) % allImages.length);
  }, [lightboxIndex, allImages.length]);
  const nextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((i) => (i! + 1) % allImages.length);
  }, [lightboxIndex, allImages.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, closeLightbox, prevImage, nextImage]);

  if (loading) {
    return (
      <div className="project-detail-page">
        <div className="section-container">
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!apiProject) {
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

        <h1 className="pd-title">{apiProject.name}</h1>

        <div className="pd-grid">
          {allImages.map((url, idx) => (
            <button
              key={idx}
              className="pd-grid-item"
              onClick={() => setLightboxIndex(idx)}
              type="button"
            >
              <img src={url} alt={`${apiProject.name} ${idx + 1}`} />
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div className="pd-lightbox" onClick={closeLightbox}>
          <div className="pd-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="pd-lightbox-close" onClick={closeLightbox} type="button">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {allImages.length > 1 && (
              <>
                <button className="pd-lightbox-prev" onClick={prevImage} type="button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button className="pd-lightbox-next" onClick={nextImage} type="button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}
            <img src={allImages[lightboxIndex]} alt={`${apiProject.name} ${lightboxIndex + 1}`} className="pd-lightbox-img" />
            <div className="pd-lightbox-counter">{lightboxIndex + 1} / {allImages.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
