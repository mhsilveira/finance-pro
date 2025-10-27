import "../../bootstrap";
import { GetTransaction } from "@domain/use-cases/GetTransaction";
import { connectMongo } from "@infrastructure/database/mongodb/connection";
import { TransactionRepository } from "@infrastructure/database/mongodb/repositories/TransactionRepository";
import { json, notFound, serverError } from "@infrastructure/http/httpResponse";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        await connectMongo();

        const id = event.pathParameters?.id as string;
        const repo = new TransactionRepository();
        const useCase = new GetTransaction(repo);
        const found = await useCase.execute(id);

        if (!found) return notFound("Transaction not found");

        return json(200, {
            id: found.id,
            userId: found.userId,
            description: found.description,
            amount: found.amount,
            type: found.type,
            category: found.category,
            date: found.date.toISOString(),
            createdAt: found.createdAt.toISOString(),
            updatedAt: found.updatedAt.toISOString(),
        });
    } catch (err) {
        return serverError(err);
    }
};
