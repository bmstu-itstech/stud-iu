import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { saveFile } from "@/lib/upload";
import { ensureAdmin } from "@/lib/auth-check";
import type { EventType, Precision } from "@prisma/client";

type Props = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);

  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const event = await db.event.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: Props) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr);

  if (isNaN(id))
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const formData = await req.formData();

    const type = formData.get("type") as EventType;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const place = formData.get("place") as string;
    const color = formData.get("color") as string;
    const precisionStr = (formData.get("precision") as string) || "time";
    const precision = precisionStr as Precision;

    let startDatetimeStr = formData.get("start_datetime") as string;
    if (precision === "month" && /^\d{4}-\d{2}$/.test(startDatetimeStr))
      startDatetimeStr += "-01T00:00";
    else if (precision === "year" && /^\d{4}$/.test(startDatetimeStr))
      startDatetimeStr += "-01-01T00:00";
    const start_datetime = new Date(startDatetimeStr);

    if (
      type === "FUTURE" &&
      start_datetime < new Date() &&
      precision === "time"
    ) {
      return NextResponse.json(
        { error: "Предстоящее событие не может быть в прошлом" },
        { status: 400 },
      );
    }

    let endDatetimeStr = formData.get("end_datetime") as string;
    if (endDatetimeStr) {
      if (precision === "month" && /^\d{4}-\d{2}$/.test(endDatetimeStr))
        endDatetimeStr += "-01T00:00";
      else if (precision === "year" && /^\d{4}$/.test(endDatetimeStr))
        endDatetimeStr += "-01-01T00:00";
    }
    const end_datetime = endDatetimeStr ? new Date(endDatetimeStr) : null;

    const registration_link = formData.get("registration_link") as string;
    const album_link = formData.get("album_link") as string;

    const imageFile = formData.get("images") as File;

    await db.event.update({
      where: { id },
      data: {
        type,
        name,
        description,
        place,
        color,
        precision,
        start_datetime,
        end_datetime,
        registration_link:
          type === "FUTURE" && registration_link ? registration_link : null,
        album_link: type === "PAST" && album_link ? album_link : null,
      },
    });

    if (imageFile && imageFile.size > 0) {
      const path = await saveFile(imageFile, "events");
      if (path) {
        await db.eventImage.deleteMany({ where: { event_id: id } });
        await db.eventImage.create({
          data: {
            image: path,
            event_id: id,
          },
        });
      }
    }

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
  const id = parseInt(idStr);

  await db.event.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
