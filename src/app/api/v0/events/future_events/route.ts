import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 10;
  const offset = Number(searchParams.get("offset")) || 0;

  const [count, events] = await db.$transaction([
    db.event.count({ where: { type: "FUTURE" } }),
    db.event.findMany({
      where: { type: "FUTURE" },
      take: limit,
      orderBy: { start_datetime: "asc" },
      skip: offset,
      include: { images: true },
    }),
  ]);

  return NextResponse.json({
    count,
    next:
      count > offset + limit
        ? `/api/v0/events/future_events?limit=${limit}&offset=${offset + limit}`
        : null,
    previous:
      offset > 0
        ? `/api/v0/events/future_events?limit=${limit}&offset=${Math.max(0, offset - limit)}`
        : null,
    results: events,
  });
}
