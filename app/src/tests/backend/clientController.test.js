const {
  getAllClients,
  getClient,
  addClient,
  editClient,
  removeClient
} = require('../../controllers/clientController');
const {
  getClientsByUser,
  getClientById,
  createClient,
  updateClient,
  deleteClient
} = require('../../models/clientModel');

// Mock the clientModel
jest.mock('../../models/clientModel');

describe('clientController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      session: { userId: 1 },
      body: {},
      params: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('getAllClients', () => {
    it('should return all clients for logged-in user', async () => {
      const mockClients = [
        { id: 1, name: 'Client 1', email: 'client1@example.com' },
        { id: 2, name: 'Client 2', email: 'client2@example.com' }
      ];
      getClientsByUser.mockResolvedValue(mockClients);

      await getAllClients(req, res);

      expect(getClientsByUser).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockClients);
    });

    it('should return 401 if user is not logged in', async () => {
      req.session.userId = null;

      await getAllClients(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not logged in' });
    });

    it('should return 500 on database error', async () => {
      getClientsByUser.mockRejectedValue(new Error('Database error'));

      await getAllClients(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('getClient', () => {
    it('should return a single client by id', async () => {
      const mockClient = { id: 1, name: 'Client 1', email: 'client1@example.com' };
      req.params.id = '1';
      getClientById.mockResolvedValue(mockClient);

      await getClient(req, res);

      expect(getClientById).toHaveBeenCalledWith('1', 1);
      expect(res.json).toHaveBeenCalledWith(mockClient);
    });

    it('should return 401 if user is not logged in', async () => {
      req.session.userId = null;
      req.params.id = '1';

      await getClient(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not logged in' });
    });

    it('should return 404 if client not found', async () => {
      req.params.id = '999';
      getClientById.mockResolvedValue(null);

      await getClient(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Client not found' });
    });

    it('should return 500 on database error', async () => {
      req.params.id = '1';
      getClientById.mockRejectedValue(new Error('Database error'));

      await getClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('addClient', () => {
    it('should create a new client successfully', async () => {
      req.body = {
        name: 'New Client',
        email: 'new@example.com',
        phone: '123456789',
        address: '123 Street',
        tax_id: 'TAX123'
      };
      createClient.mockResolvedValue(10);

      await addClient(req, res);

      expect(createClient).toHaveBeenCalledWith({
        user_id: 1,
        name: 'New Client',
        email: 'new@example.com',
        phone: '123456789',
        address: '123 Street',
        tax_id: 'TAX123'
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Client created',
        id: 10
      });
    });

    it('should return 401 if user is not logged in', async () => {
      req.session.userId = null;
      req.body = { name: 'New Client' };

      await addClient(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not logged in' });
    });

    it('should return 400 if name is missing', async () => {
      req.body = { email: 'new@example.com' };

      await addClient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name is required' });
    });

    it('should return 500 on database error', async () => {
      req.body = { name: 'New Client' };
      createClient.mockRejectedValue(new Error('Database error'));

      await addClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('editClient', () => {
    it('should update a client successfully', async () => {
      req.params.id = '1';
      req.body = {
        name: 'Updated Client',
        email: 'updated@example.com',
        phone: '987654321',
        address: '456 Avenue',
        tax_id: 'TAX456'
      };
      updateClient.mockResolvedValue(1);

      await editClient(req, res);

      expect(updateClient).toHaveBeenCalledWith({
        id: '1',
        name: 'Updated Client',
        email: 'updated@example.com',
        phone: '987654321',
        address: '456 Avenue',
        tax_id: 'TAX456'
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Client updated' });
    });

    it('should return 401 if user is not logged in', async () => {
      req.session.userId = null;
      req.params.id = '1';
      req.body = { name: 'Updated Client' };

      await editClient(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not logged in' });
    });

    it('should return 400 if name is missing', async () => {
      req.params.id = '1';
      req.body = { email: 'updated@example.com' };

      await editClient(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name is required' });
    });

    it('should return 404 if client not found', async () => {
      req.params.id = '999';
      req.body = { name: 'Updated Client' };
      updateClient.mockResolvedValue(0);

      await editClient(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Client not found' });
    });

    it('should return 500 on database error', async () => {
      req.params.id = '1';
      req.body = { name: 'Updated Client' };
      updateClient.mockRejectedValue(new Error('Database error'));

      await editClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });

  describe('removeClient', () => {
    it('should delete a client successfully', async () => {
      req.params.id = '1';
      deleteClient.mockResolvedValue(1);

      await removeClient(req, res);

      expect(deleteClient).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Client deleted' });
    });

    it('should return 401 if user is not logged in', async () => {
      req.session.userId = null;
      req.params.id = '1';

      await removeClient(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not logged in' });
    });

    it('should return 404 if client not found', async () => {
      req.params.id = '999';
      deleteClient.mockResolvedValue(0);

      await removeClient(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Client not found' });
    });

    it('should return 500 on database error', async () => {
      req.params.id = '1';
      deleteClient.mockRejectedValue(new Error('Database error'));

      await removeClient(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error',
        error: 'Database error'
      });
    });
  });
});
