import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import * as transactionsController from "./transactions.controller.js";

export const transactionsRouter = Router();

transactionsRouter.use(requireAuth);

transactionsRouter.get("/", transactionsController.list);
transactionsRouter.post("/", transactionsController.create);
transactionsRouter.get("/:id", transactionsController.get);
transactionsRouter.patch("/:id", transactionsController.update);
transactionsRouter.delete("/:id", transactionsController.remove);
