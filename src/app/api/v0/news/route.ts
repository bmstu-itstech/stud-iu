import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveFile } from "@/lib/upload";
import { ensureAdmin } from "@/lib/auth-check";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit")) || 10;
  const offset = Number(searchParams.get("offset")) || 0;

  const [count, news] = await db.$transaction([
    db.news.count(),
    db.news.findMany({
      take: limit,
      skip: offset,
      orderBy: { created_at: "desc" },
    }),
  ]);

  return NextResponse.json({
    count,
    next:
      count > offset + limit
        ? `/api/v0/news?limit=${limit}&offset=${offset + limit}`
        : null,
    previous:
      offset > 0
        ? `/api/v0/news?limit=${limit}&offset=${Math.max(0, offset - limit)}`
        : null,
    results: news.map((n) => ({
      ...n,
      created_at: n.created_at.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();

    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const coverFile = formData.get("cover") as File | null;

    const coverUrl = await saveFile(coverFile, "news");

    const newItem = await db.news.create({
      data: {
        title,
        description,
        cover_url: coverUrl,
        created_at: new Date(),
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
