import { validationResult } from 'express-validator';
import offerService from '../services/offerService.js';

class OfferController {
  async list(req, res) {
    try {
      const offers = await offerService.list(req.query);
      res.json({ success: true, data: offers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const offer = await offerService.getById(req.params.id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
      res.json({ success: true, data: offer });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const offer = await offerService.create(req.body);
      res.status(201).json({ success: true, data: offer });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const offer = await offerService.update(req.params.id, req.body);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
      res.json({ success: true, data: offer });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleStatus(req, res) {
    try {
      const offer = await offerService.toggleStatus(req.params.id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
      res.json({ success: true, data: offer });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const offer = await offerService.delete(req.params.id);
      if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
      res.json({ success: true, message: 'Offer deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await offerService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
      await offerService.reorder(orderedIds);
      const offers = await offerService.list();
      res.json({ success: true, data: offers });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new OfferController();
