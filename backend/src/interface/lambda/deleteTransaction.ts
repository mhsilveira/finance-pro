import "../../bootstrap";
import { DeleteTransaction } from "@domain/use-cases/DeleteTransaction";
import { connectMongo } from "@infrastructure/database/mongodb/connection";
import { TransactionRepository } from "@infrastructure/database/mongodb/repositories/TransactionRepository";
import { json, notFound, serverError } from "@infrastructure/http/httpResponse";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        await connectMongo();

        const id = event.pathParameters?.id as string;
        const repo = new TransactionRepository();
        const useCase = new DeleteTransaction(repo);

        const ok = await useCase.execute(id);
        if (!ok) return notFound("Transaction not found");

        return json(204, {});
    } catch (err) {
        return serverError(err);
    }
};
