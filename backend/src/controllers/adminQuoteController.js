import * as adminQuoteService from '../services/adminQuoteService.js';

export async function listQuotes(req, res) {
  try {
    const { page = 1, search = '', status, location } = req.query;
    const result = await adminQuoteService.listQuotes({
      page: parseInt(page, 10) || 1,
      search,
      status,
      location,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('List quotes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quotes' });
  }
}

export async function getQuote(req, res) {
  try {
    const quote = await adminQuoteService.getQuoteById(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    await adminQuoteService.markQuoteRead(req.params.id);
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quote' });
  }
}

export async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!['new', 'contacted', 'quoted', 'closed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const quote = await adminQuoteService.updateQuoteStatus(req.params.id, status);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Update quote status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update quote' });
  }
}

export async function updateNotes(req, res) {
  try {
    const { notes } = req.body;
    const quote = await adminQuoteService.addQuoteNotes(req.params.id, notes || '');
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Update quote notes error:', error);
    res.status(500).json({ success: false, message: 'Failed to update notes' });
  }
}

export async function deleteQuote(req, res) {
  try {
    const quote = await adminQuoteService.deleteQuote(req.params.id);
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    res.json({ success: true, message: 'Quote deleted' });
  } catch (error) {
    console.error('Delete quote error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete quote' });
  }
}

export async function getStats(req, res) {
  try {
    const stats = await adminQuoteService.getQuoteStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Quote stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
}
