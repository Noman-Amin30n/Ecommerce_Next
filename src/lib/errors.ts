import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status = 500, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function handleError(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message, details: e.details }, { status: e.status });
  }

  if (e instanceof ZodError) {
    return NextResponse.json(
      { error: "Validation failed", details: e.issues },
      { status: 400 }
    );
  }

  console.error("Unhandled API error:", e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
