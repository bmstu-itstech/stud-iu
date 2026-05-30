import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureAdmin } from "@/lib/auth-check";
import type { RequestStatus } from "@prisma/client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const request = await db.joinRequest.findUnique({
    where: { id: parseInt(id) },
  });

  if (!request)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(request);
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  try {
    const updated = await db.joinRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: body.status as RequestStatus,
        admin_comment: body.admin_comment,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Error updating" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.joinRequest.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
