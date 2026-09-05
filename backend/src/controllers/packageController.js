import { validationResult } from 'express-validator';
import packageService from '../services/packageService.js';

class PackageController {
  async list(req, res) {
    try {
      const packages = await packageService.list(req.query);
      res.json({ success: true, data: packages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async listActive(req, res) {
    try {
      const packages = await packageService.getActive();
      res.json({ success: true, data: packages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const pkg = await packageService.getById(req.params.id);
      if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
      res.json({ success: true, data: pkg });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const pkg = await packageService.create(req.body);
      res.status(201).json({ success: true, data: pkg });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const pkg = await packageService.update(req.params.id, req.body);
      if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
      res.json({ success: true, data: pkg });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const pkg = await packageService.delete(req.params.id);
      if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
      res.json({ success: true, message: 'Package deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
      await packageService.reorder(orderedIds);
      const packages = await packageService.list();
      res.json({ success: true, data: packages });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await packageService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new PackageController();
