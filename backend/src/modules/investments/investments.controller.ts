import type { Request, Response } from "express";
import { getUserId } from "../../middleware/requireAuth.js";
import { idParam } from "../../utils/schemas.js";
import { serializeInvestment } from "../../utils/serializers.js";
import { createInvestmentSchema, updateInvestmentSchema } from "./investments.schemas.js";
import * as investmentsService from "./investments.service.js";

export async function list(req: Request, res: Response) {
  const { investments, summary } = await investmentsService.listInvestments(getUserId(req));
  res.json({ data: investments.map(serializeInvestment), summary });
}

export async function get(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const investment = await investmentsService.getInvestment(getUserId(req), id);
  res.json({ data: serializeInvestment(investment) });
}

export async function create(req: Request, res: Response) {
  const input = createInvestmentSchema.parse(req.body);
  const investment = await investmentsService.createInvestment(getUserId(req), input);
  res.status(201).json({ data: serializeInvestment(investment) });
}

export async function update(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const input = updateInvestmentSchema.parse(req.body);
  const investment = await investmentsService.updateInvestment(getUserId(req), id, input);
  res.json({ data: serializeInvestment(investment) });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  await investmentsService.deleteInvestment(getUserId(req), id);
  res.status(204).end();
}
