import Quote from '../models/Quote.js';

export async function submitQuote(req, res) {
  try {
    const {
      fullName, mobile, whatsapp, email,
      projectDescription, projectLocation, projectType,
      area, budget, message,
    } = req.body;

    const quote = await Quote.create({
      fullName,
      mobile,
      whatsapp: whatsapp || '',
      email,
      projectDescription: projectDescription || '',
      projectLocation,
      projectType,
      area: area || undefined,
      budget: budget || '',
      message: message || '',
    });

    res.status(201).json({
      success: true,
      message: 'Quote request submitted successfully',
      data: {
        refId: quote.refId,
        _id: quote._id,
      },
    });
  } catch (error) {
    console.error('Submit quote error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({ success: false, message: 'Validation failed', errors });
    }
    res.status(500).json({ success: false, message: 'Failed to submit quote request' });
  }
}

export async function getQuoteByRef(req, res) {
  try {
    const quote = await Quote.findOne({ refId: req.params.refId });
    if (!quote) {
      return res.status(404).json({ success: false, message: 'Quote not found' });
    }
    res.json({ success: true, data: quote });
  } catch (error) {
    console.error('Get quote error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch quote' });
  }
}
