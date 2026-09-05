import Notification from '../models/Notification.js';
import PushSubscription from '../models/PushSubscription.js';
import webPush from 'web-push';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@vijayasiri.com';

// Validate and normalize TTL
const rawTtl = Number(process.env.PUSH_TTL || 86400);
const PUSH_TTL = Number.isFinite(rawTtl) && rawTtl >= 0 ? Math.floor(rawTtl) : 86400;
if (rawTtl !== PUSH_TTL) {
  console.warn(`[Push] PUSH_TTL adjusted to ${PUSH_TTL} seconds`);
}

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  console.log('[Push] VAPID configured, subject:', VAPID_SUBJECT);
  console.log('[Push] TTL:', PUSH_TTL, 'seconds');
} else {
  console.warn('[Push] VAPID keys not configured! Push notifications will not work.');
}

class NotificationService {
  async list(query = {}) {
    const filter = {};
    if (query.customerId) filter.customerId = query.customerId;
    if (query.category) filter.category = query.category;
    if (query.read !== undefined) filter.read = query.read === 'true';
    return Notification.find(filter).sort({ createdAt: -1 }).lean();
  }

  async getById(id) {
    return Notification.findById(id).lean();
  }

  async create(data) {
    const notification = new Notification(data);
    const saved = await notification.save();
    return saved;
  }

  async createAndPush(data) {
    console.log('[Push] Creating notification:', { title: data.title, category: data.category, customerId: data.customerId || '(broadcast)' });
    const notification = await this.create(data);
    console.log('[Push] Notification saved, id:', notification._id);

    if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
      await this.sendPush(notification);
    } else {
      console.warn('[Push] VAPID not configured, skipping push');
    }
    return notification;
  }

  async markRead(id) {
    return Notification.findByIdAndUpdate(id, { $set: { read: true } }, { returnDocument: 'after' }).lean();
  }

  async markAllRead(customerId) {
    const filter = { read: false };
    if (customerId) filter.customerId = customerId;
    await Notification.updateMany(filter, { $set: { read: true } });
  }

  async delete(id) {
    return Notification.findByIdAndDelete(id).lean();
  }

  async getStats() {
    const [total, unread] = await Promise.all([
      Notification.countDocuments(),
      Notification.countDocuments({ read: false }),
    ]);
    return { total, unread };
  }

  async sendPush(notification) {
    try {
      const filter = {};
      if (notification.customerId) filter.customerId = notification.customerId;
      const subscriptions = await PushSubscription.find(filter).lean();
      console.log('[Push] Found', subscriptions.length, 'subscriptions', notification.customerId ? `(for customer: ${notification.customerId})` : '(broadcast)');

      if (!subscriptions.length) {
        console.log('[Push] No subscriptions found, skipping push');
        return;
      }

      const validSubscriptions = subscriptions.filter((sub) => {
        if (!sub.keys?.p256dh || !sub.keys?.auth) {
          console.warn('[Push] Skipping subscription with missing keys:', sub.endpoint?.substring(0, 50));
          return false;
        }
        return true;
      });

      if (!validSubscriptions.length) {
        console.warn('[Push] No valid subscriptions (all missing keys)');
        return;
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        message: notification.message,
        category: notification.category,
        notificationId: notification._id.toString(),
        url: '/account/notifications',
      });

      console.log('[Push] TTL:', PUSH_TTL, 'seconds');
      console.log('[Push] Sending to', validSubscriptions.length, 'subscriptions...');

      const results = await Promise.allSettled(
        validSubscriptions.map((sub) =>
          webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
            payload,
            { TTL: PUSH_TTL }
          )
        )
      );

      const failedEndpoints = [];
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          console.log(`[Push] Success for sub ${i + 1}`);
        } else {
          const err = result.reason;
          const status = err?.statusCode;
          const body = err?.body || '';
          console.error(`[Push] Failed for sub ${i + 1}: status=${status} body=${body} message=${err?.message}`);
          if (status === 404 || status === 410) {
            failedEndpoints.push(validSubscriptions[i].endpoint);
          }
        }
      });

      if (failedEndpoints.length) {
        console.log('[Push] Removing', failedEndpoints.length, 'stale subscriptions');
        await PushSubscription.deleteMany({ endpoint: { $in: failedEndpoints } });
      }

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      console.log('[Push] Done:', successCount, 'succeeded,', results.length - successCount, 'failed');

      await Notification.findByIdAndUpdate(notification._id, { $set: { sent: true } });
    } catch (err) {
      console.error('[Push] sendPush error:', err.message);
    }
  }

  async testPush(subscriptionId) {
    try {
      let sub;
      if (subscriptionId) {
        sub = await PushSubscription.findById(subscriptionId).lean();
      } else {
        sub = await PushSubscription.findOne().lean();
      }

      if (!sub) {
        console.log('[Push-Test] No subscriptions found');
        return { success: false, message: 'No subscriptions found' };
      }

      if (!sub.keys?.p256dh || !sub.keys?.auth) {
        console.log('[Push-Test] Subscription missing keys');
        return { success: false, message: 'Subscription missing keys' };
      }

      const payload = JSON.stringify({
        title: 'Vijaya Siri Test',
        body: 'Push notification is working!',
        message: 'Push notification is working!',
        category: 'system',
        url: '/account/notifications',
      });

      console.log('[Push-Test] TTL:', PUSH_TTL, 'seconds');
      console.log('[Push-Test] Sending to:', sub.endpoint?.substring(0, 60) + '...');
      await webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } },
        payload,
        { TTL: PUSH_TTL }
      );

      console.log('[Push-Test] Success!');
      return { success: true, message: 'Push sent successfully' };
    } catch (err) {
      console.error('[Push-Test] Failed:', err.message, err.statusCode, err.body);
      return { success: false, message: err.message, statusCode: err.statusCode, body: err.body };
    }
  }

  async subscribe(data) {
    const { endpoint, keys, customerId } = data;
    console.log('[Push] Saving subscription:', { endpoint: endpoint?.substring(0, 60) + '...', p256dh: !!keys?.p256dh, auth: !!keys?.auth, customerId: customerId || '(none)' });
    return PushSubscription.findOneAndUpdate(
      { endpoint },
      {
        endpoint,
        keys,
        customerId: customerId || '',
        userAgent: data.userAgent || '',
      },
      { upsert: true, returnDocument: 'after' }
    ).lean();
  }

  async unsubscribe(endpoint) {
    return PushSubscription.findOneAndDelete({ endpoint });
  }
}

export default new NotificationService();
