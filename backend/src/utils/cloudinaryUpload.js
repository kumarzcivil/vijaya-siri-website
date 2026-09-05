import crypto from 'crypto';

const TARGET_SIZE_BYTES = 500 * 1024;

export async function uploadToCloudinary(file, folder = 'vijayasiri/services') {
  const sharp = (await import('sharp')).default;

  const processed = await sharp(file.buffer)
    .resize({ width: 1200, height: 800, fit: 'cover', withoutEnlargement: true })
    .jpeg({ quality: 80 })
    .toBuffer();

  let quality = 80;
  let buffer = processed;

  if (buffer.length > TARGET_SIZE_BYTES) {
    quality = Math.max(20, Math.floor((TARGET_SIZE_BYTES / buffer.length) * quality));
    buffer = await sharp(file.buffer)
      .resize({ width: 1200, height: 800, fit: 'cover', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials not configured in .env');
  }

  const timestamp = Math.round(Date.now() / 1000);
  const stringToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const signature = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

  const formData = new FormData();
  formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), 'image.jpg');
  formData.append('folder', folder);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const res = await fetch(url, { method: 'POST', body: formData });
  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error?.message || `Cloudinary upload failed with status ${res.status}`);
  }

  return { url: result.secure_url, publicId: result.public_id };
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return;

  const timestamp = Math.round(Date.now() / 1000);
  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const signature = Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, '0')).join('');

  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('api_key', apiKey);
  formData.append('signature', signature);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`;
  await fetch(url, { method: 'POST', body: formData });
}
