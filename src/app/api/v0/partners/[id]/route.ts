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

  const partner = await db.partner.findUnique({ where: { id } });
  if (!partner)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(partner);
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr);

  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const url = formData.get("url") as string;
    const imageFile = formData.get("image") as File;

    const updateData: any = { name, url };

    if (imageFile && imageFile.size > 0) {
      const path = await saveFile(imageFile, "partners");
      if (path) updateData.image = path;
    }

    await db.partner.update({
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
  await db.partner.delete({ where: { id: parseInt(idStr) } });
  return NextResponse.json({ success: true });
}
