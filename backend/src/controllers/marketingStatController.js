import { validationResult } from 'express-validator';
import marketingStatService from '../services/marketingStatService.js';

class MarketingStatController {
  async list(req, res) {
    try {
      const stats = await marketingStatService.list(req.query);
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const stat = await marketingStatService.getById(req.params.id);
      if (!stat) return res.status(404).json({ success: false, message: 'Stat not found' });
      res.json({ success: true, data: stat });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const stat = await marketingStatService.create(req.body);
      res.status(201).json({ success: true, data: stat });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const stat = await marketingStatService.update(req.params.id, req.body);
      if (!stat) return res.status(404).json({ success: false, message: 'Stat not found' });
      res.json({ success: true, data: stat });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleStatus(req, res) {
    try {
      const stat = await marketingStatService.toggleStatus(req.params.id);
      if (!stat) return res.status(404).json({ success: false, message: 'Stat not found' });
      res.json({ success: true, data: stat });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const stat = await marketingStatService.delete(req.params.id);
      if (!stat) return res.status(404).json({ success: false, message: 'Stat not found' });
      res.json({ success: true, message: 'Stat deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
      await marketingStatService.reorder(orderedIds);
      const stats = await marketingStatService.list();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new MarketingStatController();
