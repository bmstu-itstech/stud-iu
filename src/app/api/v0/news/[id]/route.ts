import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveFile } from "@/lib/upload";
import { ensureAdmin } from "@/lib/auth-check";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const news = await db.news.findUnique({ where: { id } });
  if (!news) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(news);
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr);

  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const coverFile = formData.get("cover") as File;

    const updateData: any = {
      title,
      description,
    };

    if (coverFile && coverFile.size > 0) {
      const path = await saveFile(coverFile, "news");
      if (path) updateData.cover_url = path;
    }

    await db.news.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  await db.news.delete({ where: { id: parseInt(idStr) } });
  return NextResponse.json({ success: true });
}
