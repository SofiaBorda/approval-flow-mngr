import { Request, Response } from "express";
import { RequestService } from "../services/Request.service";

const service = new RequestService();

export class RequestController {
  static async create(req: Request, res: Response) {
    try {
      const newRequest = await service.create(req.body);
      res.status(201).json(newRequest);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { userId, role, page = 1, limit = 5, search, status, type, requesterId } = req.body;
      const filters = { search, status, type, requesterId, userId, role };
      const requests = await service.findAllWithFilters(page, limit, filters, { userId, role });
      res.json(requests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      res.status(500).json({ message: "Error al obtener las solicitudes" });
    }
  }

  static async getById(req: Request, res: Response) {
    const request = await service.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Not found" });
    res.json(request);
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const updated = await service.updateStatus(
        req.params.id,
        req.body.status,
        req.body.userId,
        req.body.comment
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const updated = await service.update(
        req.params.id,
        req.body,
        req.body.user
      );
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
}
