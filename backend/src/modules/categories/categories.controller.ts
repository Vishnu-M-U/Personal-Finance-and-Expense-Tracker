import type { Request, Response } from "express";
import { z } from "zod";
import { optionalQuery, transactionType } from "../../utils/schemas.js";
import { serializeCategory } from "../../utils/serializers.js";
import * as categoriesService from "./categories.service.js";

const listQuery = z.object({ type: optionalQuery(transactionType) });

export async function list(req: Request, res: Response) {
  const { type } = listQuery.parse(req.query);
  const categories = await categoriesService.listCategories(type);
  res.json({ data: categories.map(serializeCategory) });
}
