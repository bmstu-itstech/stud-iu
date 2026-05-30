import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-check";
import type { RequestStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as RequestStatus | null;
  const department = searchParams.get("department");

  const where: any = {};
  if (status && status !== ("ALL" as any)) where.status = status;
  if (department && department !== "ALL") where.department = department;

  try {
    const requests = await db.joinRequest.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(requests);
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
