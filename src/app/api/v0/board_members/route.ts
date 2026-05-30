import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveFile } from "@/lib/upload";
import { ensureAdmin } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 20;
  const offset = Number(searchParams.get("offset")) || 0;

  const [count, members] = await db.$transaction([
    db.boardMember.count(),
    db.boardMember.findMany({
      take: limit,
      skip: offset,
      orderBy: { start_date: "desc" },
    }),
  ]);

  return NextResponse.json({
    count,
    next:
      count > offset + limit
        ? `/api/v0/board_members?limit=${limit}&offset=${offset + limit}`
        : null,
    previous:
      offset > 0
        ? `/api/v0/board_members?limit=${limit}&offset=${Math.max(0, offset - limit)}`
        : null,
    results: members.map((m) => ({
      ...m,
      start_date: m.start_date.toISOString().split("T")[0],
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const imageFile = formData.get("image") as File | null;
    const imagePath = await saveFile(imageFile, "members");

    const member = await db.boardMember.create({
      data: {
        name: formData.get("name") as string,
        position: formData.get("position") as string,
        telegram_link: formData.get("telegram_link") as string,
        description: formData.get("description") as string,
        start_date: new Date(formData.get("start_date") as string),
        image: imagePath,
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
