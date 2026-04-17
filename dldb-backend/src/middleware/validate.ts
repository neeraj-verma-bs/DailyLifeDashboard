import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";
import { ValidationError } from "../lib/errors.js";

type Source = "body" | "query" | "params";

export function validate<S extends ZodTypeAny>(schema: S, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ValidationError(result.error.flatten(), "Request validation failed"));
    }
    req.validated = result.data;
    next();
  };
}

export function getValidated<T>(req: Request): T {
  return req.validated as T;
}
