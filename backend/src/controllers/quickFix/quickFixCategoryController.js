import { validationResult } from 'express-validator';
import quickFixCategoryService from '../../services/quickFixCategoryService.js';

class QuickFixCategoryController {
  async list(req, res) {
    try {
      const categories = await quickFixCategoryService.list(req.query);
      res.json({ success: true, data: categories });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const category = await quickFixCategoryService.getById(req.params.id);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      res.json({ success: true, data: category });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const category = await quickFixCategoryService.create(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const category = await quickFixCategoryService.update(req.params.id, req.body);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      res.json({ success: true, data: category });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleActive(req, res) {
    try {
      const category = await quickFixCategoryService.toggleActive(req.params.id);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      res.json({ success: true, data: category });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const category = await quickFixCategoryService.delete(req.params.id);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async reorder(req, res) {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
      await quickFixCategoryService.reorder(orderedIds);
      const categories = await quickFixCategoryService.list();
      res.json({ success: true, data: categories });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new QuickFixCategoryController();
