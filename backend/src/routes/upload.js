import { Router } from 'express';
import  auth  from '../middleware/auth.js';
import isAdmin from '../middleware/isAdmin.js';
import upload from '../middleware/upload.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

const router = Router();

router.post('/', auth, isAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
    const folder = req.body.folder || 'vijayasiri/services';
    const result = await uploadToCloudinary(req.file, folder);
    res.json({ success: true, data: { url: result.url, publicId: result.publicId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
