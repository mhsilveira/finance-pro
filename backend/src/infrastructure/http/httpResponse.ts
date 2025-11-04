import type { APIGatewayProxyResult } from "aws-lambda";

export function json(statusCode: number, data: unknown): APIGatewayProxyResult {
	return {
		statusCode,
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	};
}

export function badRequest(message: string): APIGatewayProxyResult {
	return json(400, { error: message });
}

export function notFound(message = "Not found"): APIGatewayProxyResult {
	return json(404, { error: message });
}

export function serverError(err: any): APIGatewayProxyResult {
	console.error(err);
	return json(500, { error: "Internal server error" });
}
