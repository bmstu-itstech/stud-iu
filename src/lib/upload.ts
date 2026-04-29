import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = process.env.UPLOAD_DIR 
    ? path.resolve(process.env.UPLOAD_DIR) 
    : '/app/storage';

export async function saveFile(file: File | unknown, folder: string): Promise<string | null> {
    if (!file) return null;

    if (typeof (file as File).arrayBuffer !== 'function') {
        console.log('⚠️ saveFile: невалидный файл:', file);
        return null;
    }

    try {
        const fileObj = file as File;
        if (fileObj.size === 0) return null;

        const bytes = await fileObj.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const safeName = fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}-${safeName}`;

        const targetDir = path.join(UPLOAD_DIR, folder);
        const filePath = path.join(targetDir, filename);

        await mkdir(targetDir, { recursive: true });

        await writeFile(filePath, buffer);

        return `${folder}/${filename}`;
    } catch (e) {
        console.error('❌ Ошибка при сохранении файла:', e);
        return null;
    }
}
