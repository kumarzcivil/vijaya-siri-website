import { useRef, useState } from 'react';
import { uploadImage } from '../../api/proFix';

interface ImageUploadProps {
  value: string;
  publicId?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: string;
}

export default function ImageUpload({ value, publicId, onChange, folder, label = 'Choose image', aspectRatio = '16/10' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG or WebP images are allowed');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const result = await uploadImage(file, folder);
      onChange(result.url, result.publicId);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('', '');
    setError(null);
  };

  return (
    <div className="admin-image-upload">
      <div className="admin-image-upload-preview" style={{ aspectRatio }}>
        {value ? (
          <img src={value} alt="" draggable={false} />
        ) : (
          <span className="admin-image-upload-empty">No image</span>
        )}
      </div>
      <div className="admin-image-upload-actions">
        <label className="admin-btn admin-btn--save" style={{ cursor: uploading ? 'wait' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
          {uploading ? 'Uploading...' : label}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={uploading}
          />
        </label>
        {value && (
          <button className="admin-btn admin-btn--cancel" onClick={handleRemove} type="button" disabled={uploading}>
            Remove
          </button>
        )}
      </div>
      {error && <p className="admin-image-upload-error">{error}</p>}
    </div>
  );
}
