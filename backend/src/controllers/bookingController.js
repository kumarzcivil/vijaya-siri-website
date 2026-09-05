import { validationResult } from 'express-validator';
import bookingService from '../services/bookingService.js';

class BookingController {
  async list(req, res) {
    try {
      const bookings = await bookingService.list(req.query);
      res.json({ success: true, data: bookings });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const booking = await bookingService.getById(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      res.json({ success: true, data: booking });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const booking = await bookingService.create(req.body);
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async updateStatus(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const booking = await bookingService.updateStatus(req.params.id, req.body.status);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      res.json({ success: true, data: booking });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const booking = await bookingService.delete(req.params.id);
      if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
      res.json({ success: true, message: 'Booking deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await bookingService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new BookingController();
