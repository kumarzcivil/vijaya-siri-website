import { validationResult } from 'express-validator';
import couponService from '../services/couponService.js';

class CouponController {
  async list(req, res) {
    try {
      const coupons = await couponService.list(req.query);
      res.json({ success: true, data: coupons });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async listActive(req, res) {
    try {
      const coupons = await couponService.listActive();
      res.json({ success: true, data: coupons });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const coupon = await couponService.getById(req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: coupon });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const coupon = await couponService.create(req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async update(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const coupon = await couponService.update(req.params.id, req.body);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: coupon });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async toggleStatus(req, res) {
    try {
      const coupon = await couponService.toggleStatus(req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, data: coupon });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const coupon = await couponService.delete(req.params.id);
      if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found' });
      res.json({ success: true, message: 'Coupon deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async validate(req, res) {
    try {
      const { code, serviceType, orderAmount } = req.body;
      if (!code || !serviceType) {
        return res.status(400).json({ success: false, message: 'code and serviceType are required' });
      }
      const result = await couponService.validate(code, serviceType, orderAmount || 0);
      if (!result.valid) return res.status(400).json({ success: false, message: result.message });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await couponService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new CouponController();
