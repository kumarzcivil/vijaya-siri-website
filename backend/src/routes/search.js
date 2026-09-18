import { Router } from 'express';
import searchService from '../services/searchService.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, data: { quickFix: [], proFix: [] } });
    }
    const results = await searchService.search(q);
    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

export default router;
