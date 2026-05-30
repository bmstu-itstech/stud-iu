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

  const member = await db.boardMember.findUnique({ where: { id } });
  if (!member)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(member);
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr);

  try {
    const formData = await req.formData();

    const data: any = {
      name: formData.get("name") as string,
      position: formData.get("position") as string,
      telegram_link: formData.get("telegram_link") as string,
      description: formData.get("description") as string,
      start_date: new Date(formData.get("start_date") as string),
    };

    const imageFile = formData.get("image") as File | null;

    if (imageFile && imageFile.size > 0) {
      const imagePath = await saveFile(imageFile, "members");
      if (imagePath) {
        data.image = imagePath;
      }
    }

    await db.boardMember.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: idStr } = await params;
  await db.boardMember.delete({ where: { id: parseInt(idStr) } });
  return NextResponse.json({ success: true });
}
