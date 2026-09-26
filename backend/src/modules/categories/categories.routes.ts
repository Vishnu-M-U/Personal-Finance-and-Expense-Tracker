import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import * as categoriesController from "./categories.controller.js";

export const categoriesRouter = Router();

categoriesRouter.get("/", requireAuth, categoriesController.list);
