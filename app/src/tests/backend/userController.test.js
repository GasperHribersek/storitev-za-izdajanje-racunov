// Mock database config before any imports
jest.mock('../../../config/db', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { registerUser, loginUser } = require('../../controllers/userController');
const User = require('../../models/userModel');
const bcrypt = require('bcrypt');

// Mock the User model
jest.mock('../../models/userModel');
jest.mock('bcrypt');

describe('userController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      session: {}
    };
    res = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      User.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword');
      User.create.mockResolvedValue(1);

      await registerUser(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      expect(req.session.userId).toBe(1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Registration successful',
        userId: 1
      });
    });

    it('should return 400 if email already exists', async () => {
      req.body = { name: 'Test User', email: 'existing@example.com', password: 'password123' };
      User.findByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Email already registered'
      });
    });

    it('should return 500 on database error', async () => {
      req.body = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      User.findByEmail.mockRejectedValue(new Error('Database error'));

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error'
      });
    });

    it('should hash password with bcrypt', async () => {
      req.body = { name: 'Test User', email: 'test@example.com', password: 'plainPassword' };
      User.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      User.create.mockResolvedValue(2);

      await registerUser(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPassword', 10);
      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashedPassword123' })
      );
    });
  });

  describe('loginUser', () => {
    it('should login user successfully with valid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      User.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      bcrypt.compare.mockResolvedValue(true);

      await loginUser(req, res);

      expect(User.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
      expect(req.session.userId).toBe(1);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        userId: 1
      });
    });

    it('should return 400 if email does not exist', async () => {
      req.body = { email: 'nonexistent@example.com', password: 'password123' };
      User.findByEmail.mockResolvedValue(null);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid email or password'
      });
    });

    it('should return 400 if password is incorrect', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      User.findByEmail.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      bcrypt.compare.mockResolvedValue(false);

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid email or password'
      });
    });

    it('should return 500 on database error', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      User.findByEmail.mockRejectedValue(new Error('Database error'));

      await loginUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Server error'
      });
    });

    it('should set session userId on successful login', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      User.findByEmail.mockResolvedValue({
        id: 42,
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      bcrypt.compare.mockResolvedValue(true);

      await loginUser(req, res);

      expect(req.session.userId).toBe(42);
    });
  });
});
