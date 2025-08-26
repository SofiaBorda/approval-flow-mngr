import { Router } from "express";
import { UserController } from "../controllers/User.controller";

const router = Router();

router.post("/", UserController.create);
router.get("/approvers", UserController.getApprovers);
router.get("/:id", UserController.getById);
router.post("/login", UserController.login);


export default router; 
