import * as estimatorTemplateService from '../services/estimatorTemplateService.js';

const getAllTemplates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.active !== undefined) filter.active = req.query.active === 'true';
    const templates = await estimatorTemplateService.getAllTemplates(filter);
    res.status(200).json({ success: true, data: { templates } });
  } catch (error) {
    console.error('GetAllTemplates error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await estimatorTemplateService.getTemplateById(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.status(200).json({ success: true, data: { template } });
  } catch (error) {
    console.error('GetTemplateById error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createTemplate = async (req, res) => {
  try {
    const template = await estimatorTemplateService.createTemplate(req.body);
    res.status(201).json({ success: true, message: 'Template created', data: { template } });
  } catch (error) {
    console.error('CreateTemplate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await estimatorTemplateService.getTemplateById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    const template = await estimatorTemplateService.updateTemplate(id, req.body);
    res.status(200).json({ success: true, message: 'Template updated', data: { template } });
  } catch (error) {
    console.error('UpdateTemplate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await estimatorTemplateService.getTemplateById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    await estimatorTemplateService.deleteTemplate(id);
    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    console.error('DeleteTemplate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const toggleActive = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await estimatorTemplateService.toggleActive(id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.status(200).json({ success: true, message: `Template ${template.active ? 'activated' : 'deactivated'}`, data: { template } });
  } catch (error) {
    console.error('ToggleActive error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const moveTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { direction } = req.body;
    if (direction !== 'up' && direction !== 'down') {
      return res.status(400).json({ success: false, message: 'direction must be "up" or "down"' });
    }
    const template = await estimatorTemplateService.moveTemplate(id, direction);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    res.status(200).json({ success: true, message: 'Template reordered', data: { template } });
  } catch (error) {
    console.error('MoveTemplate error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export { getAllTemplates, getTemplateById, createTemplate, updateTemplate, deleteTemplate, toggleActive, moveTemplate };
