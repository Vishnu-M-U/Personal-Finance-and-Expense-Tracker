import type { Request, Response } from "express";
import { getUserId } from "../../middleware/requireAuth.js";
import { idParam } from "../../utils/schemas.js";
import { serializeTransaction } from "../../utils/serializers.js";
import {
  createTransactionSchema,
  listTransactionsQuery,
  updateTransactionSchema,
} from "./transactions.schemas.js";
import * as transactionsService from "./transactions.service.js";

export async function list(req: Request, res: Response) {
  const query = listTransactionsQuery.parse(req.query);
  const { transactions, meta } = await transactionsService.listTransactions(getUserId(req), query);
  res.json({ data: transactions.map(serializeTransaction), meta });
}

export async function get(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const transaction = await transactionsService.getTransaction(getUserId(req), id);
  res.json({ data: serializeTransaction(transaction) });
}

export async function create(req: Request, res: Response) {
  const input = createTransactionSchema.parse(req.body);
  const transaction = await transactionsService.createTransaction(getUserId(req), input);
  res.status(201).json({ data: serializeTransaction(transaction) });
}

export async function update(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  const input = updateTransactionSchema.parse(req.body);
  const transaction = await transactionsService.updateTransaction(getUserId(req), id, input);
  res.json({ data: serializeTransaction(transaction) });
}

export async function remove(req: Request, res: Response) {
  const { id } = idParam.parse(req.params);
  await transactionsService.deleteTransaction(getUserId(req), id);
  res.status(204).end();
}
