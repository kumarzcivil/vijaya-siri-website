import { v2 as cloudinary } from 'cloudinary';

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? '***set***' : 'MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? '***set***' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? '***set***' : 'MISSING',
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
