import { useEffect, useState, type ReactNode } from 'react';

interface BannerImageUploadProps {
  value: string;
  onChange: (image: string) => void;
  previewAspectRatio?: string;
  emptyLabel?: string;
  note?: ReactNode;
  tip?: ReactNode;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const MAX_DIMENSION = 1920;
const SMALL_WIDTH = 1000;
const SMALL_HEIGHT = 380;
const JPEG_QUALITY = 0.85;
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
          warning = `Image is small (${width} × ${height} px) and may look blurry or low quality in the Pro Fix Hero.`;
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
            warning = `Processed image is large (${formatSize(Math.round((dataUrl.length * 3) / 4))}). Large banners consume more browser storage.`;
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

export default function BannerImageUpload({
  value,
  onChange,
  previewAspectRatio = '1920 / 700',
  emptyLabel = '1920 × 700 template',
  note = (
    <>
      Recommended: 1920 × 700 px (2.74:1)
      <br />
      Use this size for consistent Pro Fix Hero templates.
      <br />
      Other image sizes are accepted, but may crop differently.
    </>
  ),
  tip = 'Tip: Keep important text, faces and products inside the center safe area for mobile and tablet.',
}: BannerImageUploadProps) {
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
    <div className="admin-hero-upload">
      <div className="admin-hero-upload-preview" style={{ aspectRatio: previewAspectRatio }} aria-label="Banner image preview">
        {previewSrc ? (
          <img src={previewSrc} alt="Banner image preview" draggable={false} />
        ) : (
          <span className="admin-hero-upload-empty">{emptyLabel}</span>
        )}
      </div>

      <div className="admin-hero-upload-actions">
        <label className="admin-btn admin-btn--upload">
          Choose image
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="admin-hero-upload-input"
            aria-label="Choose a banner image"
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

      {warning && <p className="admin-hero-upload-warning" role="status">{warning}</p>}

      <p className="admin-hero-upload-note">{note}</p>
      <p className="admin-hero-upload-tip">{tip}</p>
    </div>
  );
}