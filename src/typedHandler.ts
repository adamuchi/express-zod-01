import type {Request, Response, NextFunction} from "express";
import {isEmpty} from "lodash";
import z from "zod";
import hashObject from 'object-hash';

import {Auth} from "./auth";
import {getCacheValue, putCacheValue} from "./cache";

export interface TypedHandlerParams<TInput extends z.ZodTypeAny, TOutput extends z.ZodTypeAny> {
    auth?: Auth | Auth[];
    log?: boolean;
    idempotent?: boolean;
    inputSchema: TInput;
    outputSchema: TOutput;
    handler: (input: z.infer<TInput>) => Promise<z.infer<TOutput>>;
}

export default function <TInput extends z.AnyZodObject, TOutput extends z.AnyZodObject>(params: TypedHandlerParams<TInput, TOutput>) {
    const auth = Array.isArray(params.auth) ? params.auth : [params.auth ?? Auth.NONE];
    const loggingEnabled = params.log ?? true;
    const idempotent = params.idempotent ?? false;
    console.log({auth, loggingEnabled, idempotent});

    const inputSchema = idempotent ? params.inputSchema.extend({ clientToken: z.string() }) : params.inputSchema;

    const idempotencyCheck = async (clientToken: string, input: z.infer<typeof inputSchema>) => {
        const hash = hashObject(input);
        const cached = await getCacheValue(hash);
        if(cached) {
            return cached;
        }
        const output = await params.handler(input);
        await putCacheValue(hash, output);
        return output;
    }

    const validateInput = (input: any) => {
        try {
            return inputSchema.parse(input);
        }
        catch(error) {
            const zodError = error as z.ZodError;
            throw {
                status: 400,
                message: "Validation error",
                data: { issues: zodError.issues }
            }
        }
    }
    
    const validateOutput = (output: any) => {
        try {
            return params.outputSchema.parse(output);
        }
        catch(error) {
            throw {
                status: 500,
                message: "Response validation error"
            }
        }
    }

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if(loggingEnabled) {
                console.log(`Entering ${req.path}`);
            }

            const startMs = Date.now();
            const input = validateInput(req.body);

            // TODO: Pull auth & verify

            const output = await (idempotent ? idempotencyCheck(input.clientToken, input) : params.handler(input));
            validateOutput(output); // Make sure output matches the schema

            const elapsedMs = Date.now() - startMs;

            if(loggingEnabled) {
                console.log(`Exiting ${req.path}: ${elapsedMs}ms`);
            }

            res.setHeader("X-Response-Time", `${elapsedMs}ms`);

            if(isEmpty(output)) {
                res.sendStatus(204);
            }
            else {
                res.json(output);
            }
        }
        catch(error) {
            console.log(`Error in ${req.path}`, error);
            next(error);
        }
    }
}
