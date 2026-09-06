import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProjectsAPI,
  createProjectAPI,
  updateProjectAPI,
  deleteProjectAPI,
  type Project,
  type ProjectFormData,
  type ProjectImage,
} from '../../api/projects';
import './AdminPage.css';

interface ProjectForm {
  name: string;
  location: string;
  city: string;
  type: string;
  size: string;
  bedrooms: string;
  status: string;
  rating: number;
  displayOrder: number;
  tags: string;
  featured: boolean;
}

const EMPTY_FORM: ProjectForm = {
  name: '',
  location: '',
  city: '',
  type: '',
  size: '',
  bedrooms: '',
  status: 'completed',
  rating: 0,
  displayOrder: 0,
  tags: '',
  featured: false,
};

interface ImageEntry {
  file: File;
  preview: string;
}

function MultiImageUpload({
  existingImages,
  newEntries,
  coverIndex,
  onAdd,
  onRemove,
  onRemoveExisting,
  onSetCover,
}: {
  existingImages: ProjectImage[];
  newEntries: ImageEntry[];
  coverIndex: number;
  onAdd: (files: File[]) => void;
  onRemove: (idx: number) => void;
  onRemoveExisting: (idx: number) => void;
  onSetCover: (idx: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const total = existingImages.length + newEntries.length;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 6 - total;
    if (remaining > 0) {
      onAdd(files.slice(0, remaining));
    }
    e.target.value = '';
  };

  return (
    <div className="admin-multi-upload">
      <div className="admin-multi-grid">
        {existingImages.map((img, idx) => (
          <div
            key={`existing-${idx}`}
            className={`admin-multi-thumb ${idx === coverIndex ? 'admin-multi-thumb--cover' : ''}`}
          >
            <img src={img.url} alt={`Image ${idx + 1}`} draggable={false} />
            <div className="admin-multi-actions">
              <button
                type="button"
                className="admin-multi-btn admin-multi-btn--cover"
                title={idx === coverIndex ? 'Cover image' : 'Set as cover'}
                onClick={() => onSetCover(idx)}
              >
                {idx === coverIndex ? '★' : '☆'}
              </button>
              <button
                type="button"
                className="admin-multi-btn admin-multi-btn--remove"
                title="Remove"
                onClick={() => onRemoveExisting(idx)}
              >
                ×
              </button>
            </div>
            {idx === coverIndex && <span className="admin-multi-cover-badge">Cover</span>}
          </div>
        ))}
        {newEntries.map((entry, idx) => {
          const globalIdx = existingImages.length + idx;
          return (
            <div
              key={`new-${idx}`}
              className={`admin-multi-thumb ${globalIdx === coverIndex ? 'admin-multi-thumb--cover' : ''}`}
            >
              <img src={entry.preview} alt={`New ${idx + 1}`} draggable={false} />
              <div className="admin-multi-actions">
                <button
                  type="button"
                  className="admin-multi-btn admin-multi-btn--cover"
                  title={globalIdx === coverIndex ? 'Cover image' : 'Set as cover'}
                  onClick={() => onSetCover(globalIdx)}
                >
                  {globalIdx === coverIndex ? '★' : '☆'}
                </button>
                <button
                  type="button"
                  className="admin-multi-btn admin-multi-btn--remove"
                  title="Remove"
                  onClick={() => onRemove(idx)}
                >
                  ×
                </button>
              </div>
              {globalIdx === coverIndex && <span className="admin-multi-cover-badge">Cover</span>}
            </div>
          );
        })}
        {total < 6 && (
          <label className="admin-multi-add">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleChange}
              className="admin-hero-upload-input"
            />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Image</span>
          </label>
        )}
      </div>
      <p className="admin-hero-upload-note">
        Up to 6 images. JPG, PNG or WebP. Click ☆ to set cover image. First image is used as cover by default.
      </p>
    </div>
  );
}

