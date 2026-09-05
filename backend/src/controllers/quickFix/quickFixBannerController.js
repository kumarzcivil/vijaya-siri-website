import { validationResult } from 'express-validator';
import quickFixBannerService from '../../services/quickFixBannerService.js';

class QuickFixBannerController {
  async list(req, res) {
    try {
      const banners = await quickFixBannerService.list(req.query);
      res.json({ success: true, data: banners });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const banner = await quickFixBannerService.getById(req.params.id);
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
      const banner = await quickFixBannerService.create(req.body);
      res.status(201).json({ success: true, data: banner });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const banner = await quickFixBannerService.update(req.params.id, req.body);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, data: banner });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleActive(req, res) {
    try {
      const banner = await quickFixBannerService.toggleActive(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, data: banner });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const banner = await quickFixBannerService.delete(req.params.id);
      if (!banner) return res.status(404).json({ success: false, message: 'Banner not found' });
      res.json({ success: true, message: 'Banner deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
      await quickFixBannerService.reorder(orderedIds);
      const banners = await quickFixBannerService.list();
      res.json({ success: true, data: banners });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await quickFixBannerService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new QuickFixBannerController();
