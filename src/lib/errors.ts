import { NextResponse } from "next/server";

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
  console.error("Unhandled API error:", e);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
