import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import * as investmentsController from "./investments.controller.js";

export const investmentsRouter = Router();

investmentsRouter.use(requireAuth);

investmentsRouter.get("/", investmentsController.list);
investmentsRouter.post("/", investmentsController.create);
investmentsRouter.get("/:id", investmentsController.get);
investmentsRouter.patch("/:id", investmentsController.update);
investmentsRouter.delete("/:id", investmentsController.remove);
