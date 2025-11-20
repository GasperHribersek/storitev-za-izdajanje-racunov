const { getClientsByUser, getClientById, createClient, updateClient, deleteClient } = require('../models/clientModel');

// Get all clients for logged-in user
async function getAllClients(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not logged in' });
  
  try {
    console.log('GET all clients for user=', userId);
    const clients = await getClientsByUser(userId);
    res.json(clients);
  } catch (err) {
    console.error('Error getting clients:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Get single client
async function getClient(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not logged in' });
  
  const clientId = req.params.id;
  try {
    const client = await getClientById(clientId, userId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    console.error('Error getting client:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Create new client
async function addClient(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not logged in' });
  
  const { name, email, phone, address, tax_id } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  
  try {
    console.log('CREATE client for user=', userId, 'data=', req.body);
    const id = await createClient({ user_id: userId, name, email, phone, address, tax_id });
    res.status(201).json({ message: 'Client created', id });
  } catch (err) {
    console.error('Error creating client:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Update client
async function editClient(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not logged in' });
  
  const clientId = req.params.id;
  const { name, email, phone, address, tax_id } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  
  try {
    console.log('UPDATE client id=', clientId, 'for user=', userId);
    const affected = await updateClient({ id: clientId, name, email, phone, address, tax_id });
    if (affected === 0) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client updated' });
  } catch (err) {
    console.error('Error updating client:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Delete client
async function removeClient(req, res) {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not logged in' });
  
  const clientId = req.params.id;
  try {
    console.log('DELETE client id=', clientId, 'for user=', userId);
    const affected = await deleteClient(clientId);
    if (affected === 0) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) {
    console.error('Error deleting client:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports = {
  getAllClients,
  getClient,
  addClient,
  editClient,
  removeClient
};
