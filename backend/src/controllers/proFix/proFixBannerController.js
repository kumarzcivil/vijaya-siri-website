import { validationResult } from 'express-validator';
import proFixBannerService from '../../services/proFixBannerService.js';

class ProFixBannerController {
  async list(req, res) {
    try {
      const banners = await proFixBannerService.list(req.query);
      res.json({ success: true, data: banners });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const banner = await proFixBannerService.getById(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, data: banner });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const banner = await proFixBannerService.create(req.body);
      res.status(201).json({ success: true, data: banner });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const banner = await proFixBannerService.update(req.params.id, req.body);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, data: banner });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleStatus(req, res) {
    try {
      const banner = await proFixBannerService.toggleStatus(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, data: banner });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const banner = await proFixBannerService.delete(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, message: 'Banner deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await proFixBannerService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new ProFixBannerController();
