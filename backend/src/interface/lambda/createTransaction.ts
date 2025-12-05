import "../../bootstrap";
import { createTransactionSchema } from "@application/validators/transactionSchemas";
import { CreateTransaction } from "@domain/use-cases/CreateTransaction";
import { connectMongo } from "@infrastructure/database/mongodb/connection";
import { TransactionRepository } from "@infrastructure/database/mongodb/repositories/TransactionRepository";
import { CategoryRepository } from "@infrastructure/database/mongodb/repositories/CategoryRepository";
import { badRequest, json, serverError } from "@infrastructure/http/httpResponse";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
	try {
		await connectMongo();

		const body = event.body ? JSON.parse(event.body) : {};
		const parsed = createTransactionSchema.safeParse(body);
		if (!parsed.success) {
			return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
		}

		const { userId, description, amount, type, category, date, card, origin } = parsed.data;

		const repo = new TransactionRepository();
		const categoryRepo = new CategoryRepository();

		// Seed categories if needed
		await categoryRepo.seedDefaultCategories();

		const useCase = new CreateTransaction(repo, categoryRepo);

		const created = await useCase.execute({
			userId,
			description,
			amount,
			type,
			card,
			origin,
			category,
			date: new Date(date),
		});

const safeISO = (v: any) =>
  v
    ? typeof v === 'string'
      ? new Date(v).toISOString()
      : v.toISOString()
    : null

		
		return json(201, {
			id: created.id,
			userId: created.userId,
			description: created.description,
			amount: created.amount,
			type: created.type,
			category: created.category,
			date: safeISO(created.date),
			createdAt: safeISO(created.createdAt),
			updatedAt: safeISO(created.updatedAt),
		});
	} catch (err: any) {
		return serverError(err);
	}
};
