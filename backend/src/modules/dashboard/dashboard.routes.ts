import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import * as dashboardController from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", requireAuth, dashboardController.summary);
