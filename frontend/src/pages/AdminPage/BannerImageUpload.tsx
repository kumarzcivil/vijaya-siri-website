import { useEffect, useState, type ReactNode } from 'react';
import { uploadImage } from '../../api/proFix';

interface BannerImageUploadProps {
  value: string;
  onChange: (image: string) => void;
  folder?: string;
  previewAspectRatio?: string;
  emptyLabel?: string;
  note?: ReactNode;
  tip?: ReactNode;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function BannerImageUpload({
  value,
  onChange,
  folder = 'vijayasiri/banners',
  previewAspectRatio = '1920 / 700',
  emptyLabel = '1920 × 700 template',
  note = (
    <>
      Recommended: 1920 × 700 px (2.74:1)
      <br />
      Use this size for consistent hero templates.
      <br />
      Other image sizes are accepted, but may crop differently.
    </>
  ),
  tip = 'Tip: Keep important text, faces and products inside the center safe area for mobile and tablet.',
}: BannerImageUploadProps) {
  const [previewSrc, setPreviewSrc] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  useEffect(() => {
    setPreviewSrc((prev) => (prev === value ? prev : value));
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPG, PNG or WebP images are supported.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file, folder);
      setPreviewSrc(result.url);
      onChange(result.url);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewSrc(url);
    onChange(url);
  };

  const handleRemove = () => {
    setPreviewSrc('');
    setError(null);
    onChange('');
  };

  return (
    <div className="admin-hero-upload">
      <div className="admin-hero-upload-preview" style={{ aspectRatio: previewAspectRatio }} aria-label="Banner image preview">
        {previewSrc ? (
          <img src={previewSrc} alt="Banner image preview" draggable={false} />
        ) : (
          <span className="admin-hero-upload-empty">{uploading ? 'Uploading...' : emptyLabel}</span>
        )}
      </div>

      <div className="admin-hero-upload-actions">
        <label className="admin-btn admin-btn--upload" style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          {uploading ? 'Uploading...' : 'Choose image'}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="admin-hero-upload-input"
            aria-label="Choose a banner image"
            disabled={uploading}
          />
        </label>
        {previewSrc && (
          <button className="admin-btn admin-btn--cancel admin-hero-upload-remove" onClick={handleRemove} type="button" disabled={uploading}>
            Remove
          </button>
        )}
        <button
          className="admin-hero-upload-url-toggle"
          onClick={() => setShowUrlField((v) => !v)}
          type="button"
        >
          {showUrlField ? 'Hide image URL' : 'Or paste image URL'}
        </button>
      </div>

      {showUrlField && (
        <input
          type="text"
          className="admin-input admin-hero-upload-url"
          placeholder="https://..."
          value={previewSrc.startsWith('data:') ? '' : previewSrc}
          onChange={handleUrlChange}
          aria-label="Paste an image URL"
        />
      )}

      {error && <p className="admin-hero-upload-warning" role="status">{error}</p>}

      <p className="admin-hero-upload-note">{note}</p>
      <p className="admin-hero-upload-tip">{tip}</p>
    </div>
  );
}
