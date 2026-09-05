import * as estimateService from '../services/estimateService.js';
import * as estimatorConfigService from '../services/estimatorConfigService.js';

const createEstimate = async (req, res) => {
  try {
    const data = req.body;
    if (!data.estimateNumber) {
      const year = new Date().getFullYear();
      const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
      data.estimateNumber = `VS-EST-${year}-${rand}`;
    }
    const estimate = await estimateService.createEstimate(data);
    res.status(201).json({ success: true, message: 'Estimate saved', data: { estimate } });
  } catch (error) {
    console.error('CreateEstimate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getEstimateById = async (req, res) => {
  try {
    const { id } = req.params;
    const estimate = await estimateService.getEstimateById(id);
    if (!estimate) {
      return res.status(404).json({ success: false, message: 'Estimate not found' });
    }
    res.status(200).json({ success: true, data: { estimate } });
  } catch (error) {
    console.error('GetEstimateById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getEstimates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const result = await estimateService.getEstimates(filter, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('GetEstimates error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await estimateService.getEstimateById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Estimate not found' });
    }
    const estimate = await estimateService.updateEstimate(id, req.body);
    res.status(200).json({ success: true, message: 'Estimate updated', data: { estimate } });
  } catch (error) {
    console.error('UpdateEstimate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteEstimate = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await estimateService.getEstimateById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Estimate not found' });
    }
    await estimateService.deleteEstimate(id);
    res.status(200).json({ success: true, message: 'Estimate deleted' });
  } catch (error) {
    console.error('DeleteEstimate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { createEstimate, getEstimateById, getEstimates, updateEstimate, deleteEstimate };
