import { UserController } from '../../controllers/User.controller';
import { UserService } from '../../services/User.service';
import { Request, Response } from 'express';
import { User, UserRole } from '../../entity/User.entity';

// Se crea una función de utilidad para simular el objeto 'Response'
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res as Response;
};

describe('UserController', () => {
  let req: Partial<Request>;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = mockResponse();

    // Mockea los métodos en el prototipo para que afecten la instancia interna del controller
    UserService.prototype.create = jest.fn();
    UserService.prototype.findById = jest.fn();
    UserService.prototype.validateUser = jest.fn();
    UserService.prototype.findApprovers = jest.fn();
  });

  describe('create', () => {
    it('should create user and return 201', async () => {
      const mockUser: Partial<User> = { id: '1', username: 'test', role: UserRole.SOLICITANTE };
      (UserService.prototype.create as jest.Mock).mockResolvedValue(mockUser);
      req.body = { username: 'test' };

      await UserController.create(req as Request, res);

      expect(UserService.prototype.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should handle service error', async () => {
      (UserService.prototype.create as jest.Mock).mockRejectedValue(new Error('fail'));
      req.body = {};

      await UserController.create(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('getById', () => {
    it('should return user if found', async () => {
      const mockUser: Partial<User> = { id: '1', username: 'test', role: UserRole.SOLICITANTE };
      (UserService.prototype.findById as jest.Mock).mockResolvedValue(mockUser);
      req.params = { id: '1' };

      await UserController.getById(req as Request, res);

      expect(UserService.prototype.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockUser);
    });

    it('should return 404 if user not found', async () => {
      (UserService.prototype.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: '1' };

      await UserController.getById(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('login', () => {
    it('should return user data if credentials valid', async () => {
      const mockUser: Partial<User> = { id: '1', username: 'test', role: UserRole.SOLICITANTE };
      (UserService.prototype.validateUser as jest.Mock).mockResolvedValue(mockUser);
      req.body = { username: 'test', password: 'pass' };

      await UserController.login(req as Request, res);

      expect(UserService.prototype.validateUser).toHaveBeenCalledWith('test', 'pass');
      expect(res.json).toHaveBeenCalledWith({
        id: mockUser.id, username: mockUser.username, role: mockUser.role,
      });
    });

    it('should return 401 if credentials invalid', async () => {
      (UserService.prototype.validateUser as jest.Mock).mockResolvedValue(null);
      req.body = { username: 'test', password: 'wrong' };

      await UserController.login(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
    });

    it('should handle service error', async () => {
      (UserService.prototype.validateUser as jest.Mock).mockRejectedValue(new Error('fail'));
      req.body = { username: 'test', password: 'pass' };

      await UserController.login(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('getApprovers', () => {
    it('should return approvers', async () => {
      const mockApprover: Partial<User> = { id: '2', username: 'approver', role: UserRole.APROBADOR };
      (UserService.prototype.findApprovers as jest.Mock).mockResolvedValue([mockApprover]);

      await UserController.getApprovers(req as Request, res);

      expect(UserService.prototype.findApprovers).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith([{ id: mockApprover.id, username: mockApprover.username, role: mockApprover.role }]);
    });

    it('should handle service error', async () => {
      (UserService.prototype.findApprovers as jest.Mock).mockRejectedValue(new Error('fail'));

      await UserController.getApprovers(req as Request, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});