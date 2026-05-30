import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.group || !body.telegram || !body.department) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 },
      );
    }

    const request = await db.joinRequest.create({
      data: {
        name: body.name,
        group: body.group,
        telegram: body.telegram,
        vk_link: body.vk_link,
        department: body.department,
        answers: body.answers,
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
