import { z } from "zod";

const originEnum = z.enum(["CREDIT_CARD", "CASH"]);

export const createTransactionSchema = z
    .object({
        userId: z.string().min(1),
        description: z.string().min(1),
        amount: z.number().positive(),
        type: z.enum(["income", "expense"]),
        category: z.string().min(1),
        date: z
            .string()
            .datetime()
            .or(z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" })),
        origin: originEnum,              // novo campo obrigatório
        card: z.string().min(1).optional(), // novo campo opcional
    })
    .superRefine((data, ctx) => {
        if (data.origin === "CREDIT_CARD" && (!data.card || data.card.trim().length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["card"],
                message: "card é obrigatório quando origin = CREDIT_CARD",
            });
        }
    });

export const updateTransactionSchema = z
    .object({
        description: z.string().min(1).optional(),
        amount: z.number().positive().optional(),
        type: z.enum(["income", "expense"]).optional(),
        category: z.string().min(1).optional(),
        date: z
            .string()
            .datetime()
            .or(z.string().refine((s) => !Number.isNaN(Date.parse(s)), { message: "Invalid date" }))
            .optional(),
        origin: originEnum.optional(),
        card: z.string().min(1).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.origin === "CREDIT_CARD" && (data.card === undefined || data.card.trim().length === 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["card"],
                message: "card deve ser fornecido quando origin = CREDIT_CARD",
            });
        }
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field must be provided",
    });