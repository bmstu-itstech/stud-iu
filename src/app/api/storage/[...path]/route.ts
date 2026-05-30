import { type NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR 
    ? path.resolve(process.env.UPLOAD_DIR) 
    : "/app/storage";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: filePathParams } = await params;
    const fileName = filePathParams.join("/");
    const fullPath = path.join(UPLOAD_DIR, fileName);

    if (!fullPath.startsWith(UPLOAD_DIR)) {
        return new NextResponse("Access denied", { status: 403 });
    }

    if (!fs.existsSync(fullPath)) {
        return new NextResponse("File not found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(fullPath);
    const ext = path.extname(fullPath).toLowerCase();

    const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".svg": "image/svg+xml"
    };

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": mimeTypes[ext] || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
