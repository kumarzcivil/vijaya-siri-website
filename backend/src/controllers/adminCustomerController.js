import * as adminCustomerService from '../services/adminCustomerService.js';

export async function listCustomers(req, res) {
  try {
    const { page = 1, search = '', status } = req.query;
    const result = await adminCustomerService.listCustomers({
      page: parseInt(page, 10) || 1,
      search,
      status,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('List customers error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customers' });
  }
}

export async function getCustomer(req, res) {
  try {
    const customer = await adminCustomerService.getCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch customer' });
  }
}

export async function toggleCustomer(req, res) {
  try {
    const customer = await adminCustomerService.toggleCustomerActive(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Toggle customer error:', error);
    res.status(500).json({ success: false, message: 'Failed to update customer' });
  }
}

export async function deleteCustomer(req, res) {
  try {
    const customer = await adminCustomerService.deleteCustomer(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete customer' });
  }
}

export async function getStats(req, res) {
  try {
    const stats = await adminCustomerService.getCustomerStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Customer stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
}
