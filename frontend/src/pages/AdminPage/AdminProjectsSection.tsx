import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProjectsAPI,
  createProjectAPI,
  updateProjectAPI,
  deleteProjectAPI,
  type Project,
  type ProjectFormData,
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

function ImageUpload({
  previewUrl,
  onFileSelect,
  onRemove,
}: {
  previewUrl: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    e.target.value = '';
  };

  return (
    <div className="admin-project-upload">
      <div className="admin-project-upload-preview">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" draggable={false} />
        ) : (
          <span className="admin-hero-upload-empty">No image selected</span>
        )}
      </div>
      <div className="admin-hero-upload-actions">
        <label className="admin-btn admin-btn--upload">
          Choose Image
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="admin-hero-upload-input"
          />
        </label>
        {previewUrl && (
          <button className="admin-btn admin-btn--cancel" onClick={onRemove} type="button">
            Remove
          </button>
        )}
      </div>
      <p className="admin-hero-upload-note">
        JPG, PNG or WebP. Image will be resized to ~500KB and stored on Cloudinary.
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
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<ProjectForm>(EMPTY_FORM);
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState('');

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
    setCreateFile(null);
    setCreatePreview('');
    setApiError(null);
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setCreateForm(EMPTY_FORM);
    setCreateFile(null);
    setCreatePreview('');
  };

  const handleSaveCreate = async () => {
    setApiError(null);
    if (!createForm.name.trim()) { setApiError('Name is required'); return; }
    if (!createForm.location.trim()) { setApiError('Location is required'); return; }
    if (!createForm.city.trim()) { setApiError('City is required'); return; }

    setSaving(true);
    try {
      await createProjectAPI(createForm, createFile);
      setIsCreating(false);
      setCreateForm(EMPTY_FORM);
      setCreateFile(null);
      setCreatePreview('');
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
    setEditFile(null);
    setEditPreview(project.imageUrl);
    setApiError(null);
    setIsCreating(false);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditFile(null);
    setEditPreview('');
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setApiError(null);
    if (!editForm.name.trim()) { setApiError('Name is required'); return; }

    setSaving(true);
    try {
      await updateProjectAPI(editingId, editForm, editFile);
      setEditingId(null);
      setEditForm(EMPTY_FORM);
      setEditFile(null);
      setEditPreview('');
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

  const handleCreateFileSelect = (file: File) => {
    setCreateFile(file);
    setCreatePreview(URL.createObjectURL(file));
  };

  const handleEditFileSelect = (file: File) => {
    setEditFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const renderForm = (
    form: ProjectForm,
    setForm: (f: ProjectForm) => void,
    previewUrl: string,
    onFileSelect: (file: File) => void,
    onRemove: () => void,
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
        <span className="admin-field-label">Image</span>
        <ImageUpload previewUrl={previewUrl} onFileSelect={onFileSelect} onRemove={onRemove} />
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
          Manage featured projects. Images are uploaded to Cloudinary and resized to ~500KB.
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
              {renderForm(createForm, setCreateForm, createPreview, handleCreateFileSelect, () => { setCreateFile(null); setCreatePreview(''); })}
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
                {renderForm(editForm, setEditForm, editPreview, handleEditFileSelect, () => { setEditFile(null); setEditPreview(''); })}
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
