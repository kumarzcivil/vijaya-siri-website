import { useEffect, useState } from 'react';

interface ProjectImageUploadProps {
  value: string;
  onChange: (image: string) => void;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const MAX_DIMENSION = 1600;
const SMALL_WIDTH = 800;
const SMALL_HEIGHT = 500;
const JPEG_QUALITY = 0.82;
const LARGE_DATA_URL_LENGTH = 2_500_000;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ProcessedImage {
  dataUrl: string;
  warning: string | null;
}

function processImageFile(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the selected file.'));
    reader.onload = () => {
      const source = String(reader.result);
      const img = new Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        let warning: string | null = null;
        if (width < SMALL_WIDTH || height < SMALL_HEIGHT) {
          warning = `Image is small (${width} × ${height} px) and may look blurry or low quality in the project layout.`;
        }

        const scale = Math.min(1, MAX_DIMENSION / width, MAX_DIMENSION / height);
        const targetWidth = Math.max(1, Math.round(width * scale));
        const targetHeight = Math.max(1, Math.round(height * scale));

        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas is not available.');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

          if (dataUrl.length > LARGE_DATA_URL_LENGTH) {
            warning = `Processed image is large (${formatSize(Math.round((dataUrl.length * 3) / 4))}). Large images consume more browser storage.`;
          }

          resolve({ dataUrl, warning });
        } catch {
          resolve({ dataUrl: source, warning });
        }
      };
      img.onerror = () => reject(new Error('The selected file could not be read as an image.'));
      img.src = source;
    };
    reader.readAsDataURL(file);
  });
}

export default function ProjectImageUpload({ value, onChange }: ProjectImageUploadProps) {
  const [previewSrc, setPreviewSrc] = useState(value || '');
  const [fileName, setFileName] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);

  useEffect(() => {
    setPreviewSrc((prev) => (prev === value ? prev : value));
  }, [value]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setWarning('Only JPG, PNG or WebP images are supported.');
      setFileName(null);
      return;
    }

    setWarning(null);
    try {
      const processed = await processImageFile(file);
      setPreviewSrc(processed.dataUrl);
      setFileName(file.name);
      setWarning(processed.warning);
      onChange(processed.dataUrl);
    } catch {
      setWarning('Could not process this image. Please try another file.');
      setFileName(null);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPreviewSrc(url);
    setFileName(null);
    onChange(url);
  };

  const handleRemove = () => {
    setPreviewSrc('');
    setFileName(null);
    setWarning(null);
    onChange('');
  };

  return (
    <div className="admin-project-upload admin-hero-upload">
      <div className="admin-project-upload-preview" aria-label="Project image preview">
        {previewSrc ? (
          <img src={previewSrc} alt="Project image preview" draggable={false} />
        ) : (
          <span className="admin-hero-upload-empty">No image selected</span>
        )}
      </div>

      <div className="admin-hero-upload-actions">
        <label className="admin-btn admin-btn--upload">
          Upload Image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="admin-hero-upload-input"
            aria-label="Upload a project image"
          />
        </label>
        {fileName && <span className="admin-hero-upload-file">{fileName}</span>}
        {previewSrc && (
          <button className="admin-btn admin-btn--cancel admin-hero-upload-remove" onClick={handleRemove} type="button">
            Remove
          </button>
        )}
        <button
          className="admin-hero-upload-url-toggle"
          onClick={() => setShowUrlField((v) => !v)}
          type="button"
        >
          {showUrlField ? 'Hide image URL' : 'Or use image URL'}
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

      {warning && <p className="admin-hero-upload-warning" role="status">{warning}</p>}

      <p className="admin-hero-upload-note">
        Use a clear project image. JPG, PNG or WebP recommended.
        <br />
        Different image sizes are supported; the site will crop the
        image to fit the project layout.
      </p>
    </div>
  );
}
