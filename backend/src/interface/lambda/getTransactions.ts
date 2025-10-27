import "../../bootstrap";
import { ListTransactions } from "@domain/use-cases/ListTransactions";
import { connectMongo } from "@infrastructure/database/mongodb/connection";
import { TransactionRepository } from "@infrastructure/database/mongodb/repositories/TransactionRepository";
import { badRequest, json, serverError } from "@infrastructure/http/httpResponse";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        await connectMongo();

        const userId = event.queryStringParameters?.userId;
        if (!userId) {
            return badRequest('query param "userId" é obrigatório');
        }

        const repo = new TransactionRepository();
        const useCase = new ListTransactions(repo);
        const list = await useCase.execute(userId);

        return json(
            200,
            list.map((t) => ({
                id: t.id,
                userId: t.userId,
                description: t.description,
                amount: t.amount,
                type: t.type,
                category: t.category,
                date: t.date.toISOString(),
                createdAt: t.createdAt.toISOString(),
                updatedAt: t.updatedAt.toISOString(),
            })),
        );
    } catch (err) {
        return serverError(err);
    }
};
