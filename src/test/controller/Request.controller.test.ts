import { RequestController } from '../../controllers/Request.controller';
import { RequestService } from '../../services/Request.service';
import { Request as ReqEntity } from '../../entity/Request.entity';
import { Request as ExpressRequest, Response } from 'express';

// Mock utilitario para Response
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn();
  return res as Response;
};

describe('RequestController', () => {
  let req: Partial<ExpressRequest>;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {};
    res = mockResponse();

    RequestService.prototype.create = jest.fn();
    RequestService.prototype.findAllWithFilters = jest.fn();
    RequestService.prototype.findById = jest.fn();
    RequestService.prototype.updateStatus = jest.fn();
    RequestService.prototype.update = jest.fn();
  });

  describe('create', () => {
    it('should create request and return 201', async () => {
      const mockRequest: Partial<ReqEntity> = { id: '1', title: 'Test' };
      (RequestService.prototype.create as jest.Mock).mockResolvedValue(mockRequest);
      req.body = { title: 'Test' };

      await RequestController.create(req as ExpressRequest, res);

      expect(RequestService.prototype.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle service error', async () => {
      (RequestService.prototype.create as jest.Mock).mockRejectedValue(new Error('fail'));
      req.body = {};

      await RequestController.create(req as ExpressRequest, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('getAll', () => {
    it('should return filtered requests', async () => {
      const mockResult = { data: [{ id: '1' }], count: 1, page: 1, limit: 5, totalPages: 1 };
      (RequestService.prototype.findAllWithFilters as jest.Mock).mockResolvedValue(mockResult);
      req.body = { userId: '1', role: 'solicitante', page: 1, limit: 5 };

      await RequestController.getAll(req as ExpressRequest, res);

      expect(RequestService.prototype.findAllWithFilters).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should handle service error', async () => {
      (RequestService.prototype.findAllWithFilters as jest.Mock).mockRejectedValue(new Error('fail'));
      req.body = {};

      await RequestController.getAll(req as ExpressRequest, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Error al obtener las solicitudes' });
    });
  });

  describe('getById', () => {
    it('should return request if found', async () => {
      const mockRequest: Partial<ReqEntity> = { id: '1', title: 'Test' };
      (RequestService.prototype.findById as jest.Mock).mockResolvedValue(mockRequest);
      req.params = { id: '1' };

      await RequestController.getById(req as ExpressRequest, res);

      expect(RequestService.prototype.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(mockRequest);
    });

    it('should return 404 if not found', async () => {
      (RequestService.prototype.findById as jest.Mock).mockResolvedValue(null);
      req.params = { id: '1' };

      await RequestController.getById(req as ExpressRequest, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
    });
  });

  describe('updateStatus', () => {
    it('should update status and return updated request', async () => {
      const mockRequest: Partial<ReqEntity> = { id: '1', status: 'Aprobado' };
      (RequestService.prototype.updateStatus as jest.Mock).mockResolvedValue(mockRequest);
      req.params = { id: '1' };
      req.body = { status: 'Aprobado', userId: '2', comment: 'ok' };

      await RequestController.updateStatus(req as ExpressRequest, res);

      expect(RequestService.prototype.updateStatus).toHaveBeenCalledWith('1', 'Aprobado', '2', 'ok');
      expect(res.json).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle service error', async () => {
      (RequestService.prototype.updateStatus as jest.Mock).mockRejectedValue(new Error('fail'));
      req.params = { id: '1' };
      req.body = { status: 'Aprobado', userId: '2', comment: 'ok' };

      await RequestController.updateStatus(req as ExpressRequest, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });

  describe('update', () => {
    it('should update request and return updated', async () => {
      const mockRequest: Partial<ReqEntity> = { id: '1', title: 'Updated' };
      (RequestService.prototype.update as jest.Mock).mockResolvedValue(mockRequest);
      req.params = { id: '1' };
      req.body = { title: 'Updated', user: '2' };

      await RequestController.update(req as ExpressRequest, res);

      expect(RequestService.prototype.update).toHaveBeenCalledWith('1', req.body, req.body.user);
      expect(res.json).toHaveBeenCalledWith(mockRequest);
    });

    it('should handle service error', async () => {
      (RequestService.prototype.update as jest.Mock).mockRejectedValue(new Error('fail'));
      req.params = { id: '1' };
      req.body = { title: 'Updated', user: '2' };

      await RequestController.update(req as ExpressRequest, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    });
  });
});