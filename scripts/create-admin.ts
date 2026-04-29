import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const pool = new Pool({
    connectionString: process.env.DATABASE_URI
});

const adapter = new PrismaPg(pool);

const db = new PrismaClient({
    adapter,
});

async function main() {
    const rl = createInterface({ input, output });

    try {
        console.log('--- Создание нового администратора ---');

        const email = await rl.question('Введите email: ');
        if (!email.trim()) {
            throw new Error('Email не может быть пустым');
        }

        const plainPassword = await rl.question('Введите пароль: ');
        if (!plainPassword.trim()) {
            throw new Error('Пароль не может быть пустым');
        }

        console.log('Хеширование пароля...');
        const password = await hash(plainPassword, 12);

        console.log('Запись в базу данных...');
        const user = await db.adminUser.create({
            data: {
                email: email.trim(),
                password,
            },
        });

        console.log('✅ Администратор успешно создан!');

    } catch (error) {
        console.error('❌ Ошибка:', error instanceof Error ? error.message : error);
    } finally {
        rl.close();
        await db.$disconnect();
    }
}

main().catch((e) => console.error(e));
