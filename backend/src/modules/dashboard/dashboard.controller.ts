import type { Request, Response } from "express";
import { getUserId } from "../../middleware/requireAuth.js";
import { serializeTransaction } from "../../utils/serializers.js";
import { summaryQuery } from "./dashboard.schemas.js";
import * as dashboardService from "./dashboard.service.js";

export async function summary(req: Request, res: Response) {
  const query = summaryQuery.parse(req.query);
  const { recentTransactions, ...summary } = await dashboardService.getSummary(
    getUserId(req),
    query,
  );
  res.json({
    data: { ...summary, recentTransactions: recentTransactions.map(serializeTransaction) },
  });
}
