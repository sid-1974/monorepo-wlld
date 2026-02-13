import { Router } from "express";
import { TaskController } from "../controllers";
import { authenticate, validate } from "../middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../validators";

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get("/", validate(taskQuerySchema, "query"), TaskController.getTasks);
router.post("/", validate(createTaskSchema), TaskController.createTask);
router.put("/:id", validate(updateTaskSchema), TaskController.updateTask);
router.delete("/:id", TaskController.deleteTask);

export default router;
