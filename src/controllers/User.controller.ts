import { Request, Response } from "express";
import { UserService } from "../services/User.service";

const service = new UserService();

export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const user = await service.create(req.body);
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async getById(req: Request, res: Response) {
    const user = await service.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  }

  static async login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const user = await service.validateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }

  static async getApprovers(req: Request, res: Response) {
    try {
      const approvers = await service.findApprovers();
      res.json(approvers);
    } catch (err) {
      res.status(500).json({ error: (err as Error).message });
    }
  }
}