export default function AdminProjectsSection() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProjectForm>(EMPTY_FORM);
  const [editNewEntries, setEditNewEntries] = useState<ImageEntry[]>([]);
  const [editExistingImages, setEditExistingImages] = useState<ProjectImage[]>([]);
  const [editCoverIndex, setEditCoverIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<ProjectForm>(EMPTY_FORM);
  const [createNewEntries, setCreateNewEntries] = useState<ImageEntry[]>([]);
  const [createCoverIndex, setCreateCoverIndex] = useState(0);

  const fetchProjects = useCallback(async () => {
    try {
      setApiError(null);
      const res = await getProjectsAPI();
      if (res.success && res.data) {
        setProjects(res.data.projects);
      }
    } catch (err: any) {
      setApiError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setCreateForm({ ...EMPTY_FORM, displayOrder: projects.length ? Math.max(...projects.map(p => p.displayOrder)) + 1 : 1 });
    setCreateNewEntries([]);
    setCreateCoverIndex(0);
    setApiError(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setCreateForm(EMPTY_FORM);
    createNewEntries.forEach((e) => URL.revokeObjectURL(e.preview));
    setCreateNewEntries([]);
    setCreateCoverIndex(0);
  };

  const handleSaveCreate = async () => {
    setApiError(null);
    if (!createForm.name.trim()) { setApiError('Name is required'); return; }
    if (!createForm.location.trim()) { setApiError('Location is required'); return; }
    if (!createForm.city.trim()) { setApiError('City is required'); return; }

    setSaving(true);
    try {
      const files = createNewEntries.map((e) => e.file);
      await createProjectAPI(createForm, files.length > 0 ? files : null, createCoverIndex);
      setIsCreating(false);
      setCreateForm(EMPTY_FORM);
      createNewEntries.forEach((e) => URL.revokeObjectURL(e.preview));
      setCreateNewEntries([]);
      setCreateCoverIndex(0);
      await fetchProjects();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to create project');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (project: Project) => {
    setEditingId(project._id);
    setEditForm({
      name: project.name,
      location: project.location,
      city: project.city,
      type: project.type,
      size: project.size,
      bedrooms: project.bedrooms,
      status: project.status,
      rating: project.rating,
      displayOrder: project.displayOrder,
      tags: project.tags.join(', '),
      featured: project.featured,
    });
    const existing = project.images && project.images.length > 0 ? project.images : [];
    setEditExistingImages(existing);
    setEditNewEntries([]);
    const coverIdx = existing.findIndex((img) => img.isCover);
    setEditCoverIndex(coverIdx >= 0 ? coverIdx : 0);
    setApiError(null);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    editNewEntries.forEach((e) => URL.revokeObjectURL(e.preview));
    setEditNewEntries([]);
    setEditExistingImages([]);
    setEditCoverIndex(0);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setApiError(null);
    if (!editForm.name.trim()) { setApiError('Name is required'); return; }

    setSaving(true);
    try {
      const files = editNewEntries.map((e) => e.file);
      await updateProjectAPI(
        editingId,
        editForm,
        files.length > 0 ? files : null,
        editExistingImages,
        editCoverIndex
      );
      setEditingId(null);
      setEditForm(EMPTY_FORM);
      editNewEntries.forEach((e) => URL.revokeObjectURL(e.preview));
      setEditNewEntries([]);
      setEditExistingImages([]);
      setEditCoverIndex(0);
      await fetchProjects();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      setApiError(null);
      await deleteProjectAPI(id);
      await fetchProjects();
    } catch (err: any) {
      setApiError(err?.message || 'Failed to delete project');
    }
  };

  const handleViewProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleCreateAddImages = (files: File[]) => {
    const entries = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setCreateNewEntries((prev) => [...prev, ...entries]);
  };

  const handleCreateRemoveImage = (idx: number) => {
    setCreateNewEntries((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      const next = prev.filter((_, i) => i !== idx);
      if (createCoverIndex >= (editExistingImages.length + next.length)) {
        setCreateCoverIndex(0);
      }
      return next;
    });
  };

  const handleEditAddImages = (files: File[]) => {
    const entries = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setEditNewEntries((prev) => [...prev, ...entries]);
  };

  const handleEditRemoveImage = (idx: number) => {
    setEditNewEntries((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleEditRemoveExisting = (idx: number) => {
    setEditExistingImages((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (editCoverIndex >= next.length + editNewEntries.length) {
        setEditCoverIndex(0);
      }
      return next;
    });
  };

  const handleCreateSetCover = (idx: number) => setCreateCoverIndex(idx);
  const handleEditSetCover = (idx: number) => setEditCoverIndex(idx);

  const renderForm = (
    form: ProjectForm,
    setForm: (f: ProjectForm) => void,
    existingImages: ProjectImage[],
    newEntries: ImageEntry[],
    coverIndex: number,
    onAdd: (files: File[]) => void,
    onRemove: (idx: number) => void,
    onRemoveExisting: (idx: number) => void,
    onSetCover: (idx: number) => void,
  ) => (
    <div className="admin-edit-grid">
      <label className="admin-field">
        <span className="admin-field-label">Name *</span>
        <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Location *</span>
        <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="admin-input" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">City *</span>
        <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="admin-input" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Type</span>
        <input type="text" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="admin-input" placeholder="e.g. Residential Villa" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Size</span>
        <input type="text" value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className="admin-input" placeholder="e.g. 2,400 sq.ft" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Bedrooms</span>
        <input type="text" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} className="admin-input" placeholder="e.g. 4 BHK" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Status</span>
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="admin-input">
          <option value="completed">Completed</option>
          <option value="in-progress">In Progress</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Rating</span>
        <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })} className="admin-input" />
      </label>
      <label className="admin-field">
        <span className="admin-field-label">Display Order</span>
        <input type="number" min="0" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 0 })} className="admin-input" />
      </label>
      <label className="admin-field admin-field--wide">
        <span className="admin-field-label">Tags (comma-separated)</span>
        <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="admin-input" placeholder="villa, smart-home, premium" />
      </label>
      <label className="admin-field admin-field--wide">
        <span className="admin-field-label">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} style={{ marginRight: 6 }} />
          Featured project
        </span>
      </label>
      <div className="admin-field admin-field--wide">
        <span className="admin-field-label">Images (up to 6)</span>
        <MultiImageUpload
          existingImages={existingImages}
          newEntries={newEntries}
          coverIndex={coverIndex}
          onAdd={onAdd}
          onRemove={onRemove}
          onRemoveExisting={onRemoveExisting}
          onSetCover={onSetCover}
        />
      </div>
    </div>
  );

  const sorted = [...projects].sort((a, b) => a.displayOrder - b.displayOrder);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-header">
          <h1 className="admin-title">Projects</h1>
        </div>
        <div className="admin-projects-list">
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Projects</h1>
        <p className="admin-subtitle">
          Manage featured projects. Up to 6 images per project. Images are stored on Cloudinary.
        </p>
        <div className="admin-actions">
          {!isCreating && (
            <button className="admin-btn admin-btn--add" onClick={handleStartCreate} type="button">
              + New Project
            </button>
          )}
        </div>
      </div>

      {apiError && (
        <div className="login-error-banner" role="alert" style={{ marginBottom: '1rem' }}>
          {apiError}
        </div>
      )}

      <div className="admin-projects-list">
        {isCreating && (
          <div className="admin-project-row admin-project-row--create">
            <div className="admin-edit-form">
              {renderForm(
                createForm, setCreateForm,
                [], createNewEntries, createCoverIndex,
                handleCreateAddImages, handleCreateRemoveImage,
                () => {}, handleCreateSetCover
              )}
              <div className="admin-edit-actions">
                <button className="admin-btn admin-btn--save" onClick={handleSaveCreate} disabled={saving} type="button">
                  {saving ? 'Creating...' : 'Create Project'}
                </button>
                <button className="admin-btn admin-btn--cancel" onClick={handleCancelCreate} disabled={saving} type="button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {sorted.map((project) => (
          <div key={project._id} className={`admin-project-row ${project.featured ? 'admin-project-row--featured' : ''}`}>
            {editingId === project._id ? (
              <div className="admin-edit-form">
                {renderForm(
                  editForm, setEditForm,
                  editExistingImages, editNewEntries, editCoverIndex,
                  handleEditAddImages, handleEditRemoveImage,
                  handleEditRemoveExisting, handleEditSetCover
                )}
                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn--save" onClick={handleSaveEdit} disabled={saving} type="button">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="admin-btn admin-btn--cancel" onClick={handleCancelEdit} disabled={saving} type="button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-project-info">
                  <div className="admin-project-order">#{project.displayOrder}</div>
                  {project.imageUrl && (
                    <img src={project.imageUrl} alt={project.name} className="admin-project-thumb" />
                  )}
                  <div className="admin-project-details">
                    <h3 className="admin-project-name">{project.name}</h3>
                    <p className="admin-project-meta">
                      {project.type} &middot; {project.size} &middot; {project.location}
                    </p>
                    <p className="admin-project-meta">
                      {project.status} &middot; Rating: {project.rating} &middot; {project.bedrooms}
                    </p>
                    {project.images && project.images.length > 1 && (
                      <p className="admin-project-meta">{project.images.length} images</p>
                    )}
                  </div>
                  <span className={`admin-featured-badge ${project.featured ? 'admin-featured-badge--on' : ''}`}>
                    {project.featured ? 'Featured' : 'Hidden'}
                  </span>
                </div>
                <div className="admin-project-actions">
                  <button className="admin-btn admin-btn--view" onClick={() => handleViewProject(project._id)} type="button">
                    View
                  </button>
                  <button className="admin-btn admin-btn--edit" onClick={() => handleStartEdit(project)} type="button">
                    Edit
                  </button>
                  <button className="admin-btn admin-btn--delete" onClick={() => handleDelete(project._id)} type="button">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {!isCreating && projects.length === 0 && (
          <div className="admin-empty">
            <p>No projects yet. Click "+ New Project" to add one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
