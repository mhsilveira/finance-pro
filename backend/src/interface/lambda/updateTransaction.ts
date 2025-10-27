import "../../bootstrap";
import { updateTransactionSchema } from "@application/validators/transactionSchemas";
import { UpdateTransaction } from "@domain/use-cases/UpdateTransaction";
import { connectMongo } from "@infrastructure/database/mongodb/connection";
import { TransactionRepository } from "@infrastructure/database/mongodb/repositories/TransactionRepository";
import { badRequest, json, notFound, serverError } from "@infrastructure/http/httpResponse";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        await connectMongo();

        const id = event.pathParameters?.id as string;
        const body = event.body ? JSON.parse(event.body) : {};
        const parsed = updateTransactionSchema.safeParse(body);
        if (!parsed.success) {
            return badRequest(parsed.error.errors.map((e) => e.message).join(", "));
        }

        const repo = new TransactionRepository();
        const useCase = new UpdateTransaction(repo);

        const updated = await useCase.execute(id, {
            description: parsed.data.description,
            amount: parsed.data.amount,
            type: parsed.data.type as any,
            category: parsed.data.category,
            date: parsed.data.date ? (new Date(parsed.data.date) as any) : undefined,
        } as any);

        if (!updated) return notFound("Transaction not found");

        return json(200, {
            id: updated.id,
            userId: updated.userId,
            description: updated.description,
            amount: updated.amount,
            type: updated.type,
            category: updated.category,
            date: updated.date.toISOString(),
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
        });
    } catch (err) {
        return serverError(err);
    }
};
