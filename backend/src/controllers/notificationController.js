import { validationResult } from 'express-validator';
import notificationService from '../services/notificationService.js';

class NotificationController {
  async list(req, res) {
    try {
      const notifications = await notificationService.list(req.query);
      res.json({ success: true, data: notifications });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getById(req, res) {
    try {
      const notification = await notificationService.getById(req.params.id);
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      res.json({ success: true, data: notification });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async create(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      console.log('[Admin] Creating notification:', req.body.title);
      const notification = await notificationService.createAndPush(req.body);
      res.status(201).json({ success: true, data: notification });
    } catch (err) {
      console.error('[Admin] Create notification error:', err.message);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async markRead(req, res) {
    try {
      const notification = await notificationService.markRead(req.params.id);
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      res.json({ success: true, data: notification });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async markAllRead(req, res) {
    try {
      const customerId = req.user?.id || req.query.customerId || '';
      await notificationService.markAllRead(customerId);
      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async delete(req, res) {
    try {
      const notification = await notificationService.delete(req.params.id);
      if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
      res.json({ success: true, message: 'Notification deleted' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getStats(req, res) {
    try {
      const stats = await notificationService.getStats();
      res.json({ success: true, data: stats });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async subscribe(req, res) {
    try {
      const { endpoint, keys, customerId } = req.body;
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ success: false, message: 'Invalid subscription data' });
      }
      const sub = await notificationService.subscribe({
        endpoint,
        keys,
        customerId: customerId || '',
        userAgent: req.headers['user-agent'] || '',
      });
      res.json({ success: true, data: sub });
    } catch (err) {
      console.error('[Push] Subscribe error:', err.message);
      res.status(400).json({ success: false, message: err.message });
    }
  }

  async unsubscribe(req, res) {
    try {
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ success: false, message: 'Endpoint required' });
      await notificationService.unsubscribe(endpoint);
      res.json({ success: true, message: 'Unsubscribed' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  async getVapidKey(req, res) {
    const key = process.env.VAPID_PUBLIC_KEY || '';
    res.json({ success: true, data: { publicKey: key } });
  }

  async testPush(req, res) {
    try {
      const result = await notificationService.testPush(req.params.id);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default new NotificationController();
