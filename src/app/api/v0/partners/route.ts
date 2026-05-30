import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveFile } from "@/lib/upload";
import { ensureAdmin } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 12;
  const offset = Number(searchParams.get("offset")) || 0;

  const [count, partners] = await db.$transaction([
    db.partner.count(),
    db.partner.findMany({
      take: limit,
      skip: offset,
      orderBy: { id: "desc" },
    }),
  ]);

  return NextResponse.json({
    count,
    next:
      count > offset + limit
        ? `/api/v0/partners?limit=${limit}&offset=${offset + limit}`
        : null,
    previous:
      offset > 0
        ? `/api/v0/partners?limit=${limit}&offset=${Math.max(0, offset - limit)}`
        : null,
    results: partners,
  });
}

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const imagePath = await saveFile(imageFile, "partners");

    const partner = await db.partner.create({
      data: {
        name,
        url,
        image: imagePath!,
      },
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
