import { validationResult } from 'express-validator';
import marketingServiceService from '../services/marketingServiceService.js';

class MarketingServiceController {
  async list(req, res) {
    try {
      const services = await marketingServiceService.list(req.query);
      res.json({ success: true, data: services });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const service = await marketingServiceService.getById(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, data: service });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const service = await marketingServiceService.create(req.body);
      res.status(201).json({ success: true, data: service });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const service = await marketingServiceService.update(req.params.id, req.body);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, data: service });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleStatus(req, res) {
    try {
      const service = await marketingServiceService.toggleStatus(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, data: service });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const service = await marketingServiceService.delete(req.params.id);
      if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
      res.json({ success: true, message: 'Service deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
      await marketingServiceService.reorder(orderedIds);
      const services = await marketingServiceService.list();
      res.json({ success: true, data: services });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await marketingServiceService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new MarketingServiceController();
