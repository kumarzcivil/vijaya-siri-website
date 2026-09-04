import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects, saveProjects, updateProject, addProject, resetProjects } from '../../data';
import type { FeaturedProject } from '../../data';
import ProjectImageUpload from './ProjectImageUpload';
import './AdminPage.css';

export default function AdminProjectsSection() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<FeaturedProject[]>(() => getProjects());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<FeaturedProject>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<FeaturedProject>>({});

  const handleToggleFeatured = useCallback((id: string) => {
    const current = projects.find((p) => p.id === id);
    if (!current) return;
    const updated = updateProject(id, { featured: !current.featured });
    setProjects(updated);
  }, [projects]);

  const handleMoveUp = useCallback((id: string) => {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx <= 0) return;
    const swapped = [...projects];
    const tempOrder = swapped[idx].displayOrder;
    swapped[idx] = { ...swapped[idx], displayOrder: swapped[idx - 1].displayOrder };
    swapped[idx - 1] = { ...swapped[idx - 1], displayOrder: tempOrder };
    saveProjects(swapped);
    setProjects([...swapped]);
  }, [projects]);

  const handleMoveDown = useCallback((id: string) => {
    const idx = projects.findIndex((p) => p.id === id);
    if (idx < 0 || idx >= projects.length - 1) return;
    const swapped = [...projects];
    const tempOrder = swapped[idx].displayOrder;
    swapped[idx] = { ...swapped[idx], displayOrder: swapped[idx + 1].displayOrder };
    swapped[idx + 1] = { ...swapped[idx + 1], displayOrder: tempOrder };
    saveProjects(swapped);
    setProjects([...swapped]);
  }, [projects]);

  const handleStartEdit = useCallback((project: FeaturedProject) => {
    setEditingId(project.id);
    setEditForm({ ...project });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditForm({});
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingId || !editForm) return;
    const updated = updateProject(editingId, editForm);
    setProjects(updated);
    setEditingId(null);
    setEditForm({});
  }, [editingId, editForm]);

  const handleViewProject = useCallback((id: string) => {
    navigate(`/projects/${id}`);
  }, [navigate]);

  const handleStartCreate = useCallback(() => {
    setIsCreating(true);
    setEditingId(null);
    setEditForm({});
    setCreateForm({
      name: '',
      location: '',
      city: '',
      type: '',
      size: '',
      bedrooms: '',
      status: 'completed',
      rating: 0,
      imageUrl: '',
      tags: [],
      featured: true,
      displayOrder: projects.length ? Math.max(...projects.map((p) => p.displayOrder)) + 1 : 1,
    });
  }, [projects]);

  const handleCancelCreate = useCallback(() => {
    setIsCreating(false);
    setCreateForm({});
  }, []);

  const handleSaveCreate = useCallback(() => {
    if (!createForm) return;
    const updated = addProject(createForm);
    setProjects(updated);
    setIsCreating(false);
    setCreateForm({});
  }, [createForm]);

  const handleReset = useCallback(() => {
    const reset = resetProjects();
    setProjects(reset);
  }, []);

  const renderForm = (
    form: Partial<FeaturedProject>,
    setForm: (f: Partial<FeaturedProject>) => void
  ) => (
    <div className="admin-edit-grid">
        <label className="admin-field">
          <span className="admin-field-label">Name</span>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Location</span>
          <input
            type="text"
            value={form.location || ''}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">City</span>
          <input
            type="text"
            value={form.city || ''}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Type</span>
          <input
            type="text"
            value={form.type || ''}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Size</span>
          <input
            type="text"
            value={form.size || ''}
            onChange={(e) => setForm({ ...form, size: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Bedrooms</span>
          <input
            type="text"
            value={form.bedrooms || ''}
            onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
            className="admin-input"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Status</span>
          <select
            value={form.status || 'completed'}
            onChange={(e) => setForm({ ...form, status: e.target.value as FeaturedProject['status'] })}
            className="admin-input"
          >
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Rating</span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating ?? 0}
            onChange={(e) => setForm({ ...form, rating: parseFloat(e.target.value) || 0 })}
            className="admin-input"
          />
        </label>
        <label className="admin-field">
          <span className="admin-field-label">Display Order</span>
          <input
            type="number"
            min="1"
            value={form.displayOrder ?? 1}
            onChange={(e) => setForm({ ...form, displayOrder: parseInt(e.target.value) || 1 })}
            className="admin-input"
          />
        </label>
        <label className="admin-field admin-field--wide">
          <span className="admin-field-label">Tags (comma-separated)</span>
          <input
            type="text"
            value={(form.tags || []).join(', ')}
            onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
            className="admin-input"
          />
        </label>
        <div className="admin-field admin-field--wide">
          <span className="admin-field-label">Image</span>
          <ProjectImageUpload
            value={form.imageUrl || ''}
            onChange={(image) => setForm({ ...form, imageUrl: image })}
          />
        </div>
      </div>
  );

  const sorted = [...projects].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Project Admin</h1>
        <p className="admin-subtitle">
          Manage featured projects displayed on the Projects page.
          Changes are saved to browser storage.
        </p>
        <div className="admin-actions">
          <button className="admin-btn admin-btn--add" onClick={handleStartCreate} type="button">
            + New Project
          </button>
          <button className="admin-btn admin-btn--reset" onClick={handleReset} type="button">
            Reset to Defaults
          </button>
        </div>
      </div>

      <div className="admin-projects-list">
        {isCreating && (
          <div className="admin-project-row admin-project-row--create">
            <div className="admin-edit-form">
              {renderForm(createForm, setCreateForm)}
              <div className="admin-edit-actions">
                <button className="admin-btn admin-btn--save" onClick={handleSaveCreate} type="button">
                  Create Project
                </button>
                <button className="admin-btn admin-btn--cancel" onClick={handleCancelCreate} type="button">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {sorted.map((project) => (
          <div
            key={project.id}
            className={`admin-project-row ${project.featured ? 'admin-project-row--featured' : ''}`}
          >
            {editingId === project.id ? (
              <div className="admin-edit-form">
                {renderForm(editForm, setEditForm)}
                <div className="admin-edit-actions">
                  <button className="admin-btn admin-btn--save" onClick={handleSaveEdit} type="button">
                    Save Changes
                  </button>
                  <button className="admin-btn admin-btn--cancel" onClick={handleCancelEdit} type="button">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="admin-project-info">
                  <div className="admin-project-order">#{project.displayOrder}</div>
                  <div className="admin-project-details">
                    <h3 className="admin-project-name">{project.name}</h3>
                    <p className="admin-project-meta">
                      {project.type} &middot; {project.size} &middot; {project.location}
                    </p>
                  </div>
                  <span className={`admin-featured-badge ${project.featured ? 'admin-featured-badge--on' : ''}`}>
                    {project.featured ? 'Featured' : 'Hidden'}
                  </span>
                </div>
                <div className="admin-project-actions">
                  <button
                    className="admin-btn admin-btn--toggle"
                    onClick={() => handleToggleFeatured(project.id)}
                    type="button"
                  >
                    {project.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMoveUp(project.id)}
                    disabled={project.displayOrder <= 1}
                    type="button"
                    aria-label="Move up"
                  >
                    &#9650;
                  </button>
                  <button
                    className="admin-btn admin-btn--move"
                    onClick={() => handleMoveDown(project.id)}
                    type="button"
                    aria-label="Move down"
                  >
                    &#9660;
                  </button>
                  <button
                    className="admin-btn admin-btn--view"
                    onClick={() => handleViewProject(project.id)}
                    type="button"
                  >
                    View Project
                  </button>
                  <button
                    className="admin-btn admin-btn--edit"
                    onClick={() => handleStartEdit(project)}
                    type="button"
                  >
                    Edit
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
