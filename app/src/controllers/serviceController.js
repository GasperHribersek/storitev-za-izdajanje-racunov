const {
  getServicesByUser,
  getServiceById,
  createService,
  updateService,
  deleteService
} = require('../models/serviceModel');

// Express middleware functions for route handlers
const getAllServices = async (req, res) => {
  try {
    const userId = req.session.userId;
    console.log('GET all services for user=', userId);
    const services = await getServicesByUser(userId);
    res.json(services);
  } catch (err) {
    console.error('Error fetching services:', err);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
};

const getService = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    console.log('GET service id=', id, 'for user=', userId);
    const service = await getServiceById(id, userId);
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(service);
  } catch (err) {
    console.error('Error fetching service:', err);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
};

const addService = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, description, amount, category } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const payload = { user_id: userId, name, description, amount, category };
    console.log('POST create service user=', userId, 'payload=', payload);
    const id = await createService(payload);
    res.status(201).json({ id, message: 'Service created' });
  } catch (err) {
    console.error('Error creating service:', err);
    res.status(500).json({ error: 'Failed to create service' });
  }
};

const editService = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    const { name, description, amount, category } = req.body;
    
    const payload = { name, description, amount, category };
    console.log('PUT update service id=', id, 'user=', userId, 'payload=', payload);
    const affected = await updateService(id, userId, payload);
    if (affected === 0) {
      return res.status(404).json({ error: 'Service not found or not authorized' });
    }
    res.json({ message: 'Service updated' });
  } catch (err) {
    console.error('Error updating service:', err);
    res.status(500).json({ error: 'Failed to update service' });
  }
};

const removeService = async (req, res) => {
  try {
    const userId = req.session.userId;
    const id = req.params.id;
    console.log('DELETE service id=', id, 'for user=', userId);
    const affected = await deleteService(id, userId);
    if (affected === 0) {
      return res.status(404).json({ error: 'Service not found or not authorized' });
    }
    res.json({ message: 'Service deleted' });
  } catch (err) {
    console.error('Error deleting service:', err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
};

module.exports = {
  getAllServices,
  getService,
  addService,
  editService,
  removeService
};
