docker-compose.yaml:
```yaml
services:
  app:
    container_name: studiu_next
    build:
      context: .
    image: nextjs-prod
    restart: always
    ports:
      - "3000:3000"
    env_file:
      - .env
    environment:
      NODE_ENV: production
      DATABASE_URI: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
    networks:
      - localnet
    volumes:
      - ./uploads_data:/app/storage

networks:
  localnet:
    driver: bridge

volumes:
  postgres_data:
```

postcss.config.mjs:
```
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

Dockerfile:
```dockerfile
FROM oven/bun:1 AS base

WORKDIR /app

FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY prisma ./prisma
COPY scripts ./scripts

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/scripts ./scripts
COPY . .

RUN bunx prisma generate

ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --no-log-init -g nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["bun", "./server.js"]
```

prisma.config.ts:
```typescript
import { defineConfig } from '@prisma/config';
import 'dotenv/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DATABASE_URI,
  },
});
```

next-env.d.ts:
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

package.json:
```json
{
  "name": "stud-iu",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint ."
  },
  "dependencies": {
    "@libsql/client": "^0.15.15",
    "@prisma/adapter-libsql": "^7.2.0",
    "@prisma/adapter-pg": "^7.2.0",
    "@prisma/client": "^7.2.0",
    "@prisma/config": "^7.2.0",
    "@radix-ui/react-slot": "^1.2.4",
    "@tanstack/react-query-devtools": "^5.91.1",
    "axios": "^1.13.2",
    "bcryptjs": "^3.0.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "embla-carousel-react": "^8.6.0",
    "next": "16.1.1",
    "next-auth": "^4.24.13",
    "prisma": "^7.2.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-hook-form": "^7.69.0",
    "react-hot-toast": "^2.6.0",
    "react-icons": "^5.5.0",
    "tailwind-merge": "^3.4.0",
    "tw-animate-css": "^1.4.0",
    "zod": "^4.2.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.3.3",
    "@tailwindcss/postcss": "^4",
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20",
    "@types/pg": "^8.16.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "dotenv": "^17.2.3",
    "eslint": "^9.39.2",
    "eslint-config-next": "^16.1.1",
    "eslint-config-prettier": "^10.1.8",
    "eslint-plugin-perfectionist": "^5.1.0",
    "tailwindcss": "^4",
    "ts-node": "^10.9.2",
    "typescript": "^5"
  }
}
```

tsconfig.json:
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

docker-compose.ci.yaml:
```yaml
services:
  web:
    container_name: studiu_next
    build: .
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NEXTAUTH_SECRET=$NEXTAUTH_SECRET
      - DATABASE_URI=$DATABASE_URI
    volumes:
      - uploads:/app/storage

volumes:
  uploads:
```

eslint.config.mjs:
```
import eslint from '@eslint/js'
import tsParser from '@typescript-eslint/parser'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

const eslintConfig = defineConfig([
    {
        ignores: ['.next/', 'next-env.d.ts', 'payload/payload-types.ts', 'app/**/importMap.js'],
    },

    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...nextVitals,
    ...nextTs,

    prettier,

    {
        files: ['**/*.{ts,tsx,js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json'],
                tsconfigRootDir: import.meta.dirname,
            },
            sourceType: 'module',
        },
    },

    {
        rules: {
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                },
            ],

            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'inline-type-imports',
                },
            ],

            '@typescript-eslint/no-explicit-any': 'warn',
            'perfectionist/sort-jsx-props': 'off'
        },
    },
])

export default eslintConfig
```

next.config.ts:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'standalone'
};

export default nextConfig;
```

src/proxy.ts:
```typescript
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;

    if (path.startsWith('/admin') && !path.startsWith('/admin/login')) {
        const session = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
        });

        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
```

src/widgets/EventsCarousel/index.tsx:
```tsx
'use client';

import type { FC } from 'react';
import { useFutureEvents } from '@/shared/hooks/useEvents';
import Carousel, { CarouselSkeleton } from '../EventDetails';
import { Text, Title } from '@/shared/ui/Typography';
import Button from '@/shared/ui/Button';
import { formatDate } from '@/shared/utils';

const EventsCarousel: FC = () => {
    const { data: events, isLoading, isError } = useFutureEvents(5);

    if (isLoading) return <CarouselSkeleton />;

    if (isError || !events || events.length === 0) {
        return (
            <div className="flex items-center justify-center h-[calc(100dvh-5rem)] bg-black">
                <Title className="text-white/50">
                    {isError ? 'Ошибка загрузки мероприятий' : 'Нет предстоящих мероприятий'}
                </Title>
            </div>
        );
    }

    const slides = events.map(event => ({
        ...event,
        before: event.registration_link ? (
            <Button
                variant="white"
                size="primary"
                onClick={() => window.open(event.registration_link!, '_blank')}
            >
                <Title level={5}>Зарегистрироваться</Title>
            </Button>
        ) : null,
        after: (
            <div className="flex flex-col items-end text-right gap-1">

                <Title level={4} className="text-white">
                    {event.place || 'Место уточняется'}
                </Title>

                <Text level={4} className="text-white/60">
                    {formatDate(event.start_datetime)}
                </Text>
            </div>
        )
    }));

    return <Carousel slides={slides} options={{ loop: true }} />;
};

export default EventsCarousel;
```

src/widgets/JoinModal/index.tsx:
```tsx
'use client';

import { type FC, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { Title, Text } from '@/shared/ui/Typography';
import Button from '@/shared/ui/Button';
import apiClient from '@/shared/api/axios';

interface JoinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Inputs = {
    name: string;
    group: string;
    telegram: string;
    vk_link: string;
    department: string;
    answers: Record<string, any>;
    agreement: boolean;
};

const DEPARTMENTS = [
    { id: 'SCIENCE', label: 'Научный отдел' },
    { id: 'ITS', label: 'ITS Tech (IT)' },
    { id: 'MEDIA', label: 'Медиа-центр' },
    { id: 'PARTNERS', label: 'Внешние связи' },
    { id: 'EVENT', label: 'Культ-масс (Event)' },
    { id: 'SPORT', label: 'Спорт / Киберспорт' },
];

const inputClasses = "w-full px-8 py-6 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500/20 rounded-[2rem] outline-none transition-all font-bold text-2xl placeholder:text-gray-300 text-gray-900";
const labelClasses = "block text-lg font-extrabold text-gray-400 uppercase tracking-widest ml-4 mb-3";
const checkboxClasses = "w-6 h-6 accent-blue-600 cursor-pointer";

const JoinModal: FC<JoinModalProps> = ({ isOpen, onClose }) => {
    const { register, handleSubmit, watch, reset } = useForm<Inputs>({
        defaultValues: {
            department: 'SCIENCE',
            agreement: false
        }
    });

    const selectedDept = watch('department');

    useEffect(() => {
        if (!isOpen) reset();
    }, [isOpen, reset]);

    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
    }, [isOpen]);

    const onSubmit: SubmitHandler<Inputs> = async (data) => {
        try {
            await apiClient.post('/join', {
                ...data,
                answers: data.answers
            });
            toast.success('Заявка отправлена!');
            onClose();
        } catch (e) {
            toast.error('Ошибка отправки');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity" onClick={onClose} />

            <div className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

                <div className="px-10 py-8 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
                    <div>
                        <Title level={2} className="!text-4xl sm:!text-5xl tracking-tight">Стать частью команды</Title>
                        <Text level={3} className="text-gray-400 mt-2 font-medium !text-3xl">Заполни анкету, и мы максимально оперативно свяжемся с тобой</Text>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 text-3xl font-bold"
                    >
                        ✕
                    </button>
                </div>

                <div className="overflow-y-auto px-10 py-10 custom-scrollbar">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-12">

                        <div className="space-y-4">
                            <label className={labelClasses}>Какое направление интересует?</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {DEPARTMENTS.map((dept) => (
                                    <label
                                        key={dept.id}
                                        className={`cursor-pointer p-8 rounded-[2rem] border-4 transition-all flex items-center justify-center text-center font-bold text-2xl shadow-sm hover:shadow-lg hover:scale-[1.01] ${
                                            selectedDept === dept.id
                                                ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                : 'border-transparent bg-gray-50 text-gray-500 hover:bg-gray-100'
                                        }`}
                                    >
                                        <input type="radio" value={dept.id} {...register('department')} className="hidden" />
                                        {dept.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <hr className="border-gray-100" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className={labelClasses}>ФИО</label>
                                <input {...register('name', { required: true })} className={inputClasses} placeholder="Иванов Иван Иванович" />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClasses}>Учебная группа</label>
                                <input {...register('group', { required: true })} className={inputClasses} placeholder="ИУ1-11Б" />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClasses}>Telegram</label>
                                <input {...register('telegram', { required: true })} className={inputClasses} placeholder="@username" />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClasses}>VK (опционально)</label>
                                <input {...register('vk_link')} className={inputClasses} placeholder="Ссылка на профиль" />
                            </div>
                        </div>

                        <div className="bg-gray-50/50 border border-gray-100 rounded-[3rem] p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-300">

                            {selectedDept === 'SCIENCE' && (
                                <>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Что тебе интереснее?</label>
                                        <div className="relative">
                                            <select {...register('answers.science_role')} className={`${inputClasses} appearance-none cursor-pointer`}>
                                                <option value="Конференции">Организация научных конференций</option>
                                                <option value="Преподавание">Преподавание и менторство</option>
                                                <option value="Статьи">Написание статей / Поиск научрука</option>
                                            </select>
                                            <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Твои академические интересы</label>
                                        <textarea {...register('answers.science_interests')} className={`${inputClasses} min-h-[160px] resize-none`} placeholder="ИИ, Робототехника, Математика..." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Был ли опыт выступлений?</label>
                                        <textarea {...register('answers.science_exp')} className={`${inputClasses} min-h-[160px] resize-none`} />
                                    </div>
                                </>
                            )}

                            {selectedDept === 'ITS' && (
                                <>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Ссылка на GitHub / GitLab</label>
                                        <input {...register('answers.its_github')} className={inputClasses} placeholder="https://github.com/..." />
                                    </div>
                                    <div className="space-y-4">
                                        <label className={labelClasses}>Какие направления интересуют?</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Бекенд', 'Фронтенд', 'UI/UX', 'DevOps', 'Mobile', 'QA'].map(role => (
                                                <label key={role} className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all">
                                                    <input type="checkbox" value={role} {...register('answers.its_roles')} className={checkboxClasses} />
                                                    <span className="font-bold text-xl text-gray-700">{role}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Расскажи о своём опыте (стек)</label>
                                        <textarea {...register('answers.its_exp')} className={`${inputClasses} min-h-[200px] resize-none`} placeholder="Языки, фреймворки, пет-проекты..." />
                                    </div>
                                </>
                            )}

                            {selectedDept === 'MEDIA' && (
                                <>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Ссылка на портфолио <span className="text-red-500">*</span></label>
                                        <input {...register('answers.media_portfolio', { required: selectedDept === 'MEDIA' })} className={inputClasses} placeholder="Google Disk, Behance, VK..." />
                                    </div>
                                    <div className="space-y-4">
                                        <label className={labelClasses}>Направления (можно несколько)</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Фото', 'Видео', 'Монтаж', 'Дизайн', 'Копирайтинг', 'SMM'].map(role => (
                                                <label key={role} className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all">
                                                    <input type="checkbox" value={role} {...register('answers.media_roles')} className={checkboxClasses} />
                                                    <span className="font-bold text-xl text-gray-700">{role}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Софт и техника</label>
                                        <input {...register('answers.media_soft')} className={inputClasses} placeholder="Photoshop, Figma, Sony A7..." />
                                    </div>
                                </>
                            )}

                            {selectedDept === 'PARTNERS' && (
                                <>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Есть ли опыт общения с партнерами?</label>
                                        <textarea {...register('answers.partners_exp')} className={`${inputClasses} min-h-[160px] resize-none`} />
                                    </div>
                                    <div className="space-y-4">
                                        <label className={labelClasses}>Навык деловой переписки (1-5)</label>
                                        <div className="flex gap-6">
                                            {[1, 2, 3, 4, 5].map(num => (
                                                <label key={num} className="cursor-pointer flex-1 bg-white py-6 rounded-[2rem] text-center font-extrabold text-2xl text-gray-600 shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-all border-2 border-transparent hover:border-blue-200">
                                                    <input type="radio" value={num} {...register('answers.partners_skill')} className="hidden" />
                                                    {num}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Мини-кейс: Пишем в Red Bull. Тема и первое предложение?</label>
                                        <textarea {...register('answers.partners_case')} className={`${inputClasses} min-h-[200px] resize-none`} placeholder="Тема: ... Текст: ..." />
                                    </div>
                                </>
                            )}

                            {selectedDept === 'EVENT' && (
                                <>
                                    <div className="space-y-4">
                                        <label className={labelClasses}>Какая роль ближе?</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Организатор', 'Сценарист', 'Тех. группа', 'Ведущий/Артист'].map(role => (
                                                <label key={role} className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all">
                                                    <input type="checkbox" value={role} {...register('answers.event_roles')} className={checkboxClasses} />
                                                    <span className="font-bold text-xl text-gray-700">{role}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className={labelClasses}>Твои скиллы</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Сценарии', 'Звук/Свет', 'Декорации', 'Танцы/Постановка', 'Решение проблем'].map(skill => (
                                                <label key={skill} className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all">
                                                    <input type="checkbox" value={skill} {...register('answers.event_skills')} className={checkboxClasses} />
                                                    <span className="font-bold text-xl text-gray-700">{skill}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>Твой самый крутой ивент (опыт)</label>
                                        <textarea {...register('answers.event_exp')} className={`${inputClasses} min-h-[160px] resize-none`} />
                                    </div>
                                </>
                            )}

                            {selectedDept === 'SPORT' && (
                                <>
                                    <div className="space-y-4">
                                        <label className={labelClasses}>Что интересует?</label>
                                        <div className="flex gap-6">
                                            <label className="cursor-pointer flex-1 bg-white p-6 rounded-[2rem] flex items-center justify-center gap-4 shadow-sm font-bold text-xl text-gray-600 hover:text-blue-600 transition-all border-2 border-transparent hover:border-blue-200">
                                                <input type="radio" value="Спорт" {...register('answers.sport_type')} className={checkboxClasses} />
                                                Классический спорт
                                            </label>
                                            <label className="cursor-pointer flex-1 bg-white p-6 rounded-[2rem] flex items-center justify-center gap-4 shadow-sm font-bold text-xl text-gray-600 hover:text-blue-600 transition-all border-2 border-transparent hover:border-blue-200">
                                                <input type="radio" value="Киберспорт" {...register('answers.sport_type')} className={checkboxClasses} />
                                                Киберспорт
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className={labelClasses}>Роль</label>
                                        <div className="flex flex-wrap gap-4">
                                            {['Организатор', 'Судья/Админ', 'Комментатор', 'Дизайнер'].map(role => (
                                                <label key={role} className="flex items-center gap-4 bg-white px-8 py-5 rounded-[2rem] cursor-pointer shadow-sm hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all">
                                                    <input type="checkbox" value={role} {...register('answers.sport_roles')} className={checkboxClasses} />
                                                    <span className="font-bold text-xl text-gray-700">{role}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClasses}>В каких дисциплинах разбираешься?</label>
                                        <input {...register('answers.sport_disciplines')} className={inputClasses} placeholder="Волейбол, Dota 2, CS2..." />
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <input type="checkbox" {...register('agreement', { required: true })} className="w-6 h-6 mt-1 accent-blue-600 rounded-lg cursor-pointer shrink-0" />
                                <span className="text-gray-500 text-lg font-medium select-none">
                                    Нажимая кнопку, я даю согласие на обработку моих персональных данных в соответствии с
                                    <Link
                                        href="/policy"
                                        target="_blank"
                                        className="text-blue-600 hover:text-blue-700 underline mx-1.5"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Политикой конфиденциальности
                                    </Link>
                                    и Федеральным законом от 27.07.2006 года №152-ФЗ.
                                </span>
                            </label>

                            <Button variant="blue" size="full" type="submit" className="text-3xl py-8 rounded-[2.5rem] shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.99] transition-transform">
                                <span className="font-bold">Отправить анкету</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default JoinModal;
```

src/widgets/EventDetails/index.tsx:
```tsx
'use client';

import type { EmblaOptionsType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import type { FC, ReactNode } from 'react';

import type { PastEvent, FutureEvent } from '@/shared/api';
import { Text, Title } from '@/shared/ui/Typography';
import { useDotButton } from '@/shared/utils/useDotButton';
import { getImageUrl } from '@/shared/utils/getImageUrl';
import { ExpandableDescription } from './components/ExpandableDescription';

type BaseEvent = Partial<PastEvent & FutureEvent>;

export type CarouselSlideProps = BaseEvent & {
    before?: ReactNode;
    after?: ReactNode;
    status?: string;
    details?: string[];
    color?: string;
};

interface CarouselProps {
    slides: CarouselSlideProps[];
    options?: EmblaOptionsType;
}

export const CarouselSkeleton: FC = () => {
    return (
        <div className="relative w-full h-[calc(100dvh-5rem)] bg-gray-900 animate-pulse">
            <div className="max-w-primary mx-auto h-full flex flex-col justify-end pb-20 px-6">
                <div className="h-10 w-1/3 bg-gray-800 rounded mb-6"></div>
                <div className="h-4 w-2/3 bg-gray-800 rounded mb-4"></div>
                <div className="h-4 w-1/2 bg-gray-800 rounded"></div>
            </div>
        </div>
    );
};

const Carousel: FC<CarouselProps> = ({ slides, options }) => {
    const [emblaRef, emblaApi] = useEmblaCarousel(options);
    const { selectedIndex, scrollSnaps, onDotButtonClick } = useDotButton(emblaApi);

    return (
        <div className="relative w-full bg-black text-white h-[calc(100vh-5rem)]">
            <div className="overflow-hidden h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {slides.map((slide, index) => {
                        const eventColor = slide.color || '#3a7fff';
                        const imageUrl = getImageUrl(slide.images?.[0]?.image);

                        return (
                            <div
                                className="relative flex-grow-0 flex-shrink-0 basis-full min-w-0 h-full"
                                key={slide.id || index}
                            >
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src={imageUrl}
                                        fill
                                        className="object-cover"
                                        alt={slide.name || 'Event'}
                                        priority={index === 0}
                                    />

                                    <div
                                        className="absolute inset-0"
                                        style={{
                                            background: `linear-gradient(to top, ${eventColor}E6 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.2) 100%)`
                                        }}
                                    />
                                </div>

                                <div className="relative z-10 flex flex-col h-full max-w-primary mx-auto px-6 2xl:px-0 pb-24 sm:pb-32 pt-20 justify-end">

                                    {slide.details && (
                                        <div className="flex gap-4 mb-6">
                                            {slide.details.map((detail, i) => (
                                                <Text key={i} className="text-white/80">{detail}</Text>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-6 w-full">
                                        <div className="flex flex-wrap items-center gap-6">
                                            <Title className="text-white drop-shadow-lg !text-5xl sm:!text-7xl md:!text-8xl leading-[0.9]">
                                                {slide.name}
                                            </Title>

                                            {slide.status && (
                                                <span className="bg-lime-400 text-black px-4 py-2 rounded-full font-bold text-sm">
                                                    {slide.status}
                                                </span>
                                            )}
                                        </div>

                                        <ExpandableDescription text={slide.description} />
                                    </div>

                                    <div className="flex flex-wrap items-end justify-between gap-8 mt-12">
                                        <div className="flex-1">
                                            {slide.before}
                                        </div>
                                        <div className="flex-1 flex justify-end items-center">
                                            {slide.after}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {scrollSnaps.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                    {scrollSnaps.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => onDotButtonClick(index)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 shadow-lg ${
                                index === selectedIndex
                                    ? 'bg-white scale-125'
                                    : 'bg-white/40 hover:bg-white/60'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Carousel;
```

src/widgets/EventDetails/components/ExpandableDescription.tsx:
```tsx
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Text, Title } from '@/shared/ui/Typography';

interface Props {
    text?: string | null;
}

export const ExpandableDescription = ({ text }: Props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!text) return null;

    const isLongText = text.length > 250;

    return (
        <>
            <div className="flex flex-col items-start gap-2 max-w-6xl transition-all duration-300">
                <Text
                    level={2}
                    className={cn(
                        "text-gray-200 drop-shadow-md leading-snug opacity-90 transition-all",
                        isLongText ? "line-clamp-4" : ""
                    )}
                >
                    {text}
                </Text>

                {isLongText && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-blue-400 hover:text-blue-300 font-bold text-3xl uppercase tracking-wider transition-colors focus:outline-none border-b border-transparent hover:border-blue-300 pb-0.5"
                    >
                        Подробнее...
                    </button>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                        onClick={() => setIsModalOpen(false)}
                    />

                    <div className="relative bg-white w-[90dvw] max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-8 border-b border-gray-100">
                            <Title level={3} className="text-gray-900">Описание события</Title>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors text-gray-500 font-bold text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8 sm:p-12 overflow-y-auto custom-scrollbar">
                            <Text level={3} className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {text}
                            </Text>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
```

src/widgets/Footer/index.tsx:
```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';
import { FaTelegram, FaVk } from 'react-icons/fa6';

import Button from '@/shared/ui/Button';
import { Text, Title } from '@/shared/ui/Typography';
import Field from './components/Field';
import { useModal } from '@/shared/context/ModalContext';

const Footer: FC = () => {

    const { openJoinModal } = useModal();

    return (
        <footer className="bg-black text-white py-20 px-6">

            <div className="flex flex-col w-full max-w-primary mx-auto gap-16">

                <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between border-b border-white/10 pb-10">
                    <Title level={2}>Студенческий совет ИУ</Title>
                    <div className="flex gap-6">
                        <Link href="https://t.me/example" target="_blank" className="hover:text-blue-primary transition-colors">
                            <FaTelegram size={40} />
                        </Link>
                        <Link href="https://vk.com/example" target="_blank" className="hover:text-blue-primary transition-colors">
                            <FaVk size={40} />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-10">
                    <div className="flex flex-col gap-6">
                        <Field label="Почта:" value="studsovetiu@yandex.ru" />
                        <Field label="Телефон:" value="8 (800) 555-35-35" />
                    </div>

                    <div className="flex flex-col gap-6 md:items-end md:text-right">
                        <Field label="Адрес:" value="Бригадирский пер., 13, Москва" className="md:items-end" />
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row justify-between items-center gap-10 mt-8">
                    <div className="flex flex-col sm:flex-row gap-6 w-full xl:w-auto">
                        <Button variant="blue" size="inline" className="justify-between sm:justify-center" onClick={() => window.location.href = "https://forms.yandex.ru/u/69b154576d2d73185b353a95"}>
                            <Text level={3}>Хочу к вам</Text>
                            <Image src="/icons/arrow_right.svg" alt="" width={24} height={24} />
                        </Button>
                        <Button variant="outline" size="inlineWithBorder" className="justify-between sm:justify-center border-white text-white hover:bg-white hover:text-black">
                            <Text level={3}>Стать партнёром</Text>
                            <Image src="/icons/arrow_right.svg" alt="" width={24} height={24} className="invert group-hover:invert-0"/>
                        </Button>
                    </div>

                    <div className="flex gap-4 items-center opacity-60 hover:opacity-100 transition-opacity">
                        <Image src="/icons/itstech_logo.svg" alt="ITS Tech" width={40} height={40} />
                        <Text level={3}>Сделано в ITS TECH</Text>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
```

src/widgets/Footer/components/Field.tsx:
```tsx
import type { FC, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Text } from '@/shared/ui/Typography';

interface FieldProps extends HTMLAttributes<HTMLDivElement> {
    label: string;
    value: string;
}

const Field: FC<FieldProps> = ({ label, value, className, ...props }) => {
    return (
        <div
            {...props}
            className={cn('flex flex-col gap-1 sm:gap-2 max-w-[200px]', className)}
        >
            <Text level={4} className="text-white/60 text-sm">
                {label}
            </Text>
            <Text level={4} className="text-white font-medium">
                {value}
            </Text>
        </div>
    );
};

export default Field;
```

src/widgets/Navbar/index.tsx:
```tsx
'use client'
import Link from 'next/link';
import { useState, useEffect, type FC } from 'react';
import { usePathname } from 'next/navigation';

import Button from '@/shared/ui/Button';
import { Caption, Title } from '@/shared/ui/Typography';
import Links from './components/Links';
import Image from 'next/image';
import { useModal } from '@/shared/context/ModalContext';
import links from './links';

const Navbar: FC = () => {
    const { openJoinModal } = useModal();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const pathname = usePathname();
    const [prevPathname, setPrevPathname] = useState(pathname);

    if (pathname !== prevPathname) {
        setPrevPathname(pathname);
        setIsMobileMenuOpen(false);
    }

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header className={`sticky top-0 z-[60] border-b border-gray-100 transition-colors duration-300 ${isMobileMenuOpen ? 'bg-white' : 'bg-white/80 backdrop-blur-md'}`}>
                <div className="flex justify-center items-center py-4 sm:py-6 relative bg-transparent">
                    <div className="flex justify-between items-center w-full max-w-primary px-6">
                        <Link href="/" className="hover:opacity-80 transition-opacity">
                            <Image src="/icons/logo.svg" width={140} height={40} alt="СтудИУ" priority />
                        </Link>

                        <Links />

                        <div className="flex items-center gap-4">
                            <Button variant="black" size="inline" className="hidden lg:flex" onClick={() => window.location.href = "https://forms.yandex.ru/u/69b154576d2d73185b353a95"}>
                                <Caption level={2} className="text-white font-bold">Стать активистом</Caption>
                            </Button>
                            
                            <button 
                                className="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 focus:outline-none"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <span className={`w-7 h-0.5 bg-black transition-all duration-300 origin-center ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                                <span className={`w-7 h-0.5 bg-black transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                                <span className={`w-7 h-0.5 bg-black transition-all duration-300 origin-center ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={`fixed inset-0 top-[50px] sm:top-[50px] bg-white z-[50] lg:hidden transition-transform duration-300 ease-in-out flex flex-col items-center justify-start pt-16 gap-10 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <nav className="flex flex-col items-center gap-8">
                    {links.map((link) => (
                        <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                            <Title level={3} className="text-black hover:text-blue-600 transition-colors">{link.label}</Title>
                        </Link>
                    ))}
                </nav>
                <Button variant="black" size="inline" className="mt-8 flex lg:hidden px-10 py-5" onClick={() => { setIsMobileMenuOpen(false); window.location.href = "https://forms.yandex.ru/u/69b154576d2d73185b353a95" }}>
                    <Title level={5} className="text-white font-bold">Стать активистом</Title>
                </Button>
            </div>
        </>
    );
};

export default Navbar;
```

src/widgets/Navbar/links.ts:
```typescript
export interface LinkProps {
    label: string;
    href: string;
}

const links: LinkProps[] = [
    { label: 'О нас', href: '/#about' },
    { label: 'Новости', href: '/#news' },
    { label: 'Мероприятия', href: '/events' },
    { label: 'Контакты', href: '/#contacts' },
];

export default links;
```

src/widgets/Navbar/components/Links.tsx:
```tsx
import type { FC } from 'react';
import Link from 'next/link';
import links from '../links';
import { Caption } from '@/shared/ui/Typography';

const Links: FC = () => {
    return (
        <nav className="gap-8 hidden lg:flex select-none">
            {links.map((link) => (
                <Link key={link.href} href={link.href}>
                    <Caption className="text-gray-500 hover:text-black transition-colors duration-200 font-medium">
                        {link.label}
                    </Caption>
                </Link>
            ))}
        </nav>
    );
};

export default Links;
```

src/lib/utils.ts:
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
```

src/lib/auth-check.ts:
```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function ensureAdmin() {
    const session = await getServerSession(authOptions);
    return !!session;
};
```

src/lib/upload.ts:
```typescript
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
```

src/lib/db.ts:
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import {Pool} from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prismaClientSingleton = () => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URI
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
        adapter,
        log: ['error', 'warn'],
    });
};

export const db = globalForPrisma.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
```

src/lib/auth.ts:
```typescript
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/admin/login',
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                console.log("--- ПОПЫТКА ВХОДА ---");
                console.log("Email:", credentials?.email);

                if (!credentials?.email || !credentials?.password) {
                    console.log("ОШИБКА: Нет email или пароля");
                    return null;
                }

                try {
                    const user = await db.adminUser.findUnique({
                        where: { email: credentials.email },
                    });

                    if (!user) {
                        console.log("ОШИБКА: Пользователь не найден в БД");
                        const count = await db.adminUser.count();
                        console.log(`Всего админов в базе: ${count}`);
                        return null;
                    }

                    console.log("Пользователь найден, ID:", user.id);
                    console.log("Хеш в базе:", user.password.substring(0, 10) + "...");

                    const isPasswordValid = await compare(credentials.password, user.password);

                    console.log("Результат проверки пароля:", isPasswordValid);

                    if (!isPasswordValid) {
                        console.log("ОШИБКА: Пароль не подошел");
                        return null;
                    }

                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: 'Admin',
                    };
                } catch (e) {
                    console.error("КРИТИЧЕСКАЯ ОШИБКА DB:", e);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.sub,
                },
            };
        },
    },
};
```

src/shared/api/news.ts:
```typescript
import type { AxiosResponse } from 'axios';
import apiClient from './axios';
import type { News, PaginatedResponse } from './types';

const BASE_URL = '/news';

interface ListParams {
    limit?: number;
    offset?: number;
}

export const getNews = (
    params?: ListParams
): Promise<AxiosResponse<PaginatedResponse<News>>> => {
    return apiClient.get(BASE_URL + '/', { params });
};

export const getNewsById = (
    id: number
): Promise<AxiosResponse<News>> => {
    return apiClient.get(`${BASE_URL}/${id}/`);
};

export const createNews = (data: unknown) => {
    return apiClient.post(BASE_URL + '/', data);
};

export const updateNews = (id: number, data: unknown) => {
    return apiClient.put(`${BASE_URL}/${id}/`, data);
};

export const deleteNews = (id: number) => {
    return apiClient.delete(`${BASE_URL}/${id}/`);
};
```

src/shared/api/axios.ts:
```typescript
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v0';

const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 10000,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.detail || error.message || 'Произошла неизвестная ошибка';
        toast.error(message);
        console.warn('[API Error]:', message);
        return Promise.reject(error);
    }
);

export default apiClient;
```

src/shared/api/types.ts:
```typescript
export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ImageObject {
    id: number;
    image: string;
}

export interface FutureEvent {
    id: number;
    name: string;
    description: string;
    images: ImageObject[];
    place: string;
    date_range?: string;
    start_datetime: string;
    end_datetime?: string | null;
    registration_link?: string | null;
    color?: string;
    precision?: string;
}

export interface PastEvent {
    id: number;
    name: string;
    description: string;
    images: ImageObject[];
    start_datetime: string;
    place: string;
    end_datetime?: string | null;
    album_link?: string | null;
    report_link?: string | null;
    color: string;
    precision?: string;
}

export interface News {
    id: number;
    title: string;
    description: string;
    cover_url: string;
    created_at: string;
}

export interface Partner {
    id: number;
    name: string;
    url: string;
    image: string;
}

export interface ContactMember {
    id: number;
    name: string;
    role: string;
    avatar_url: string;
}
```

src/shared/api/events.ts:
```typescript
import type { AxiosResponse } from 'axios';
import apiClient from './axios';
import type {
    FutureEvent,
    PastEvent,
    PaginatedResponse
} from './types';

interface ListParams {
    limit?: number;
    offset?: number;
}

const FUTURE_BASE_URL = '/events/future_events';
const EVENTS_BASE_URL = '/events';

export const getFutureEvents = (
    params?: ListParams
): Promise<AxiosResponse<PaginatedResponse<FutureEvent>>> => {
    return apiClient.get(FUTURE_BASE_URL + '/', { params });
};

export const getFutureEventById = (
    id: number
): Promise<AxiosResponse<FutureEvent>> => {
    return apiClient.get(`${EVENTS_BASE_URL}/${id}`);
};

export const createFutureEvent = (data: unknown) => {
    return apiClient.post(FUTURE_BASE_URL + '/', data);
};

export const updateFutureEvent = (id: number, data: unknown) => {
    return apiClient.put(`${EVENTS_BASE_URL}/${id}`, data);
};

export const deleteFutureEvent = (id: number) => {
    return apiClient.delete(`${EVENTS_BASE_URL}/${id}`);
};

const PAST_BASE_URL = '/events/past_events';

export const getPastEvents = (
    params?: ListParams
): Promise<AxiosResponse<PaginatedResponse<PastEvent>>> => {
    return apiClient.get(PAST_BASE_URL + '/', { params });
};

export const getPastEventById = (
    id: number
): Promise<AxiosResponse<PastEvent>> => {
    return apiClient.get(`${EVENTS_BASE_URL}/${id}`);
};

export const createPastEvent = (data: unknown) => {
    return apiClient.post(PAST_BASE_URL + '/', data);
};

export const updatePastEvent = (id: number, data: unknown) => {
    return apiClient.put(`${PAST_BASE_URL}/${id}/`, data);
};

export const deletePastEvent = (id: number) => {
    return apiClient.delete(`${PAST_BASE_URL}/${id}/`);
};

export const createEvent = (formData: FormData) => {
    return apiClient.post(EVENTS_BASE_URL, formData);
};
```

src/shared/api/index.ts:
```typescript
export * from './axios';
export * from './types';
export * from './events';
export * from './news';
export * from './partners';
```

src/shared/api/partners.ts:
```typescript
import type { AxiosResponse } from 'axios';
import apiClient from './axios';
import type { Partner, PaginatedResponse } from './types';

const BASE_URL = '/partners';

interface ListParams {
    limit?: number;
    offset?: number;
}

export const getPartners = (
    params?: ListParams
): Promise<AxiosResponse<PaginatedResponse<Partner>>> => {
    return apiClient.get(BASE_URL + '/', { params });
};

export const getPartnerById = (
    id: number
): Promise<AxiosResponse<Partner>> => {
    return apiClient.get(`${BASE_URL}/${id}/`);
};

export const createPartner = (data: unknown) => {
    return apiClient.post(BASE_URL + '/', data);
};

export const updatePartner = (id: number, data: unknown) => {
    return apiClient.put(`${BASE_URL}/${id}/`, data);
};

export const deletePartner = (id: number) => {
    return apiClient.delete(`${BASE_URL}/${id}/`);
};
```

src/shared/hooks/useNews.ts:
```typescript
import { useQuery } from '@tanstack/react-query';
import { getNews, getNewsById } from '@/shared/api';

export const useNewsList = (limit = 3) => {
    return useQuery({
        queryKey: ['newsList', limit],
        queryFn: () => getNews({ limit }).then((res) => res.data.results),
        staleTime: 5 * 60 * 1000,
    });
};

export const useNewsDetails = (id: number) => {
    return useQuery({
        queryKey: ['newsDetails', id],
        queryFn: () => getNewsById(id).then((res) => res.data),
        enabled: !isNaN(id),
    });
};
```

src/shared/hooks/useEvents.ts:
```typescript
import { useQuery } from '@tanstack/react-query';
import {
    getFutureEvents,
    getPastEvents,
    getFutureEventById,
    getPastEventById,
    type FutureEvent,
    type PastEvent
} from '@/shared/api';

export const useFutureEvents = (limit = 10) => {
    return useQuery<FutureEvent[], Error>({
        queryKey: ['futureEvents', limit],
        queryFn: () => getFutureEvents({ limit }).then((res) => res.data.results),
        staleTime: 5 * 60 * 1000,
    });
};

export const usePastEvents = (limit = 6) => {
    return useQuery<PastEvent[], Error>({
        queryKey: ['pastEvents', limit],
        queryFn: () => getPastEvents({ limit }).then((res) => res.data.results),
    });
};

type EventDetailType = FutureEvent | PastEvent;

export const useEventDetails = (id: number, type: 'future' | 'past') => {
    return useQuery<EventDetailType, Error>({
        queryKey: [type, id],
        queryFn: async () => {
            const fn = type === 'future' ? getFutureEventById : getPastEventById;
            const response = await fn(id);
            return response.data;
        },
        enabled: !isNaN(id),
    });
};
```

src/shared/hooks/usePartners.ts:
```typescript
import { useQuery } from '@tanstack/react-query';
import { getPartners } from '@/shared/api';

export const usePartners = (limit = 12) => {
    return useQuery({
        queryKey: ['partnersList', limit],
        queryFn: () => getPartners({ limit }).then((res) => res.data.results),
        staleTime: 10 * 60 * 1000,
    });
};
```

src/shared/utils/useDotButton.ts:
```typescript
'use client';

import type { UseEmblaCarouselType } from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';

type EmblaApiType = UseEmblaCarouselType[1];

export const useDotButton = (emblaApi: EmblaApiType | undefined) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const onDotButtonClick = useCallback(
        (index: number) => {
            if (!emblaApi) return;
            emblaApi.scrollTo(index);
        },
        [emblaApi]
    );

    const onInit = useCallback((api: EmblaApiType) => {
        if (!api) return;
        setScrollSnaps(api.scrollSnapList());
    }, []);

    const onSelect = useCallback((api: EmblaApiType) => {
        if (!api) return;
        setSelectedIndex(api.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!emblaApi) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        onInit(emblaApi);
        onSelect(emblaApi);

        emblaApi
            .on('reInit', onInit)
            .on('reInit', onSelect)
            .on('select', onSelect);

    }, [emblaApi, onInit, onSelect]);

    return {
        selectedIndex,
        scrollSnaps,
        onDotButtonClick,
    };
};

export default useDotButton;
```

src/shared/utils/useHorizontalScroll.ts:
```typescript
'use client';
import { useRef, useEffect } from 'react';

export default function useHorizontalScroll() {
    const elRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = elRef.current;
        if (!el) return;

        const isTouch = window.matchMedia('(pointer: coarse)').matches;

        const onWheel = (e: WheelEvent) => {
            if (isTouch) return;
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
            if (e.deltaY === 0 || e.shiftKey) return;

            const isAtLeft = el.scrollLeft <= 0;
            const isAtRight = Math.abs(el.scrollLeft + el.clientWidth - el.scrollWidth) <= 1;

            if ((isAtLeft && e.deltaY < 0) || (isAtRight && e.deltaY > 0)) {
                return;
            }

            e.preventDefault();
            el.scrollBy({
                left: e.deltaY > 0 ? 350 : -350,
                behavior: 'smooth'
            });
        };

        let isDown = false;
        let startX: number;
        let scrollLeft: number;
        let isDragging = false;

        const onMouseDown = (e: MouseEvent) => {
            if (isTouch) return;
            isDown = true;
            isDragging = false;
            startX = e.pageX - el.offsetLeft;
            scrollLeft = el.scrollLeft;
            el.style.cursor = 'grabbing';
        };

        const onMouseLeave = () => {
            if (!isDown) return;
            isDown = false;
            el.style.cursor = 'grab';
        };

        const onMouseUp = () => {
            if (!isDown) return;
            isDown = false;
            el.style.cursor = 'grab';
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!isDown || isTouch) return;
            e.preventDefault();
            
            const x = e.pageX - el.offsetLeft;
            const walk = (x - startX) * 1.5;
            
            if (Math.abs(walk) > 5) {
                isDragging = true;
            }
            
            el.scrollLeft = scrollLeft - walk;
        };

        const onClick = (e: MouseEvent) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        if (!isTouch) {
            el.style.cursor = 'grab';
        }

        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('mousedown', onMouseDown);
        el.addEventListener('mouseleave', onMouseLeave);
        el.addEventListener('mouseup', onMouseUp);
        el.addEventListener('mousemove', onMouseMove);
        el.addEventListener('click', onClick, true); 

        return () => {
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('mousedown', onMouseDown);
            el.removeEventListener('mouseleave', onMouseLeave);
            el.removeEventListener('mouseup', onMouseUp);
            el.removeEventListener('mousemove', onMouseMove);
            el.removeEventListener('click', onClick, true);
        };
    },[]);
    
    return elRef;
}
```

src/shared/utils/formatDate.ts:
```typescript
export default function formatDate(
    date: string | Date | undefined,
    endDate?: string | Date | null,
    precision: string = 'day'
): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const getOpts = (p: string): Intl.DateTimeFormatOptions => {
        if (p === 'time') return { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        if (p === 'day') return { day: '2-digit', month: '2-digit', year: 'numeric' };
        if (p === 'month') return { month: 'long', year: 'numeric' };
        if (p === 'year') return { year: 'numeric' };
        return { day: '2-digit', month: '2-digit', year: 'numeric' };
    };

    const formatter = new Intl.DateTimeFormat('ru-RU', getOpts(precision));
    let result = formatter.format(d);

    if (endDate) {
        const ed = new Date(endDate);
        if (!isNaN(ed.getTime())) {
            result += ' — ' + formatter.format(ed);
        }
    }

    if (precision === 'month') {
        result = result.charAt(0).toUpperCase() + result.slice(1);
    }
    return result;
}
```

src/shared/utils/index.ts:
```typescript
export { default as formatDate } from './formatDate';
export { default as useHorizontalScroll } from './useHorizontalScroll';
export * from './useDotButton';
```

src/shared/utils/getImageUrl.ts:
```typescript
export function getImageUrl(path: string | null | undefined): string {
    if (!path) return '/placeholder.png';

    if (path.startsWith('blob:') || path.startsWith('http') || path.startsWith('https')) {
        return path;
    }

    if (path.startsWith('/api/storage')) {
        return path;
    }

    return `/api/storage/${path.startsWith('/') ? path.slice(1) : path}`;
}
```

src/shared/context/ModalContext.tsx:
```tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import JoinModal from '@/widgets/JoinModal';

interface ModalContextType {
    openJoinModal: () => void;
    closeJoinModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openJoinModal = () => setIsOpen(true);
    const closeJoinModal = () => setIsOpen(false);

    return (
        <ModalContext.Provider value={{ openJoinModal, closeJoinModal }}>
            {children}
            <JoinModal isOpen={isOpen} onClose={closeJoinModal} />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModal must be used within ModalProvider');
    return context;
};
```

src/shared/ui/AdminActions.tsx:
```tsx
'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import apiClient from '@/shared/api/axios';

interface AdminActionsProps {
    id: number;
    basePath: string;
    apiPath: string;
}

export const AdminActions = ({ id, basePath, apiPath }: AdminActionsProps) => {
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;

        try {
            await apiClient.delete(`${apiPath}/${id}`);
            toast.success('Успешно удалено');
            router.refresh();
        } catch {
            toast.error('Ошибка при удалении');
        }
    };

    const handleEdit = () => {
        router.push(`${basePath}/${id}`);
    };

    return (
        <div className="flex justify-end gap-2 sm:gap-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
                onClick={handleEdit}
                className="text-gray-600 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors font-bold text-sm sm:text-lg"
            >
                Изменить
            </button>
            <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-4 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl transition-colors font-bold text-sm sm:text-lg"
            >
                Удалить
            </button>
        </div>
    );
};
```

src/shared/ui/index.ts:
```typescript
export { default as Button } from './Button';
export { Title, Text, Caption } from './Typography';
```

src/shared/ui/Typography/Title.tsx:
```tsx
import { cn } from '@/lib/utils';
import React from 'react';

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface TitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: TitleLevel;
}

const styles: Record<TitleLevel, string> = {
    1: 'clamp(calc(var(--text-4xl)*var(--dpr-ratio)), 5vw, var(--text-h8xl))',
    2: 'clamp(calc(var(--text-3xl)*var(--dpr-ratio)), 5vw, calc(var(--text-6xl)*var(--dpr-ratio)))',
    3: 'clamp(calc(var(--text-3xl)*var(--dpr-ratio)), 5vw, calc(var(--text-5xl)*var(--dpr-ratio)))',
    4: 'clamp(calc(var(--text-xl)*var(--dpr-ratio)), 5vw, var(--text-h4xl))',
    5: 'clamp(calc(var(--text-xl)*var(--dpr-ratio)), 5vw, calc(var(--text-4xl)*var(--dpr-ratio)))',
    6: 'text-2xl',
};

export const Title: React.FC<TitleProps> = ({ level = 1, children, className, ...props }) => {
    const Tag = `h${level}` as const;

    return (
        <Tag
            className={cn('font-bold', className)}
            style={{ fontSize: styles[level] }}
            {...props}
        >
            {children}
        </Tag>
    );
};
```

src/shared/ui/Typography/Caption.tsx:
```tsx
import { cn } from '@/lib/utils';
import React from 'react';

type CaptionLevel = 1 | 2;

interface CaptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    level?: CaptionLevel;
}

const styles: Record<CaptionLevel, string> = {
    1: 'calc(var(--text-2xl)*var(--dpr-ratio))',
    2: 'clamp(calc(var(--text-sm)*var(--dpr-ratio)), 5vw, calc(var(--text-xl)*var(--dpr-ratio)))',
};

export const Caption: React.FC<CaptionProps> = ({
                                                    level = 1,
                                                    children,
                                                    className,
                                                    style,
                                                    ...props
                                                }) => {
    return (
        <p
            className={cn('font-normal text-gray-500', className)}
            style={{
                fontSize: styles[level],
                ...style,
            }}
            {...props}
        >
            {children}
        </p>
    );
};
```

src/shared/ui/Typography/index.ts:
```typescript
export { Title } from './Title';
export { Text } from './Text';
export { Caption } from './Caption';
```

src/shared/ui/Typography/Text.tsx:
```tsx
import { cn } from '@/lib/utils';
import React from 'react';

type TextLevel = 1 | 2 | 3 | 4;

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    level?: TextLevel;
}

const styles: Record<TextLevel, string> = {
    1: 'clamp(calc(var(--text-xl)*var(--dpr-ratio)), 5vw, var(--text-h4xl))',
    2: 'clamp(calc(var(--text-lg)*var(--dpr-ratio)), 5vw, calc(var(--text-4xl)*var(--dpr-ratio)))',
    3: 'clamp(calc(var(--text-base)*var(--dpr-ratio)), 5vw, var(--text-h3xl))',
    4: 'clamp(calc(var(--text-lg)*var(--dpr-ratio)), 5vw, var(--text-wh3xl))',
};

export const Text: React.FC<TextProps> = ({
                                              level = 1,
                                              children,
                                              className,
                                              style,
                                              ...props
                                          }) => {
    return (
        <p
            className={cn('font-normal', className)}
            style={{
                fontSize: styles[level],
                ...style,
            }}
            {...props}
        >
            {children}
        </p>
    );
};
```

src/shared/ui/Button/index.tsx:
```tsx
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    {
        variants: {
            variant: {
                default:
                    'bg-primary text-primary-foreground shadow-xs hover:bg-primary/90',
                destructive:
                    'bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
                outline:
                    'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
                secondary:
                    'bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80',
                ghost:
                    'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
                link: 'text-primary underline-offset-4 hover:underline',
                black:
                    'bg-black text-white hover:brightness-85 transition-all duration-300 ease-in-out cursor-pointer gap-4',
                white:
                    'bg-white text-black hover:bg-white/90 transition-colors duration-300 ease-in-out cursor-pointer',
                blue: 'bg-blue-primary text-white text-center hover:bg-blue-primary/90 transition-colors duration-300 ease-in-out cursor-pointer gap-4',
            },
            size: {
                default: 'h-9 px-4 py-2 has-[>svg]:px-3',
                sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
                lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
                icon: 'size-9',
                inline: 'px-8 py-4 rounded-[3rem]',
                primary: 'px-8 py-4 sm:px-16 sm:py-8 rounded-[3rem]',
                full: 'px-8 py-4 flex flex-1 rounded-[3rem] h-fit',
                inlineWithBorder:
                    'px-8 py-4 rounded-[3rem] border-2 solid border-white',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';

export default Button;
```

src/features/SecretLoginListener.tsx:
```tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const SecretLoginListener = () => {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
                e.preventDefault();
                router.push('/admin/login');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return null;
};
```

src/features/HashScrollFix.tsx:
```tsx
'use client';
import { useEffect } from 'react';

export function HashScrollFix() {
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const a = target.closest('a');
            if (!a) return;
            const href = a.getAttribute('href');
            if (href && href.includes('#')) {
                const id = href.split('#')[1];
                const el = document.getElementById(id);
                if (el) {
                    e.preventDefault();
                    el.scrollIntoView({ behavior: 'smooth' });
                    window.history.pushState(null, '', href);
                }
            }
        };
        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    },[]);
    return null;
}
```

src/app/layout.tsx:
```tsx
import type { Metadata } from 'next';
import './globals.css';
import localFont from 'next/font/local';
import { Providers } from './providers';
import { SecretLoginListener } from '@/features/SecretLoginListener';
import { ModalProvider } from '@/shared/context/ModalContext';
import { HashScrollFix } from '@/features/HashScrollFix';

const alsSector = localFont({
    variable: '--font-als-sector',
    display: 'swap',
    src: [
        {
            path: '../assets/fonts/ALS_Sector-Regular.otf',
            weight: '400',
            style: 'normal',
        },
        {
            path: '../assets/fonts/ALS_Sector-Bold.otf',
            weight: '600',
            style: 'normal',
        },
    ],
});

export const metadata: Metadata = {
    title: 'СтудИУ',
    description: 'Студенческий совет ИУ',
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <body className={`antialiased ${alsSector.className} bg-gray-50`}>
        <Providers>
            <ModalProvider>
                <HashScrollFix />
                <SecretLoginListener />
                {children}
            </ModalProvider>
        </Providers>
        </body>
        </html>
    );
}
```

src/app/globals.css:
```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

@theme {
    --color-brown-700: #533333;
    --color-purple-neon: #c21cff;
    --color-blue-sky: #2440de;
    --color-blue-primary: #3a7fff;
    --color-indigo-deep: #2440de;
    --color-green-neon: #1de474;

    --text-wh3xl: calc(1.75rem * var(--dpr-ratio));
    --text-h3xl: calc(2rem * var(--dpr-ratio));
    --text-h4xl: calc(2.5rem * var(--dpr-ratio));
    --text-h8xl: calc(5.625rem * var(--dpr-ratio));

    --max-width-primary: 180rem;
}

:root {
    --dpr-ratio: 1.5;
    --radius: 0.625rem;
}

@layer base {
    * {
        @apply border-gray-200 outline-blue-primary/50;
    }
    body {
        @apply bg-white text-black min-h-dvh antialiased;
    }
    html {
        scroll-padding-top: 6.5rem;
        scroll-behavior: smooth;
    }
}

html {
    font-size: clamp(0.2rem, 0.4vw + 0.1rem, 0.6rem);
}

@media (width <= 40rem) {
    html {
        font-size: clamp(0.2rem, 1.2vw + 0.1rem, 0.6rem);
    }
}

.scrolling-active {
    scroll-snap-type: none;
}

@layer utilities {
    .scrollbar-hide {
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .scrollbar-hide::-webkit-scrollbar {
        display: none;
    }
}
```

src/app/providers.tsx:
```tsx
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 60 * 1000,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}

            <Toaster
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: '#222',
                        color: '#fff',
                        borderRadius: '16px',
                        fontSize: '1.25rem',
                        padding: '16px 24px',
                        maxWidth: '600px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    }
                }}
            />

            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}
```

src/app/api/storage/[...path]/route.ts:
```typescript
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
        ".webp": "image/webp"
    };

    return new NextResponse(fileBuffer, {
        headers: {
            "Content-Type": mimeTypes[ext] || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
```

src/app/api/auth/[...nextauth]/route.ts:
```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

src/app/api/v0/events/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import type { EventType, Precision } from '@prisma/client';
import { ensureAdmin } from '@/lib/auth-check';

export async function POST(req: NextRequest) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        const type = formData.get('type') as EventType;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const place = formData.get('place') as string;
        const color = formData.get('color') as string;
        const precisionStr = formData.get('precision') as string || 'time';
        const precision = precisionStr as Precision;

        let startDatetimeStr = formData.get('start_datetime') as string;
        if (!startDatetimeStr) {
            return NextResponse.json({ error: 'Не указана дата начала' }, { status: 400 });
        }
        
        if (precision === 'month' && /^\d{4}-\d{2}$/.test(startDatetimeStr)) startDatetimeStr += '-01T00:00';
        else if (precision === 'year' && /^\d{4}$/.test(startDatetimeStr)) startDatetimeStr += '-01-01T00:00';

        const start_datetime = new Date(startDatetimeStr);
        if (isNaN(start_datetime.getTime())) {
            return NextResponse.json({ error: 'Некорректный формат даты' }, { status: 400 });
        }

        if (type === 'FUTURE' && start_datetime < new Date() && precision === 'time') {
            return NextResponse.json({ error: 'Предстоящее событие не может быть в прошлом' }, { status: 400 });
        }

        let endDatetimeStr = formData.get('end_datetime') as string;
        if (endDatetimeStr) {
            if (precision === 'month' && /^\d{4}-\d{2}$/.test(endDatetimeStr)) endDatetimeStr += '-01T00:00';
            else if (precision === 'year' && /^\d{4}$/.test(endDatetimeStr)) endDatetimeStr += '-01-01T00:00';
        }
        const end_datetime = endDatetimeStr ? new Date(endDatetimeStr) : null;

        const registration_link = formData.get('registration_link') as string;
        const album_link = formData.get('album_link') as string;

        const images = formData.getAll('images') as File[];

        const event = await db.event.create({
            data: {
                type,
                name,
                description,
                place,
                color,
                precision,
                start_datetime,
                end_datetime,
                registration_link: (type === 'FUTURE' && registration_link) ? registration_link : null,
                album_link: (type === 'PAST' && album_link) ? album_link : null,
            }
        });

        for (const file of images) {
            if (file && file.size > 0) {
                const path = await saveFile(file, 'events');
                if (path) {
                    await db.eventImage.create({
                        data: {
                            image: path,
                            event_id: event.id
                        }
                    });
                }
            }
        }

        return NextResponse.json(event, { status: 201 });
    } catch (e) {
        console.error('Ошибка при создании события:', e);
        return NextResponse.json({ error: 'Server Error', details: String(e) }, { status: 500 });
    }
}
```

src/app/api/v0/events/past_events/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const offset = Number(searchParams.get('offset')) || 0;

    const [count, events] = await db.$transaction([
        db.event.count({ where: { type: 'PAST' } }),
        db.event.findMany({
            where: { type: 'PAST' },
            take: limit,
            skip: offset,
            orderBy: { start_datetime: 'desc' },
            include: { images: true }
        })
    ]);

    return NextResponse.json({
        count,
        next: count > offset + limit ? `/api/v0/events/past_events?limit=${limit}&offset=${offset + limit}` : null,
        previous: offset > 0 ? `/api/v0/events/past_events?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
        results: events,
    });
}
```

src/app/api/v0/events/[id]/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { ensureAdmin } from '@/lib/auth-check';
import type { EventType, Precision } from '@prisma/client';

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const event = await db.event.findUnique({
        where: { id },
        include: { images: true },
    });

    if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(event);
}

export async function PUT(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    try {
        const formData = await req.formData();

        const type = formData.get('type') as EventType;
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const place = formData.get('place') as string;
        const color = formData.get('color') as string;
        const precisionStr = formData.get('precision') as string || 'time';
        const precision = precisionStr as Precision;

        let startDatetimeStr = formData.get('start_datetime') as string;
        if (precision === 'month' && /^\d{4}-\d{2}$/.test(startDatetimeStr)) startDatetimeStr += '-01T00:00';
        else if (precision === 'year' && /^\d{4}$/.test(startDatetimeStr)) startDatetimeStr += '-01-01T00:00';
        const start_datetime = new Date(startDatetimeStr);

        if (type === 'FUTURE' && start_datetime < new Date() && precision === 'time') {
            return NextResponse.json({ error: 'Предстоящее событие не может быть в прошлом' }, { status: 400 });
        }

        let endDatetimeStr = formData.get('end_datetime') as string;
        if (endDatetimeStr) {
            if (precision === 'month' && /^\d{4}-\d{2}$/.test(endDatetimeStr)) endDatetimeStr += '-01T00:00';
            else if (precision === 'year' && /^\d{4}$/.test(endDatetimeStr)) endDatetimeStr += '-01-01T00:00';
        }
        const end_datetime = endDatetimeStr ? new Date(endDatetimeStr) : null;

        const registration_link = formData.get('registration_link') as string;
        const album_link = formData.get('album_link') as string;

        const imageFile = formData.get('images') as File;

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
                registration_link: (type === 'FUTURE' && registration_link) ? registration_link : null,
                album_link: (type === 'PAST' && album_link) ? album_link : null,
            }
        });

        if (imageFile && imageFile.size > 0) {
            const path = await saveFile(imageFile, 'events');
            if (path) {
                await db.eventImage.deleteMany({ where: { event_id: id } });
                await db.eventImage.create({
                    data: {
                        image: path,
                        event_id: id
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    await db.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
}
```

src/app/api/v0/events/future_events/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const offset = Number(searchParams.get('offset')) || 0;

    const [count, events] = await db.$transaction([
        db.event.count({ where: { type: 'FUTURE' } }),
        db.event.findMany({
            where: { type: 'FUTURE' },
            take: limit,
            orderBy: { start_datetime: 'asc' },
            skip: offset,
            include: { images: true }
        })
    ]);

    return NextResponse.json({
        count,
        next: count > offset + limit ? `/api/v0/events/future_events?limit=${limit}&offset=${offset + limit}` : null,
        previous: offset > 0 ? `/api/v0/events/future_events?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
        results: events,
    });
}
```

src/app/api/v0/board_members/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { ensureAdmin } from '@/lib/auth-check';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 20;
    const offset = Number(searchParams.get('offset')) || 0;

    const [count, members] = await db.$transaction([
        db.boardMember.count(),
        db.boardMember.findMany({
            take: limit,
            skip: offset,
            orderBy: { start_date: 'desc' },
        }),
    ]);

    return NextResponse.json({
        count,
        next: count > offset + limit ? `/api/v0/board_members?limit=${limit}&offset=${offset + limit}` : null,
        previous: offset > 0 ? `/api/v0/board_members?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
        results: members.map(m => ({
            ...m,
            start_date: m.start_date.toISOString().split('T')[0]
        })),
    });
}

export async function POST(req: NextRequest) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        const imageFile = formData.get('image') as File | null;
        const imagePath = await saveFile(imageFile, 'members');

        const member = await db.boardMember.create({
            data: {
                name: formData.get('name') as string,
                position: formData.get('position') as string,
                telegram_link: formData.get('telegram_link') as string,
                description: formData.get('description') as string,
                start_date: new Date(formData.get('start_date') as string),
                image: imagePath,
            },
        });

        return NextResponse.json(member, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
```

src/app/api/v0/board_members/[id]/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { ensureAdmin } from '@/lib/auth-check';

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const member = await db.boardMember.findUnique({ where: { id } });
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(member);
}

export async function PUT(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    try {
        const formData = await req.formData();

        const data: any = {
            name: formData.get('name') as string,
            position: formData.get('position') as string,
            telegram_link: formData.get('telegram_link') as string,
            description: formData.get('description') as string,
            start_date: new Date(formData.get('start_date') as string),
        };

        const imageFile = formData.get('image') as File | null;

        if (imageFile && imageFile.size > 0) {
            const imagePath = await saveFile(imageFile, 'members');
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
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: idStr } = await params;
    await db.boardMember.delete({ where: { id: parseInt(idStr) } });
    return NextResponse.json({ success: true });
}
```

src/app/api/v0/join_requests/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-check';
import type { RequestStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as RequestStatus | null;
    const department = searchParams.get('department');

    const where: any = {};
    if (status && status !== 'ALL' as any) where.status = status;
    if (department && department !== 'ALL') where.department = department;

    try {
        const requests = await db.joinRequest.findMany({
            where,
            orderBy: { created_at: 'desc' },
        });

        return NextResponse.json(requests);
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
```

src/app/api/v0/join_requests/[id]/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ensureAdmin } from '@/lib/auth-check';
import type { RequestStatus } from '@prisma/client';

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const request = await db.joinRequest.findUnique({ where: { id: parseInt(id) } });

    if (!request) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(request);
}

export async function PUT(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    try {
        const updated = await db.joinRequest.update({
            where: { id: parseInt(id) },
            data: {
                status: body.status as RequestStatus,
                admin_comment: body.admin_comment,
            },
        });
        return NextResponse.json(updated);
    } catch {
        return NextResponse.json({ error: 'Error updating' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    await db.joinRequest.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
}
```

src/app/api/v0/partners/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { ensureAdmin } from '@/lib/auth-check';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 12;
    const offset = Number(searchParams.get('offset')) || 0;

    const [count, partners] = await db.$transaction([
        db.partner.count(),
        db.partner.findMany({
            take: limit,
            skip: offset,
            orderBy: { id: 'desc' },
        }),
    ]);

    return NextResponse.json({
        count,
        next: count > offset + limit ? `/api/v0/partners?limit=${limit}&offset=${offset + limit}` : null,
        previous: offset > 0 ? `/api/v0/partners?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
        results: partners,
    });
}

export async function POST(req: NextRequest) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const url = formData.get('url') as string;
        const imageFile = formData.get('image') as File;

        if (!imageFile) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        const imagePath = await saveFile(imageFile, 'partners');

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
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
```

src/app/api/v0/partners/[id]/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { ensureAdmin } from '@/lib/auth-check';

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const partner = await db.partner.findUnique({ where: { id } });
    if (!partner) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(partner);
}

export async function PUT(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const url = formData.get('url') as string;
        const imageFile = formData.get('image') as File;

        const updateData: any = { name, url };

        if (imageFile && imageFile.size > 0) {
            const path = await saveFile(imageFile, 'partners');
            if (path) updateData.image = path;
        }

        await db.partner.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: idStr } = await params;
    await db.partner.delete({ where: { id: parseInt(idStr) } });
    return NextResponse.json({ success: true });
}
```

src/app/api/v0/news/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { ensureAdmin } from '@/lib/auth-check';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Number(searchParams.get('limit')) || 10;
    const offset = Number(searchParams.get('offset')) || 0;

    const [count, news] = await db.$transaction([
        db.news.count(),
        db.news.findMany({
            take: limit,
            skip: offset,
            orderBy: { created_at: 'desc' },
        }),
    ]);

    return NextResponse.json({
        count,
        next: count > offset + limit ? `/api/v0/news?limit=${limit}&offset=${offset + limit}` : null,
        previous: offset > 0 ? `/api/v0/news?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
        results: news.map(n => ({
            ...n,
            created_at: n.created_at.toISOString()
        })),
    });
}

export async function POST(req: NextRequest) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const coverFile = formData.get('cover') as File | null;

        const coverUrl = await saveFile(coverFile, 'news');

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
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
```

src/app/api/v0/news/[id]/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { saveFile } from '@/lib/upload';
import { ensureAdmin } from '@/lib/auth-check';

type Props = {
    params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, { params }: Props) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const news = await db.news.findUnique({ where: { id } });
    if (!news) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(news);
}

export async function PUT(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: idStr } = await params;
    const id = parseInt(idStr);

    try {
        const formData = await req.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const coverFile = formData.get('cover') as File;

        const updateData: any = {
            title,
            description,
        };

        if (coverFile && coverFile.size > 0) {
            const path = await saveFile(coverFile, 'news');
            if (path) updateData.cover_url = path;
        }

        await db.news.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: Props) {
    if (!await ensureAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id: idStr } = await params;
    await db.news.delete({ where: { id: parseInt(idStr) } });
    return NextResponse.json({ success: true });
}
```

src/app/api/v0/join/route.ts:
```typescript
import { type NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (!body.name || !body.group || !body.telegram || !body.department) {
            return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 400 });
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
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
```

src/app/(public)/layout.tsx:
```tsx
import Navbar from '@/widgets/Navbar';
import Footer from '@/widgets/Footer';

export default function PublicLayout({
                                         children,
                                     }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />
            <main className="flex-1 w-full">{children}</main>
            <Footer />
        </div>
    );
}
```

src/app/(public)/page.tsx:
```tsx
import About from '@/sections/About';
import Additional from '@/sections/Additional';
import Events from '@/sections/Events';
import News from '@/sections/News';
import EventsCarousel from '@/widgets/EventsCarousel';

export default function Home() {
    return (
        <main className="flex flex-col min-h-screen">
            <EventsCarousel />
            <About />
            <News />
            <Events />
            <Additional />
        </main>
    );
}
```

src/app/(public)/policy/page.tsx:
```tsx
'use client';

import { Title, Text } from '@/shared/ui/Typography';
import Button from '@/shared/ui/Button';
import { useRouter } from 'next/navigation';

export default function PolicyPage() {
    const router = useRouter();

    return (
        <section className="flex flex-col w-[90dvw] mx-auto py-12 pb-24 gap-10">
            <Button
                variant="outline"
                size="inline"
                onClick={() => router.back()}
                className="w-fit border-gray-300 hover:border-black hover:bg-gray-50 transition-colors gap-3"
            >
                <span className="text-xl">←</span>
                <Text level={4} className="font-bold">Назад</Text>
            </Button>

            <div className="flex flex-col gap-8">
                <Title level={1}>Политика в отношении обработки персональных данных</Title>

                <div className="flex flex-col gap-6 text-gray-800 bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-sm">

                    <div>
                        <Title level={4} className="mb-2">1. Общие положения</Title>
                        <Text level={4} className="leading-relaxed">
                            Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» (далее — Закон о персональных данных) и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые Студенческим советом ИУ (далее — Оператор).<br/><br/>
                            1.1. Оператор ставит своей важнейшей целью и условием осуществления своей деятельности соблюдение прав и свобод человека и гражданина при обработке его персональных данных, в том числе защиты прав на неприкосновенность частной жизни, личную и семейную тайну.<br/>
                            1.2. Настоящая политика Оператора в отношении обработки персональных данных (далее — Политика) применяется ко всей информации, которую Оператор может получить о посетителях веб-сайта https://studiu.ru.
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">2. Основные понятия, используемые в Политике</Title>
                        <Text level={4} className="leading-relaxed">
                            2.1. Автоматизированная обработка персональных данных — обработка персональных данных с помощью средств вычислительной техники.<br/>
                            2.2. Блокирование персональных данных — временное прекращение обработки персональных данных (за исключением случаев, если обработка необходима для уточнения персональных данных).<br/>
                            2.3. Веб-сайт — совокупность графических и информационных материалов, а также программ для ЭВМ и баз данных, обеспечивающих их доступность в сети интернет по сетевому адресу https://studiu.ru.<br/>
                            2.4. Информационная система персональных данных — совокупность содержащихся в базах данных персональных данных, и обеспечивающих их обработку информационных технологий и технических средств.<br/>
                            2.5. Обезличивание персональных данных — действия, в результате которых невозможно определить без использования дополнительной информации принадлежность персональных данных конкретному Пользователю или иному субъекту персональных данных.<br/>
                            2.6. Обработка персональных данных — любое действие (операция) или совокупность действий (операций), совершаемых с использованием средств автоматизации или без использования таких средств с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.<br/>
                            2.7. Оператор — государственный орган, муниципальный орган, юридическое или физическое лицо, самостоятельно или совместно с другими лицами организующие и (или) осуществляющие обработку персональных данных, а также определяющие цели обработки персональных данных, состав персональных данных, подлежащих обработке, действия (операции), совершаемые с персональными данными.<br/>
                            2.8. Персональные данные — любая информация, относящаяся прямо или косвенно к определенному или определяемому Пользователю веб-сайта https://studiu.ru.<br/>
                            2.9. Пользователь — любой посетитель веб-сайта https://studiu.ru.<br/>
                            2.10. Предоставление персональных данных — действия, направленные на раскрытие персональных данных определенному лицу или определенному кругу лиц.<br/>
                            2.11. Распространение персональных данных — любые действия, направленные на раскрытие персональных данных неопределенному кругу лиц (передача персональных данных) или на ознакомление с персональными данными неограниченного круга лиц, в том числе обнародование персональных данных в средствах массовой информации, размещение в информационно-телекоммуникационных сетях или предоставление доступа к персональным данным каким-либо иным способом.<br/>
                            2.12. Трансграничная передача персональных данных — передача персональных данных на территорию иностранного государства органу власти иностранного государства, иностранному физическому или иностранному юридическому лицу.<br/>
                            2.13. Уничтожение персональных данных — любые действия, в результате которых персональные данные уничтожаются безвозвратно с невозможностью дальнейшего восстановления содержания персональных данных в информационной системе персональных данных и (или) уничтожаются материальные носители персональных данных.
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">3. Основные права и обязанности Оператора</Title>
                        <Text level={4} className="leading-relaxed">
                            3.1. Оператор имеет право:<br/>
                            — получать от субъекта персональных данных достоверные информацию и/или документы, содержащие персональные данные;<br/>
                            — в случае отзыва субъектом персональных данных согласия на обработку персональных данных Оператор вправе продолжить обработку персональных данных без согласия субъекта персональных данных при наличии оснований, указанных в Законе о персональных данных;<br/>
                            — самостоятельно определять состав и перечень мер, необходимых и достаточных для обеспечения выполнения обязанностей, предусмотренных Законом о персональных данных и принятыми в соответствии с ним нормативными правовыми актами, если иное не предусмотрено Законом о персональных данных или другими федеральными законами.<br/>
                            3.2. Оператор обязан:<br/>
                            — предоставлять субъекту персональных данных по его просьбе информацию, касающуюся обработки его персональных данных;<br/>
                            — организовывать обработку персональных данных в порядке, установленном действующим законодательством РФ;<br/>
                            — отвечать на обращения и запросы субъектов персональных данных и их законных представителей в соответствии с требованиями Закона о персональных данных;<br/>
                            — сообщать в уполномоченный орган по защите прав субъектов персональных данных по запросу этого органа необходимую информацию в течение 30 дней с даты получения такого запроса;<br/>
                            — публиковать или иным образом обеспечивать неограниченный доступ к настоящей Политике в отношении обработки персональных данных;<br/>
                            — принимать правовые, организационные и технические меры для защиты персональных данных от неправомерного или случайного доступа к ним, уничтожения, изменения, блокирования, копирования, предоставления, распространения персональных данных, а также от иных неправомерных действий в отношении персональных данных;<br/>
                            — прекратить передачу (распространение, предоставление, доступ) персональных данных, прекратить обработку и уничтожить персональные данные в порядке и случаях, предусмотренных Законом о персональных данных;<br/>
                            — исполнять иные обязанности, предусмотренные Законом о персональных данных.
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">4. Основные права и обязанности субъектов персональных данных</Title>
                        <Text level={4} className="leading-relaxed">
                            4.1. Субъекты персональных данных имеют право:<br/>
                            — получать информацию, касающуюся обработки его персональных данных, за исключением случаев, предусмотренных федеральными законами. Сведения предоставляются субъекту персональных данных Оператором в доступной форме, и в них не должны содержаться персональные данные, относящиеся к другим субъектам персональных данных, за исключением случаев, когда имеются законные основания для раскрытия таких персональных данных. Перечень информации и порядок ее получения установлен Законом о персональных данных;<br/>
                            — требовать от оператора уточнения его персональных данных, их блокирования или уничтожения в случае, если персональные данные являются неполными, устаревшими, неточными, незаконно полученными или не являются необходимыми для заявленной цели обработки, а также принимать предусмотренные законом меры по защите своих прав;<br/>
                            — выдвигать условие предварительного согласия при обработке персональных данных в целях продвижения на рынке товаров, работ и услуг;<br/>
                            — на отзыв согласия на обработку персональных данных;<br/>
                            — обжаловать в уполномоченный орган по защите прав субъектов персональных данных или в судебном порядке неправомерные действия или бездействие Оператора при обработке его персональных данных;<br/>
                            — на осуществление иных прав, предусмотренных законодательством РФ.<br/>
                            4.2. Субъекты персональных данных обязаны:<br/>
                            — предоставлять Оператору достоверные данные о себе;<br/>
                            — сообщать Оператору об уточнении (обновлении, изменении) своих персональных данных.<br/>
                            4.3. Лица, передавшие Оператору недостоверные сведения о себе, либо сведения о другом субъекте персональных данных без согласия последнего, несут ответственность в соответствии с законодательством РФ.
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">5. Оператор может обрабатывать следующие персональные данные Пользователя</Title>
                        <Text level={4} className="leading-relaxed">
                            5.1. Фамилия, имя, отчество.<br/>
                            5.2. Электронный адрес.<br/>
                            5.3. Номера телефонов.<br/>
                            5.4. Ссылки на профили в социальных сетях (Telegram, VK).<br/>
                            5.5. Сведения об учебной группе, курсе и факультете.<br/>
                            5.6. Сведения о профессиональных навыках, интересах и опыте работы (заполняемые в анкете).<br/>
                            5.7. Также на сайте происходит сбор и обработка обезличенных данных о посетителях (в т.ч. файлов «cookie») с помощью сервисов интернет-статистики (Яндекс Метрика и Гугл Аналитика и других).<br/>
                            5.8. Вышеперечисленные данные далее по тексту Политики объединены общим понятием Персональные данные.
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">6. Цели обработки персональных данных</Title>
                        <Text level={4} className="leading-relaxed">
                            6.1. Цель обработки персональных данных Пользователя:<br/>
                            — информирование Пользователя посредством отправки электронных писем;<br/>
                            — предоставление доступа Пользователю к сервисам, информации и/или материалам, содержащимся на веб-сайте;<br/>
                            — проведение отбора кандидатов в члены Студенческого совета;<br/>
                            — установление с Пользователем обратной связи, включая направление уведомлений, запросов.<br/>
                            6.2. Также Оператор имеет право направлять Пользователю уведомления о новых продуктах и услугах, специальных предложениях и различных событиях. Пользователь всегда может отказаться от получения информационных сообщений, направив Оператору письмо на адрес электронной почты studsovetiu@yandex.ru с пометкой «Отказ от уведомлений о новых продуктах и услугах и специальных предложениях».<br/>
                            6.3. Обезличенные данные Пользователей, собираемые с помощью сервисов интернет-статистики, служат для сбора информации о действиях Пользователей на сайте, улучшения качества сайта и его содержания.
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">7. Правовые основания обработки персональных данных</Title>
                        <Text level={4} className="leading-relaxed">
                            7.1. Правовыми основаниями обработки персональных данных Оператором являются:<br/>
                            — Федеральный закон от 27.07.2006 N 152-ФЗ «О персональных данных»;<br/>
                            — Уставные документы Студенческого совета;<br/>
                            — Согласия Пользователей на обработку персональных данных.<br/>
                            7.2. Оператор обрабатывает персональные данные Пользователя только в случае их заполнения и/или отправки Пользователем самостоятельно через специальные формы, расположенные на сайте https://studiu.ru. Заполняя соответствующие формы и/или отправляя свои персональные данные Оператору, Пользователь выражает свое согласие с данной Политикой.<br/>
                            7.3. Оператор обрабатывает обезличенные данные о Пользователе в случае, если это разрешено в настройках браузера Пользователя (включено сохранение файлов «cookie» и использование технологии JavaScript).
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">8. Порядок сбора, хранения, передачи и других видов обработки персональных данных</Title>
                        <Text level={4} className="leading-relaxed">
                            Безопасность персональных данных, которые обрабатываются Оператором, обеспечивается путем реализации правовых, организационных и технических мер, необходимых для выполнения в полном объеме требований действующего законодательства в области защиты персональных данных.<br/>
                            8.1. Оператор обеспечивает сохранность персональных данных и принимает все возможные меры, исключающие доступ к персональным данным неуполномоченных лиц.<br/>
                            8.2. Персональные данные Пользователя никогда, ни при каких условиях не будут переданы третьим лицам, за исключением случаев, связанных с исполнением действующего законодательства.<br/>
                            8.3. В случае выявления неточностей в персональных данных, Пользователь может актуализировать их самостоятельно, путем направления Оператору уведомление на адрес электронной почты Оператора studsovetiu@yandex.ru с пометкой «Актуализация персональных данных».<br/>
                            8.4. Срок обработки персональных данных определяется достижением целей, для которых они были собраны, если иной срок не предусмотрен договором или действующим законодательством. Пользователь может в любой момент отозвать свое согласие на обработку персональных данных, направив Оператору уведомление посредством электронной почты на электронный адрес Оператора studsovetiu@yandex.ru с пометкой «Отзыв согласия на обработку персональных данных».<br/>
                            8.5. Вся информация, которая собирается сторонними сервисами, в том числе платежными системами, средствами связи и другими поставщиками услуг, хранится и обрабатывается указанными лицами (Операторами) в соответствии с их Пользовательским соглашением и Политикой конфиденциальности. Субъект персональных данных и/или Пользователь обязан самостоятельно своевременно ознакомиться с указанными документами. Оператор не несет ответственность за действия третьих лиц, в том числе указанных в настоящем пункте поставщиков услуг.
                        </Text>
                    </div>

                    <div>
                        <Title level={4} className="mb-2">9. Заключительные положения</Title>
                        <Text level={4} className="leading-relaxed">
                            9.1. Пользователь может получить любые разъяснения по интересующим вопросам, касающимся обработки его персональных данных, обратившись к Оператору с помощью электронной почты studsovetiu@yandex.ru.<br/>
                            9.2. В данном документе будут отражены любые изменения политики обработки персональных данных Оператором. Политика действует бессрочно до замены ее новой версией.<br/>
                            9.3. Актуальная версия Политики в свободном доступе расположена в сети Интернет по адресу https://studiu.ru/policy.
                        </Text>
                    </div>
                </div>
            </div>
        </section>
    );
}
```

src/app/(public)/events/page.tsx:
```tsx
'use client';

import { useFutureEvents, usePastEvents } from '@/shared/hooks/useEvents';
import EventCard from '@/sections/Events/components/EventCard';
import { EventCardSkeleton } from '@/sections/Events/components/EventCardSkeleton';
import { Text, Title } from '@/shared/ui/Typography';
import { useHorizontalScroll } from '@/shared/utils';

export default function EventsPage() {
    const { data: futureEvents, isLoading: isFutureLoading, isError: isFutureError } = useFutureEvents(10);
    const { data: pastEvents, isLoading: isPastLoading, isError: isPastError } = usePastEvents(100);
    const scrollRef = useHorizontalScroll();

    return (
        <>
            <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full mx-auto px-6 2xl:px-0 max-w-primary pb-24 pt-12 overflow-hidden">
                <div className="flex flex-col gap-4 w-full lg:w-[350px] xl:w-[400px] shrink-0">
                    <Title level={2} className="leading-none">Будущие мероприятия</Title>
                    <Text level={2} className="text-gray-500">Регистрируйтесь на наши новые мероприятия</Text>
                </div>

                <div ref={scrollRef} className="flex-1 min-w-0 flex items-stretch gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
                    {isFutureLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="shrink-0 snap-start w-[320px] sm:w-[450px]">
                                <EventCardSkeleton mode="compact" />
                            </div>
                        ))
                    ) : isFutureError ? (
                        <Text className="text-red-500">Ошибка загрузки</Text>
                    ) : (
                        futureEvents?.map((event) => (
                            <div key={event.id} className="shrink-0 snap-start h-auto w-[320px] sm:w-[450px]">
                                <EventCard mode="compact" {...event} />
                            </div>
                        ))
                    )}
                </div>
            </section>

            <section className="flex flex-1 py-24 gap-30 w-dvw mx-auto px-6 2xl:px-0 bg-gradient-to-b from-blue-primary to-black text-white">
                <div className="flex flex-col flex-1 max-w-primary mx-auto">
                    <Title level={2} className="text-white mb-12">Прошедшие мероприятия</Title>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {isPastLoading ? (
                            Array.from({ length: 4 }).map((_, i) => <div key={i}><EventCardSkeleton mode="minified" /></div>)
                        ) : isPastError ? (
                            <Text className="text-white/50 col-span-full">Не удалось загрузить историю</Text>
                        ) : (
                            pastEvents?.map((event) => (
                                <div key={event.id} className="w-full">
                                    <EventCard mode="minified" {...event} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
```

src/app/(public)/events/future/[id]/page.tsx:
```tsx
'use client';
import { useParams } from 'next/navigation';
import { useEventDetails } from '@/shared/hooks/useEvents';
import { Text, Title } from '@/shared/ui/Typography';
import Carousel, { CarouselSkeleton } from '@/widgets/EventDetails';
import Button from '@/shared/ui/Button';
import type { FutureEvent } from '@/shared/api';
import { formatDate } from '@/shared/utils';

const ErrorState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[calc(100dvh-5rem)] bg-black">
        <Title className="text-white/50">{message}</Title>
    </div>
);

export default function FutureEventDetailsPage() {
    const params = useParams();
    const eventId = params?.id ? Number(params.id) : NaN;

    const { data, isLoading, isError } = useEventDetails(eventId, 'future');

    if (isLoading || isNaN(eventId)) {
        return <CarouselSkeleton />;
    }

    if (isError) {
        return <ErrorState message="Не удалось загрузить мероприятие." />;
    }

    if (!data) {
        return <ErrorState message="Мероприятие не найдено." />;
    }

    const event = data as FutureEvent;

    return (
        <Carousel
            slides={[{
                ...event,
                color: event.color,
                before: event.registration_link ? (
                    <Button
                        variant="white"
                        size="primary"
                        onClick={() => window.open(event.registration_link!, '_blank')}
                    >
                        <Title level={5}>Зарегистрироваться</Title>
                    </Button>
                ) : null,
                after: (
                    <div className="flex flex-col items-end text-right gap-1">
                        <Title level={4} className="text-white">
                            {event.place || 'Место уточняется'}
                        </Title>
                        <Text level={4} className="text-white/60">
                            {formatDate(event.start_datetime)}
                        </Text>
                    </div>
                )
            }]}
            options={{ loop: false }}
        />
    );
}
```

src/app/(public)/events/past/[id]/page.tsx:
```tsx
'use client';

import { useParams } from 'next/navigation';
import { useEventDetails } from '@/shared/hooks/useEvents';
import { Text, Title } from '@/shared/ui/Typography';
import Carousel, { CarouselSkeleton } from '@/widgets/EventDetails';
import Button from '@/shared/ui/Button';
import type { PastEvent } from '@/shared/api';
import { formatDate } from '@/shared/utils';

const ErrorState = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-[calc(100dvh-5rem)] bg-black">
        <Title className="text-white/50">{message}</Title>
    </div>
);

export default function PastEventDetailsPage() {
    const params = useParams();
    const eventId = params?.id ? Number(params.id) : NaN;

    const { data, isLoading, isError } = useEventDetails(eventId, 'past');

    if (isLoading || isNaN(eventId)) {
        return <CarouselSkeleton />;
    }

    if (isError) {
        return <ErrorState message="Не удалось загрузить мероприятие." />;
    }

    if (!data) {
        return <ErrorState message="Мероприятие не найдено." />;
    }

    const event = data as PastEvent;

    return (
        <Carousel
            slides={[{
                ...event,
                color: event.color,
                before: event.album_link ? (
                    <Button
                        variant="white"
                        size="primary"
                        onClick={() => window.open(event.album_link!, '_blank')}
                    >
                        <Title level={5}>Смотреть фото</Title>
                    </Button>
                ) : (
                    <Text className="text-white/40 italic">Фотоотчет пока не загружен</Text>
                ),
                after: (
                    <div className="flex flex-col items-end text-right gap-1">
                        <Title level={4} className="text-white">
                            {event.place || 'Место проведения'}
                        </Title>
                        <Text level={4} className="text-white/60">
                            {formatDate(event.start_datetime)}
                        </Text>
                    </div>
                )
            }]}
            options={{ loop: false }}
        />
    );
}
```

src/app/(public)/news/page.tsx:
```tsx
'use client';

import { useNewsList } from '@/shared/hooks/useNews';
import { Title, Text } from '@/shared/ui/Typography';
import NewsCard from '@/sections/News/components/NewsCard';
import { NewsCardSkeleton } from '@/sections/News/components/NewsCardSkeleton';

export default function AllNewsPage() {

    const { data: news, isLoading, isError } = useNewsList(50);

    return (
        <section className="flex flex-col flex-1 w-full mx-auto px-6 2xl:px-0 max-w-primary pb-24 pt-12">
            <div className="flex flex-col gap-4 mb-12">
                <Title level={1}>Новости</Title>
                <Text level={2} className="text-gray-500">
                    Все события и анонсы факультета
                </Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <NewsCardSkeleton key={i} />
                    ))
                ) : isError ? (
                    <Text className="text-red-500 col-span-full">Ошибка загрузки новостей</Text>
                ) : (
                    news?.map((item) => (
                        <div key={item.id}>
                            <NewsCard {...item} />
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
```

src/app/(public)/news/[id]/page.tsx:
```tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useNewsDetails } from '@/shared/hooks/useNews';
import { Title, Text, Caption } from '@/shared/ui/Typography';
import Button from '@/shared/ui/Button';
import { formatDate } from '@/shared/utils';
import { getImageUrl } from '@/shared/utils/getImageUrl';

export default function NewsDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const newsId = params?.id ? Number(params.id) : NaN;

    const { data: news, isLoading, isError } = useNewsDetails(newsId);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (isError || !news) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <Title>Новость не найдена</Title>
                <Button variant="black" onClick={() => router.push('/news')}>
                    <Text level={4}>Ко всем новостям</Text>
                </Button>
            </div>
        );
    }

    return (
        <article className="flex flex-col w-full mx-auto px-6 2xl:px-0 max-w-primary py-12 pb-24 gap-10">
            <Button
                variant="outline"
                size="inline"
                onClick={() => router.back()}
                className="w-fit border-gray-300 hover:border-black hover:bg-gray-50 transition-colors px-10 py-5 rounded-[2.5rem] flex items-center gap-6 group"
            >
                <svg width="50" height="14" viewBox="0 0 40 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-500 group-hover:text-black transition-colors">
                    <path d="M0.46967 5.46967C0.176777 5.76256 0.176777 6.23744 0.46967 6.53033L5.24264 11.3033C5.53553 11.5962 6.01041 11.5962 6.3033 11.3033C6.59619 11.0104 6.59619 10.5355 6.3033 10.2426L2.06066 6L6.3033 1.75736C6.59619 1.46447 6.59619 0.989593 6.3033 0.696699C6.01041 0.403806 5.53553 0.403806 5.24264 0.696699L0.46967 5.46967ZM40 5.25L1 5.25V6.75L40 6.75V5.25Z" fill="currentColor" />
                </svg>
                <Text level={4} className="font-bold">Назад</Text>
            </Button>

            <div className="flex flex-col mx-auto w-full md:max-w-[60dvw]">
                <Title level={2} className="leading-tight mb-6 !text-6xl text-gray-900">
                    {news.title}
                </Title>

                <div className="flex flex-col gap-1 mb-8 text-gray-500">
                    <Caption className="font-medium text-base">{formatDate(news.created_at)}</Caption>
                    <Caption className="font-medium text-base">Текст: Ред. СтудСовет ИУ</Caption>
                    <Caption className="font-medium text-base">Фото: Архив</Caption>
                </div>

                <div className="w-full aspect-[4/3] sm:aspect-video relative overflow-hidden bg-gray-100 mb-10">
                    <Image src={getImageUrl(news.cover_url)} fill className="object-cover" alt={news.title} priority />
                </div>

                <div className="w-full">
                    <p className="text-[22px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {news.description}
                    </p>
                </div>
            </div>
        </article>
    );
}
```

src/app/admin/layout.tsx:
```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isLoginPage = pathname === '/admin/login';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                {children}
            </div>
        );
    }

    const menuItems = [
        { label: 'Новости', href: '/admin/news', icon: '📰' },
        { label: 'Мероприятия', href: '/admin/events', icon: '📅' },
        { label: 'Партнеры', href: '/admin/partners', icon: '🤝' },
        { label: 'Состав', href: '/admin/members', icon: '👥' },
        { label: 'Заявки', href: '/admin/requests', icon: '📩' },
    ];

    return (
        <div className="flex min-h-screen bg-[#f8f9fc] font-sans text-gray-900 relative">

            <div className="lg:hidden fixed top-0 left-0 right-0 h-20 bg-[#0f172a] text-white flex items-center justify-between px-6 z-40 shadow-md">
                <span className="text-xl font-extrabold tracking-wider text-blue-500">STUD<span className="text-white">IU</span></span>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
            </div>

            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-40 transition-opacity lg:hidden",
                    isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}
                onClick={() => setIsSidebarOpen(false)}
            />

            <aside
                className={cn(
                    "w-80 bg-[#0f172a] text-white flex flex-col fixed inset-y-0 z-50 shadow-2xl transition-transform duration-300 lg:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="p-10 border-b border-slate-800/50 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-wider text-blue-500">STUD<span className="text-white">IU</span></h1>
                        <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.2em] font-bold">Admin Panel</p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
                        ✕
                    </button>
                </div>

                <nav className="flex-1 p-6 space-y-3 mt-4 overflow-y-auto">
                    {menuItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-5 px-6 py-5 rounded-2xl transition-all duration-200 group ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                }`}
                            >
                                <span className={`text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>{item.icon}</span>
                                <span className="font-bold text-lg tracking-wide">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-slate-800/50">
                    <Link href="/" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors group">
                        <span className="group-hover:-translate-x-1 transition-transform">←</span>
                        <span className="font-medium text-lg">На сайт</span>
                    </Link>
                </div>
            </aside>

            <main className="flex-1 lg:ml-80 p-6 pt-24 lg:p-10 xl:p-16 overflow-x-hidden min-h-screen">
                <div className="max-w-full mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
```

src/app/admin/login/page.tsx:
```tsx
'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Title, Text, Caption } from '@/shared/ui/Typography';

export default function LoginPage() {
    const router = useRouter();
    const [data, setData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await signIn('credentials', {
                ...data,
                redirect: false,
            });

            if (res?.error) {
                toast.error('Неверный логин или пароль');
            } else {
                toast.success('Добро пожаловать!');
                router.push('/admin/news');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[480px]">
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-white/50">
                <div className="text-center mb-12">
                    <Title level={2} className="mb-3">Вход</Title>
                    <Caption level={1}>Панель администратора StudIU</Caption>
                </div>

                <form onSubmit={onSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <Text level={3} className="font-bold text-gray-700 !text-3xl ml-1 uppercase tracking-wide">
                            Email
                        </Text>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData({ ...data, email: e.target.value })}
                            className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-4xl placeholder:text-gray-400"
                            placeholder="admin@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <Text level={3} className="font-bold text-gray-700 ml-1 !text-3xl uppercase tracking-wide">
                            Пароль
                        </Text>
                        <input
                            type="password"
                            value={data.password}
                            onChange={(e) => setData({ ...data, password: e.target.value })}
                            className="w-full px-6 py-5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-4xl placeholder:text-gray-400"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-6"
                    >
                        <Text level={3} className="!text-inherit !text-4xl">
                            {isLoading ? 'Вход...' : 'Войти в систему'}
                        </Text>
                    </button>
                </form>
            </div>
            <div className="text-center mt-8">
                <Caption level={2}>&copy; 2025 ITS Tech</Caption>
            </div>
        </div>
    );
}
```

src/app/admin/events/page.tsx:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatDate } from '@/shared/utils';
import { Title, Text } from '@/shared/ui/Typography';
import { AdminActions } from '@/shared/ui/AdminActions';
import { getImageUrl } from '@/shared/utils/getImageUrl';

const PlusIcon = () => <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>;

export const dynamic = 'force-dynamic';

export default async function EventsListPage() {
    const events = await db.event.findMany({
        orderBy: { start_datetime: 'desc' },
        include: { images: true }
    });

    return (
        <div className="space-y-8 sm:space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <Title className="!text-3xl sm:!text-5xl mb-2 sm:mb-3 tracking-tight">Мероприятия</Title>
                    <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">Управление списком событий</Text>
                </div>
                <Link
                    href="/admin/events/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-10 sm:py-5 rounded-3xl shadow-xl shadow-blue-200 transition-all active:scale-95"
                >
                    <PlusIcon />
                    <span className="font-bold text-lg sm:text-xl">Создать событие</span>
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">Фото</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">Дата</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider w-1/3">Название</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">Статус</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">Место</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider text-right">Действия</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {events.map((event) => {
                            const mainImage = event.images?.[0]?.image;

                            return (
                                <tr key={event.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gray-100 relative border border-gray-200 shrink-0 shadow-sm">
                                            {mainImage ? (
                                                <Image src={getImageUrl(mainImage)} fill className="object-cover" alt={event.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-lg">
                                                    NO IMG
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle whitespace-nowrap">
                                        <Text className="font-bold text-gray-900 !text-xl sm:!text-2xl whitespace-pre-wrap">
                                            {formatDate(event.start_datetime, event.end_datetime, event.precision)}
                                        </Text>
                                    </td>
                                    <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                        <div className="flex items-center gap-5">
                                            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: event.color || '#ccc' }} />
                                            <Title className="line-clamp-2 leading-tight !text-xl sm:!text-2xl !font-bold min-w-[200px]">
                                                {event.name}
                                            </Title>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle whitespace-nowrap">
                                        <span className={`px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border inline-block text-sm sm:text-base font-bold tracking-wide ${
                                            event.type === 'FUTURE'
                                                ? 'bg-blue-50 border-blue-100 text-blue-700'
                                                : 'bg-gray-50 border-gray-100 text-gray-600'
                                        }`}>
                                            {event.type === 'FUTURE' ? 'ПРЕДСТОЯЩЕЕ' : 'ПРОШЕДШЕЕ'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                        <Text className="text-gray-600 font-medium !text-lg sm:!text-xl whitespace-nowrap">
                                            {event.place || '—'}
                                        </Text>
                                    </td>
                                    <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle text-right">
                                        <AdminActions
                                            id={event.id}
                                            basePath="/admin/events"
                                            apiPath="/events"
                                        />
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                    {events.length === 0 && (
                        <div className="p-12 sm:p-24 text-center text-gray-400 text-xl sm:text-2xl font-medium">
                            Список мероприятий пуст
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/events/[id]/page.tsx:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Title } from '@/shared/ui/Typography';
import EventCard from '@/sections/Events/components/EventCard';
import type { EventType } from '@prisma/client';
import apiClient from '@/shared/api/axios';
import { getImageUrl } from '@/shared/utils/getImageUrl';

interface EventForm {
    type: EventType;
    name: string;
    description: string;
    place: string;
    color: string;
    precision: string;
    start_datetime: string;
    end_datetime: string;
    registration_link: string;
    album_link: string;
    images: FileList;
}

const formatCustomDate = (val: string, precision: string) => {
    const digits = val.replace(/\D/g, '');
    let res = '';
    if (precision === 'time') {
        if (digits.length > 0) res += digits.substring(0, 2);
        if (digits.length >= 3) res += '.' + digits.substring(2, 4);
        if (digits.length >= 5) res += '.' + digits.substring(4, 8);
        if (digits.length >= 9) res += ', ' + digits.substring(8, 10);
        if (digits.length >= 11) res += ':' + digits.substring(10, 12);
    } else if (precision === 'day') {
        if (digits.length > 0) res += digits.substring(0, 2);
        if (digits.length >= 3) res += '.' + digits.substring(2, 4);
        if (digits.length >= 5) res += '.' + digits.substring(4, 8);
    } else if (precision === 'month') {
        if (digits.length > 0) res += digits.substring(0, 2);
        if (digits.length >= 3) res += '.' + digits.substring(2, 6);
    } else if (precision === 'year') {
        res = digits.substring(0, 4);
    }
    return res;
};

const parseToBackendFormat = (val: string, precision: string) => {
    if (!val) return '';
    if (val.includes('-')) return val;
    const digits = val.replace(/\D/g, '');

    if (precision === 'time' && digits.length >= 12) {
        return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}T${digits.slice(8, 10)}:${digits.slice(10, 12)}`;
    } else if (precision === 'day' && digits.length >= 8) {
        return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
    } else if (precision === 'month' && digits.length >= 6) {
        return `${digits.slice(2, 6)}-${digits.slice(0, 2)}`;
    } else if (precision === 'year' && digits.length >= 4) {
        return digits.slice(0, 4);
    }
    return val;
};

const getMaxLength = (prec: string) => {
    if (prec === 'time') return 17;
    if (prec === 'day') return 10;
    if (prec === 'month') return 7;
    return 4;
};

const getPlaceholder = (prec: string) => {
    if (prec === 'year') return 'ГГГГ (напр. 2026)';
    if (prec === 'month') return 'ММ.ГГГГ (напр. 04.2026)';
    if (prec === 'day') return 'ДД.ММ.ГГГГ (напр. 30.04.2026)';
    return 'ДД.ММ.ГГГГ, ЧЧ:ММ (напр. 30.04.2026, 12:30)';
};

// Функция парсит дату с сервера сразу в нашу красивую маску
const formatForInput = (dateStr: string | null | undefined, prec: string) => {
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
    const iso = dateObj.toISOString();

    if (prec === 'time') return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}, ${iso.slice(11, 16)}`;
    if (prec === 'day') return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
    if (prec === 'month') return `${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
    if (prec === 'year') return iso.slice(0, 4);
    return iso.slice(0, 16);
};

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id;

    const { register, handleSubmit, watch, reset } = useForm<EventForm>({
        defaultValues: { type: 'FUTURE', color: '#3a7fff', precision: 'time' }
    });

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!eventId) return;
        apiClient.get(`/events/${eventId}`)
            .then((res) => {
                const data = res.data;
                const prec = data.precision || 'time';

                reset({
                    type: data.type,
                    name: data.name,
                    description: data.description || '',
                    place: data.place || '',
                    color: data.color || '#3a7fff',
                    precision: prec,
                    start_datetime: formatForInput(data.start_datetime, prec),
                    end_datetime: formatForInput(data.end_datetime, prec),
                    registration_link: data.registration_link || '',
                    album_link: data.album_link || '',
                });

                if (data.images && data.images.length > 0) {
                    setPreviewImage(getImageUrl(data.images[0].image));
                }
            })
            .catch(() => {
                toast.error('Не удалось загрузить событие');
                router.push('/admin/events');
            })
            .finally(() => setIsLoading(false));
    }, [eventId, reset, router]);

    const wType = watch('type');
    const wName = watch('name');
    const wDesc = watch('description');
    const wColor = watch('color');
    const wDate = watch('start_datetime');
    const wPrecision = watch('precision') || 'time';

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
    };

    const onSubmit = async (data: EventForm) => {
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append('type', data.type);
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('place', data.place || '');
        formData.append('color', data.color);
        formData.append('precision', data.precision || 'time');

        formData.append('start_datetime', parseToBackendFormat(data.start_datetime, data.precision));
        if (data.end_datetime) {
            formData.append('end_datetime', parseToBackendFormat(data.end_datetime, data.precision));
        }

        if (data.type === 'FUTURE' && data.registration_link) {
            formData.append('registration_link', data.registration_link);
        }
        if (data.type === 'PAST' && data.album_link) {
            formData.append('album_link', data.album_link);
        }

        if (data.images && data.images.length > 0) {
            formData.append('images', data.images[0]);
        }

        try {
            await apiClient.put(`/events/${eventId}`, formData);
            toast.success('Событие обновлено');
            router.push('/admin/events');
            router.refresh();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.error || 'Ошибка обновления');
        } finally {
            setIsSubmitting(false);
        }
    };

    const { onChange: onStartChange, ...restStart } = register('start_datetime', { required: 'Выберите дату' });
    const { onChange: onEndChange, ...restEnd } = register('end_datetime');

    if (isLoading) return <div className="p-10 text-center text-gray-500">Загрузка...</div>;

    return (
        <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title className="!text-3xl sm:!text-5xl tracking-tight">Редактировать событие</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
                <div className="w-full lg:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm flex flex-col gap-6 overflow-y-auto border border-gray-200 custom-scrollbar h-auto lg:h-full">

                    <div className="flex flex-col sm:flex-row gap-4 p-2 bg-gray-100 rounded-2xl">
                        <label className={`flex-1 text-center py-3 sm:py-4 rounded-xl cursor-pointer transition-all font-bold text-lg ${wType === 'FUTURE' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <input type="radio" value="FUTURE" {...register('type')} className="hidden" /> Предстоящее
                        </label>
                        <label className={`flex-1 text-center py-3 sm:py-4 rounded-xl cursor-pointer transition-all font-bold text-lg ${wType === 'PAST' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <input type="radio" value="PAST" {...register('type')} className="hidden" /> Прошедшее
                        </label>
                    </div>

                    <input {...register('name', { required: 'Введите название' })} className="p-6 bg-gray-50 rounded-2xl text-xl font-bold placeholder:font-normal focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Название события" />
                    <textarea {...register('description')} className="p-6 bg-gray-50 rounded-2xl text-lg min-h-[140px] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none" placeholder="Описание события..." />

                    <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-500 text-sm uppercase tracking-wider">Формат даты:</span>
                            <select {...register('precision')} className="flex-1 p-3 bg-white border border-gray-200 rounded-xl font-medium outline-none">
                                <option value="time">Точное время</option>
                                <option value="day">Только день</option>
                                <option value="month">Только месяц</option>
                                <option value="year">Только год</option>
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={getPlaceholder(wPrecision)}
                                maxLength={getMaxLength(wPrecision)}
                                {...restStart}
                                onChange={(e) => {
                                    e.target.value = formatCustomDate(e.target.value, wPrecision);
                                    onStartChange(e);
                                }}
                                className="w-full sm:flex-1 p-4 bg-white border border-gray-200 rounded-xl text-lg font-medium outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={wPrecision === 'year' ? 'Конец: ГГГГ' : 'Конец (опционально)'}
                                maxLength={getMaxLength(wPrecision)}
                                {...restEnd}
                                onChange={(e) => {
                                    e.target.value = formatCustomDate(e.target.value, wPrecision);
                                    onEndChange(e);
                                }}
                                className="w-full sm:flex-1 p-4 bg-white border border-gray-200 rounded-xl text-lg font-medium outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <input {...register('place')} className="w-full sm:flex-1 p-6 bg-gray-50 rounded-2xl text-lg font-medium outline-none" placeholder="Место проведения" />
                        <div className="relative w-full sm:w-24 h-16 sm:h-auto">
                            <input type="color" {...register('color')} className="w-full h-full p-2 bg-gray-50 rounded-2xl cursor-pointer" />
                        </div>
                    </div>

                    {wType === 'FUTURE' ? (
                        <input {...register('registration_link')} className="p-6 bg-blue-50/50 text-blue-800 rounded-2xl text-lg font-medium outline-none border border-blue-100 placeholder:text-blue-300" placeholder="Ссылка на регистрацию" />
                    ) : (
                        <input {...register('album_link')} className="p-6 bg-green-50/50 text-green-800 rounded-2xl text-lg font-medium outline-none border border-green-100 placeholder:text-green-300" placeholder="Ссылка на фотоальбом" />
                    )}

                    <div className="mt-auto pt-4">
                        <label className="block text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Изменить обложку</label>
                        <input
                            type="file"
                            {...register('images', {
                                onChange: (e) => handleImageChange(e)
                            })}
                            className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-gray-100 rounded-[2.5rem] p-10 items-center justify-center relative border border-dashed border-gray-300">
                    <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-full text-xs font-bold text-gray-400 tracking-widest uppercase shadow-sm">Live Preview</div>

                    <div className="scale-110 origin-center pointer-events-none">
                        <EventCard
                            id={Number(eventId) || 0}
                            name={wName || 'Название события'}
                            description={wDesc || 'Описание события...'}
                            color={wColor}
                            start_datetime={wDate ? parseToBackendFormat(wDate, wPrecision) : new Date().toISOString()}
                            images={previewImage ? [{ id: 0, image: previewImage }] : []}
                            place=""
                            date_range=""
                            mode="full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/events/new/page.tsx:
```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Title } from '@/shared/ui/Typography';
import EventCard from '@/sections/Events/components/EventCard';
import type { EventType } from '@prisma/client';
import { createEvent } from '@/shared/api';

interface EventForm {
    type: EventType;
    name: string;
    description: string;
    place: string;
    color: string;
    precision: string;
    start_datetime: string;
    end_datetime: string;
    registration_link: string;
    album_link: string;
    images: FileList;
}

// Вспомогательные функции для кастомной маски ввода
const formatCustomDate = (val: string, precision: string) => {
    const digits = val.replace(/\D/g, '');
    let res = '';
    if (precision === 'time') {
        if (digits.length > 0) res += digits.substring(0, 2);
        if (digits.length >= 3) res += '.' + digits.substring(2, 4);
        if (digits.length >= 5) res += '.' + digits.substring(4, 8);
        if (digits.length >= 9) res += ', ' + digits.substring(8, 10);
        if (digits.length >= 11) res += ':' + digits.substring(10, 12);
    } else if (precision === 'day') {
        if (digits.length > 0) res += digits.substring(0, 2);
        if (digits.length >= 3) res += '.' + digits.substring(2, 4);
        if (digits.length >= 5) res += '.' + digits.substring(4, 8);
    } else if (precision === 'month') {
        if (digits.length > 0) res += digits.substring(0, 2);
        if (digits.length >= 3) res += '.' + digits.substring(2, 6);
    } else if (precision === 'year') {
        res = digits.substring(0, 4);
    }
    return res;
};

const parseToBackendFormat = (val: string, precision: string) => {
    if (!val) return '';
    if (val.includes('-')) return val; // Уже отформатировано
    const digits = val.replace(/\D/g, '');

    if (precision === 'time' && digits.length >= 12) {
        return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}T${digits.slice(8, 10)}:${digits.slice(10, 12)}`;
    } else if (precision === 'day' && digits.length >= 8) {
        return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
    } else if (precision === 'month' && digits.length >= 6) {
        return `${digits.slice(2, 6)}-${digits.slice(0, 2)}`;
    } else if (precision === 'year' && digits.length >= 4) {
        return digits.slice(0, 4);
    }
    return val;
};

const getMaxLength = (prec: string) => {
    if (prec === 'time') return 17;
    if (prec === 'day') return 10;
    if (prec === 'month') return 7;
    return 4;
};

const getPlaceholder = (prec: string) => {
    if (prec === 'year') return 'ГГГГ (напр. 2026)';
    if (prec === 'month') return 'ММ.ГГГГ (напр. 04.2026)';
    if (prec === 'day') return 'ДД.ММ.ГГГГ (напр. 30.04.2026)';
    return 'ДД.ММ.ГГГГ, ЧЧ:ММ (напр. 30.04.2026, 12:30)';
};

export default function CreateEventPage() {
    const router = useRouter();
    const { register, handleSubmit, watch } = useForm<EventForm>({
        defaultValues: { type: 'FUTURE', color: '#3a7fff', precision: 'time' }
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const wType = watch('type');
    const wName = watch('name');
    const wDesc = watch('description');
    const wColor = watch('color');
    const wDate = watch('start_datetime');
    const wPrecision = watch('precision') || 'time';

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
    };

    const onSubmit = async (data: EventForm) => {
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append('type', data.type);
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('place', data.place || '');
        formData.append('color', data.color);
        formData.append('precision', data.precision || 'time');

        formData.append('start_datetime', parseToBackendFormat(data.start_datetime, data.precision));
        if (data.end_datetime) {
            formData.append('end_datetime', parseToBackendFormat(data.end_datetime, data.precision));
        }

        if (data.type === 'FUTURE' && data.registration_link) {
            formData.append('registration_link', data.registration_link);
        }
        if (data.type === 'PAST' && data.album_link) {
            formData.append('album_link', data.album_link);
        }

        if (data.images && data.images.length > 0) {
            formData.append('images', data.images[0]);
        }

        try {
            await createEvent(formData);
            toast.success('Событие создано');
            router.push('/admin/events');
            router.refresh();
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.error || 'Не удалось создать событие');
        } finally {
            setIsSubmitting(false);
        }
    };

    const { onChange: onStartChange, ...restStart } = register('start_datetime', { required: 'Выберите дату' });
    const { onChange: onEndChange, ...restEnd } = register('end_datetime');

    return (
        <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title className="!text-3xl sm:!text-5xl tracking-tight">Создать событие</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Опубликовать'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
                <div className="w-full lg:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm flex flex-col gap-6 overflow-y-auto border border-gray-200 custom-scrollbar h-auto lg:h-full">
                    <div className="flex flex-col sm:flex-row gap-4 p-2 bg-gray-100 rounded-2xl">
                        <label className={`flex-1 text-center py-3 sm:py-4 rounded-xl cursor-pointer transition-all font-bold text-lg ${wType === 'FUTURE' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <input type="radio" value="FUTURE" {...register('type')} className="hidden" /> Предстоящее
                        </label>
                        <label className={`flex-1 text-center py-3 sm:py-4 rounded-xl cursor-pointer transition-all font-bold text-lg ${wType === 'PAST' ? 'bg-white shadow-md text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
                            <input type="radio" value="PAST" {...register('type')} className="hidden" /> Прошедшее
                        </label>
                    </div>

                    <input {...register('name', { required: 'Введите название' })} className="p-6 bg-gray-50 rounded-2xl text-xl font-bold placeholder:font-normal focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" placeholder="Название события" />
                    <textarea {...register('description')} className="p-6 bg-gray-50 rounded-2xl text-lg min-h-[140px] focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none" placeholder="Описание события..." />

                    <div className="flex flex-col gap-4 bg-gray-50 p-6 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-500 text-sm uppercase tracking-wider">Формат даты:</span>
                            <select {...register('precision')} className="flex-1 p-3 bg-white border border-gray-200 rounded-xl font-medium outline-none">
                                <option value="time">Точное время</option>
                                <option value="day">Только день</option>
                                <option value="month">Только месяц</option>
                                <option value="year">Только год</option>
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={getPlaceholder(wPrecision)}
                                maxLength={getMaxLength(wPrecision)}
                                {...restStart}
                                onChange={(e) => {
                                    e.target.value = formatCustomDate(e.target.value, wPrecision);
                                    onStartChange(e);
                                }}
                                className="w-full sm:flex-1 p-4 bg-white border border-gray-200 rounded-xl text-lg font-medium outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
                            />
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder={wPrecision === 'year' ? 'Конец: ГГГГ' : 'Конец (опционально)'}
                                maxLength={getMaxLength(wPrecision)}
                                {...restEnd}
                                onChange={(e) => {
                                    e.target.value = formatCustomDate(e.target.value, wPrecision);
                                    onEndChange(e);
                                }}
                                className="w-full sm:flex-1 p-4 bg-white border border-gray-200 rounded-xl text-lg font-medium outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <input {...register('place')} className="w-full sm:flex-1 p-6 bg-gray-50 rounded-2xl text-lg font-medium outline-none" placeholder="Место проведения" />
                        <div className="relative w-full sm:w-24 h-16 sm:h-auto">
                            <input type="color" {...register('color')} className="w-full h-full p-2 bg-gray-50 rounded-2xl cursor-pointer" />
                        </div>
                    </div>

                    {wType === 'FUTURE' ? (
                        <input {...register('registration_link')} className="p-6 bg-blue-50/50 text-blue-800 rounded-2xl text-lg font-medium outline-none border border-blue-100 placeholder:text-blue-300" placeholder="Ссылка на регистрацию" />
                    ) : (
                        <input {...register('album_link')} className="p-6 bg-green-50/50 text-green-800 rounded-2xl text-lg font-medium outline-none border border-green-100 placeholder:text-green-300" placeholder="Ссылка на фотоальбом" />
                    )}

                    <div className="mt-auto pt-4">
                        <label className="block text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Обложка</label>
                        <input
                            type="file"
                            {...register('images', { onChange: (e) => handleImageChange(e) })}
                            className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-gray-100 rounded-[2.5rem] p-10 items-center justify-center relative border border-dashed border-gray-300">
                    <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-full text-xs font-bold text-gray-400 tracking-widest uppercase shadow-sm">Live Preview</div>
                    <div className="scale-110 origin-center pointer-events-none">
                        <EventCard
                            id={0}
                            name={wName || 'Название события'}
                            description={wDesc || 'Описание события...'}
                            color={wColor}
                            start_datetime={wDate ? parseToBackendFormat(wDate, wPrecision) : new Date().toISOString()}
                            images={previewImage ? [{ id: 0, image: previewImage }] : []}
                            place=""
                            date_range=""
                            mode="full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/members/page.tsx:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatDate } from '@/shared/utils';
import { Title, Text } from '@/shared/ui/Typography';
import { AdminActions } from '@/shared/ui/AdminActions';
import { getImageUrl } from '@/shared/utils/getImageUrl';

const PlusIcon = () => <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>;

export const dynamic = 'force-dynamic';

export default async function MembersListPage() {
    const members = await db.boardMember.findMany({
        orderBy: { start_date: 'desc' }
    });

    return (
        <div className="space-y-8 sm:space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <Title className="!text-3xl sm:!text-5xl mb-2 sm:mb-3 tracking-tight">Состав</Title>
                    <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">Команда студсовета и активисты</Text>
                </div>
                <Link
                    href="/admin/members/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-10 sm:py-5 rounded-3xl shadow-xl shadow-blue-200 transition-all active:scale-95"
                >
                    <PlusIcon />
                    <span className="font-bold text-lg sm:text-xl">Добавить участника</span>
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider w-[180px]">Фото</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider w-1/3">Участник</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">Контакты & Инфо</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">Дата вступления</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider text-right">Действия</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {members.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden bg-gray-100 relative border border-gray-200 shrink-0 shadow-sm">
                                        {member.image ? (
                                            <Image src={getImageUrl(member.image)} fill className="object-cover" alt={member.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-lg">
                                                NO IMG
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                    <Title className="line-clamp-1 mb-2 !text-xl sm:!text-3xl !font-bold tracking-tight">
                                        {member.name}
                                    </Title>
                                    <span className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm sm:text-lg font-bold">
                                        {member.position}
                                    </span>
                                </td>

                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                    <div className="flex flex-col gap-2">
                                        {member.telegram_link && (
                                            <a href={`https://t.me/${member.telegram_link.replace('@', '').replace('https://t.me/', '')}`} target="_blank" className="text-blue-500 hover:text-blue-700 font-bold text-lg sm:text-xl flex items-center gap-2 w-fit">
                                                <span className="text-xl sm:text-2xl">✈️</span>
                                                {member.telegram_link.startsWith('@') ? member.telegram_link : `@${member.telegram_link}`}
                                            </a>
                                        )}
                                        <Text className="text-gray-400 line-clamp-1 !text-base sm:!text-lg mt-1 font-medium">
                                            {member.description || 'Нет описания'}
                                        </Text>
                                    </div>
                                </td>

                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle whitespace-nowrap">
                                    <Text className="font-bold text-gray-900 !text-xl sm:!text-2xl">
                                        {formatDate(member.start_date).split(',')[0]}
                                    </Text>
                                    <div className="text-gray-400 text-sm sm:text-lg mt-1 font-medium">
                                        {formatDate(member.start_date).split(',')[1]}
                                    </div>
                                </td>

                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle text-right">
                                    <AdminActions
                                        id={member.id}
                                        basePath="/admin/members"
                                        apiPath="/board_members"
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {members.length === 0 && (
                        <div className="p-12 sm:p-32 text-center text-gray-400 text-xl sm:text-2xl font-medium">
                            Список участников пуст
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/members/[id]/page.tsx:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Title } from '@/shared/ui/Typography';
import Contact from '@/sections/Additional/components/Contact';
import apiClient from '@/shared/api/axios';
import { getImageUrl } from '@/shared/utils/getImageUrl';

interface MemberForm {
    name: string;
    position: string;
    telegram_link: string;
    description: string;
    start_date: string;
    image: FileList;
}

export default function EditMemberPage() {
    const router = useRouter();
    const params = useParams();
    const memberId = params.id;

    const { register, handleSubmit, watch, reset } = useForm<MemberForm>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const watchedName = watch('name');
    const watchedPos = watch('position');
    const watchedTg = watch('telegram_link');

    useEffect(() => {
        if (!memberId) return;
        apiClient.get(`/board_members/${memberId}`)
            .then((res) => {
                const data = res.data;
                reset({
                    name: data.name,
                    position: data.position,
                    telegram_link: data.telegram_link,
                    description: data.description,
                    start_date: data.start_date ? new Date(data.start_date).toISOString().split('T')[0] : '',
                });
                setPreviewImage(getImageUrl(data.image));
            })
            .catch(() => {
                toast.error('Не удалось загрузить участника');
                router.push('/admin/members');
            })
            .finally(() => setIsLoading(false));
    }, [memberId, reset, router]);


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
    };

    const onSubmit = async (data: MemberForm) => {
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('position', data.position);
        formData.append('telegram_link', data.telegram_link || '');
        formData.append('description', data.description || '');
        formData.append('start_date', data.start_date);

        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        try {
            await apiClient.put(`/board_members/${memberId}`, formData);
            toast.success('Данные обновлены');
            router.push('/admin/members');
            router.refresh();
        } catch {
            toast.error('Ошибка обновления');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div>Загрузка...</div>;

    return (
        <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title className="!text-3xl sm:!text-5xl tracking-tight">Редактировать участника</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
                <div className="w-full lg:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm flex flex-col gap-6 overflow-y-auto border border-gray-200 h-auto lg:h-full">
                    <input {...register('name', { required: true })} className="p-6 bg-gray-50 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="ФИО" />
                    <input {...register('position', { required: true })} className="p-6 bg-gray-50 rounded-2xl text-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Должность" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <input {...register('telegram_link')} className="p-6 bg-gray-50 rounded-2xl text-lg font-medium outline-none" placeholder="Telegram (@username)" />
                        <input type="date" {...register('start_date')} className="p-6 bg-gray-50 rounded-2xl text-lg font-medium outline-none" />
                    </div>

                    <textarea {...register('description')} className="p-6 bg-gray-50 rounded-2xl text-lg min-h-[140px] outline-none resize-none" placeholder="Описание деятельности..." />

                    <div className="mt-auto">
                        <label className="block text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Фотография</label>
                        <input
                            type="file"
                            {...register('image', { onChange: handleImageChange })}
                            className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-gradient-to-b from-gray-900 to-blue-900 rounded-[2.5rem] p-10 items-center justify-center relative shadow-2xl">
                    <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white tracking-widest uppercase">PREVIEW</div>

                    <div className="scale-125 pointer-events-none">
                        <Contact
                            name={watchedName || 'Имя Фамилия'}
                            role={watchedPos || 'Должность'}
                            avatarUrl={previewImage || '/placeholder.png'}
                            tg_link={watchedTg || '#'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/members/new/page.tsx:
```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Title } from '@/shared/ui/Typography';
import Contact from '@/sections/Additional/components/Contact';
import apiClient from '@/shared/api/axios';

interface MemberForm {
    name: string;
    position: string;
    telegram_link: string;
    description: string;
    start_date: string;
    image: FileList;
}

export default function CreateMemberPage() {
    const router = useRouter();
    const { register, handleSubmit, watch } = useForm<MemberForm>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchedName = watch('name');
    const watchedPos = watch('position');
    const watchedTg = watch('telegram_link');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
    };

    const onSubmit = async (data: MemberForm) => {
        setIsSubmitting(true);
        const formData = new FormData();

        formData.append('name', data.name);
        formData.append('position', data.position);
        formData.append('telegram_link', data.telegram_link || '');
        formData.append('description', data.description || '');
        formData.append('start_date', data.start_date);

        if (data.image && data.image.length > 0) {
            formData.append('image', data.image[0]);
        }

        try {
            await apiClient.post('/board_members', formData);

            toast.success('Участник добавлен');
            router.push('/admin/members');
            router.refresh();
        } catch {
            toast.error('Ошибка создания');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title className="!text-3xl sm:!text-5xl tracking-tight">Добавить участника</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Создать'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
                <div className="w-full lg:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm flex flex-col gap-6 overflow-y-auto border border-gray-200 h-auto lg:h-full">
                    <input {...register('name', { required: true })} className="p-6 bg-gray-50 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="ФИО" />
                    <input {...register('position', { required: true })} className="p-6 bg-gray-50 rounded-2xl text-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Должность" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <input {...register('telegram_link')} className="p-6 bg-gray-50 rounded-2xl text-lg font-medium outline-none" placeholder="Telegram (@username)" />
                        <input type="date" {...register('start_date', { required: true })} className="p-6 bg-gray-50 rounded-2xl text-lg font-medium outline-none" />
                    </div>

                    <textarea {...register('description')} className="p-6 bg-gray-50 rounded-2xl text-lg min-h-[140px] outline-none resize-none" placeholder="Описание деятельности..." />

                    <div className="mt-auto">
                        <label className="block text-gray-400 font-bold mb-2 uppercase text-xs tracking-wider">Фотография</label>
                        <input
                            type="file"
                            {...register('image', { onChange: handleImageChange })}
                            className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-gradient-to-b from-gray-900 to-blue-900 rounded-[2.5rem] p-10 items-center justify-center relative shadow-2xl">
                    <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-white tracking-widest uppercase">PREVIEW</div>

                    <div className="scale-125 pointer-events-none">
                        <Contact
                            name={watchedName || 'Имя Фамилия'}
                            role={watchedPos || 'Должность'}
                            avatarUrl={previewImage || '/placeholder.png'}
                            tg_link={watchedTg || '#'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/partners/page.tsx:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { Title, Text } from '@/shared/ui/Typography';
import { AdminActions } from '@/shared/ui/AdminActions';
import { getImageUrl } from '@/shared/utils/getImageUrl';

const PlusIcon = () => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
);

export const dynamic = 'force-dynamic';

export default async function PartnersListPage() {
    const partners = await db.partner.findMany({
        orderBy: { id: 'desc' }
    });

    return (
        <div className="flex flex-col gap-8 sm:gap-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <Title className="!text-3xl sm:!text-5xl mb-2 sm:mb-3 tracking-tight">Партнеры</Title>
                    <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">Компании, с которыми мы работаем</Text>
                </div>
                <Link
                    href="/admin/partners/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-10 sm:py-5 rounded-3xl shadow-xl shadow-blue-200 transition-all active:scale-95"
                >
                    <PlusIcon />
                    <span className="font-bold text-lg sm:text-xl">Добавить партнера</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                {partners.map((partner) => (
                    <div key={partner.id} className="bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center gap-6 sm:gap-8 text-center group hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                        <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center bg-gray-50 rounded-3xl p-6 group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src={getImageUrl(partner.image)}
                                width={200}
                                height={200}
                                className="object-contain w-full h-full"
                                alt={partner.name}
                            />
                        </div>
                        <Title className="!text-xl sm:!text-2xl line-clamp-1">{partner.name}</Title>

                        <div className="w-full pt-4 border-t border-gray-100 mt-auto">
                            <AdminActions
                                id={partner.id}
                                basePath="/admin/partners"
                                apiPath="/partners"
                            />
                        </div>
                    </div>
                ))}

                {partners.length === 0 && (
                    <div className="col-span-full p-12 sm:p-32 text-center text-gray-400 text-xl sm:text-2xl font-medium border-2 border-dashed border-gray-200 rounded-[3rem]">
                        Список партнеров пуст
                    </div>
                )}
            </div>
        </div>
    );
}
```

src/app/admin/partners/[id]/page.tsx:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

import { Title, Text } from '@/shared/ui/Typography';
import apiClient from '@/shared/api/axios';
import { getImageUrl } from '@/shared/utils/getImageUrl';

interface PartnerForm {
    name: string;
    url: string;
    image: FileList;
}

export default function EditPartnerPage() {
    const router = useRouter();
    const params = useParams();
    const partnerId = params.id;

    const { register, handleSubmit, watch, reset } = useForm<PartnerForm>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const watchedName = watch('name');

    useEffect(() => {
        if (!partnerId) return;
        apiClient.get(`/partners/${partnerId}`)
            .then((res) => {
                reset({
                    name: res.data.name,
                    url: res.data.url,
                });
                setPreviewImage(getImageUrl(res.data.image));
            })
            .catch(() => toast.error('Ошибка загрузки'))
            .finally(() => setIsLoading(false));
    }, [partnerId, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
    };

    const onSubmit = async (data: PartnerForm) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('url', data.url);
        if (data.image?.[0]) formData.append('image', data.image[0]);

        try {
            await apiClient.put(`/partners/${partnerId}`, formData);
            toast.success('Партнер обновлен');
            router.push('/admin/partners');
            router.refresh();
        } catch {
            toast.error('Ошибка');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title className="!text-3xl sm:!text-5xl tracking-tight">Редактировать партнера</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
                <div className="w-full lg:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm flex flex-col gap-8 border border-gray-200">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Название</label>
                        <input {...register('name', { required: true })} className="p-6 bg-gray-50 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Название компании" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Веб-сайт</label>
                        <input {...register('url')} className="p-6 bg-gray-50 rounded-2xl text-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://..." />
                    </div>
                    <div className="flex flex-col gap-3 mt-auto">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Логотип</label>
                        <input type="file" {...register('image', { onChange: handleImageChange })} className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer" />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-slate-900 rounded-[2.5rem] p-10 flex-col items-center justify-center relative shadow-2xl">
                    <div className="absolute top-8 right-8 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-white tracking-widest uppercase">PREVIEW</div>

                    <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center p-8 shadow-2xl">
                        {previewImage ? (
                            <Image src={previewImage} width={200} height={200} alt="Logo" className="object-contain w-full h-full" />
                        ) : (
                            <div className="text-gray-300 font-bold text-xl">Логотип</div>
                        )}
                    </div>
                    <Text className="text-white mt-10 !text-3xl font-bold tracking-tight">{watchedName || 'Название компании'}</Text>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/partners/new/page.tsx:
```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

import { Title, Text } from '@/shared/ui/Typography';
import apiClient from '@/shared/api/axios';

interface PartnerForm {
    name: string;
    url: string;
    image: FileList;
}

export default function CreatePartnerPage() {
    const router = useRouter();
    const { register, handleSubmit, watch } = useForm<PartnerForm>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchedName = watch('name');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
    };

    const onSubmit = async (data: PartnerForm) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('url', data.url);

        if (data.image?.[0]) {
            formData.append('image', data.image[0]);
        }

        try {
            await apiClient.post('/partners', formData);

            toast.success('Партнер добавлен');
            router.push('/admin/partners');
            router.refresh();
        } catch (e) {
            console.error(e);
            toast.error('Ошибка при создании');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title className="!text-3xl sm:!text-5xl tracking-tight">Добавить партнера</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Создать'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
                <div className="w-full lg:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm flex flex-col gap-8 border border-gray-200">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Название</label>
                        <input {...register('name', { required: true })} className="p-6 bg-gray-50 rounded-2xl text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="Название компании" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Веб-сайт</label>
                        <input {...register('url')} className="p-6 bg-gray-50 rounded-2xl text-xl font-medium outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="https://..." />
                    </div>
                    <div className="flex flex-col gap-3 mt-auto">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Логотип</label>

                        <input
                            type="file"
                            {...register('image', {
                                required: true,
                                onChange: (e) => handleImageChange(e)
                            })}
                            className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-slate-900 rounded-[2.5rem] p-10 flex-col items-center justify-center relative shadow-2xl">
                    <div className="absolute top-8 right-8 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-xs font-bold text-white tracking-widest uppercase">PREVIEW</div>

                    <div className="w-64 h-64 bg-white rounded-3xl flex items-center justify-center p-8 shadow-2xl">
                        {previewImage ? (
                            <Image src={previewImage} width={200} height={200} alt="Logo" className="object-contain w-full h-full" />
                        ) : (
                            <div className="text-gray-300 font-bold text-xl">Логотип</div>
                        )}
                    </div>
                    <Text className="text-white mt-10 !text-3xl font-bold tracking-tight">{watchedName || 'Название компании'}</Text>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/news/page.tsx:
```tsx
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { formatDate } from '@/shared/utils';
import { Title, Text } from '@/shared/ui/Typography';
import { AdminActions } from '@/shared/ui/AdminActions';
import { getImageUrl } from '@/shared/utils/getImageUrl';

const PlusIcon = () => (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
    </svg>
);

export const dynamic = 'force-dynamic';

export default async function NewsListPage() {
    const news = await db.news.findMany({
        orderBy: { created_at: 'desc' }
    });

    return (
        <div className="space-y-8 sm:space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <Title className="!text-3xl sm:!text-5xl mb-2 sm:mb-3 tracking-tight">Новости</Title>
                    <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">Управление новостной лентой</Text>
                </div>
                <Link
                    href="/admin/news/new"
                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 sm:px-10 sm:py-5 rounded-3xl shadow-xl shadow-blue-200 transition-all active:scale-95"
                >
                    <PlusIcon />
                    <span className="font-bold text-lg sm:text-xl">Создать новость</span>
                </Link>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider w-[180px]">Обложка</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider w-1/2">Контент</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider">Дата</th>
                            <th className="px-8 py-6 sm:px-12 sm:py-8 text-sm sm:text-base font-extrabold text-gray-400 uppercase tracking-wider text-right">Действия</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {news.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-gray-100 relative border border-gray-200 shrink-0 shadow-sm">
                                        {item.cover_url ? (
                                            <Image src={getImageUrl(item.cover_url)} fill className="object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold text-lg">
                                                NO IMG
                                            </div>
                                        )}
                                    </div>
                                </td>

                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle">
                                    <Title className="line-clamp-1 mb-3 !text-xl sm:!text-2xl !leading-tight">
                                        {item.title}
                                    </Title>
                                    <Text className="text-gray-500 line-clamp-2 leading-relaxed !text-base sm:!text-lg font-medium">
                                        {item.description || 'Нет описания'}
                                    </Text>
                                </td>

                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle whitespace-nowrap">
                                        <span className="inline-block bg-gray-100 text-gray-600 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl text-sm sm:text-lg font-bold">
                                            {formatDate(item.created_at)}
                                        </span>
                                </td>

                                <td className="px-8 py-6 sm:px-12 sm:py-8 align-middle text-right">
                                    <AdminActions
                                        id={item.id}
                                        basePath="/admin/news"
                                        apiPath="/news"
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {news.length === 0 && (
                        <div className="p-12 sm:p-24 text-center text-gray-400 text-xl sm:text-2xl font-medium">
                            Список новостей пуст
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/news/[id]/page.tsx:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Title } from '@/shared/ui/Typography';
import NewsCard from '@/sections/News/components/NewsCard';
import apiClient from '@/shared/api/axios';

interface NewsForm {
    title: string;
    description: string;
    cover: FileList;
}

export default function EditNewsPage() {
    const router = useRouter();
    const params = useParams();
    const newsId = params.id;

    const { register, handleSubmit, watch, reset } = useForm<NewsForm>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const watchedTitle = watch('title');
    const watchedDesc = watch('description');

    useEffect(() => {
        if (!newsId) return;
        apiClient.get(`/news/${newsId}`)
            .then((res) => {
                reset({
                    title: res.data.title,
                    description: res.data.description || '',
                });
                setPreviewImage(res.data.cover_url);
            })
            .catch(() => toast.error('Ошибка загрузки'))
            .finally(() => setIsLoading(false));
    }, [newsId, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setPreviewImage(URL.createObjectURL(file));
    };

    const onSubmit = async (data: NewsForm) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        if (data.cover?.[0]) {
            formData.append('cover', data.cover[0]);
        }

        try {
            await apiClient.put(`/news/${newsId}`, formData);
            toast.success('Новость обновлена!');
            router.push('/admin/news');
            router.refresh();
        } catch (e: unknown) {
            toast.error('Что-то пошло не так');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="flex flex-col gap-8 h-[calc(100vh-6rem)]">
            <div className="flex justify-between items-center">
                <Title className="!text-5xl tracking-tight">Редактировать новость</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-3xl font-bold text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
            </div>

            <div className="flex flex-1 gap-10 overflow-hidden">
                <div className="w-full xl:w-1/2 bg-white rounded-[2.5rem] p-10 shadow-sm overflow-y-auto border border-gray-200 flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Заголовок</label>
                        <input
                            {...register('title', { required: true })}
                            className="p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 text-2xl font-bold placeholder:font-normal outline-none transition-all"
                            placeholder="Введите громкий заголовок..."
                        />
                    </div>

                    <div className="flex flex-col gap-3 flex-1">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Контент</label>
                        <textarea
                            {...register('description')}
                            className="flex-1 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 resize-none text-xl leading-relaxed outline-none transition-all"
                            placeholder="Текст новости..."
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Обложка</label>
                        <input
                            type="file"
                            accept="image/*"
                            {...register('cover', { onChange: handleImageChange })}
                            className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-gray-100 rounded-[2.5rem] p-10 flex-col items-center justify-center border border-dashed border-gray-300 relative overflow-hidden">
                    <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-full text-xs font-bold text-gray-400 tracking-widest uppercase z-10 shadow-sm">
                        Live Preview
                    </div>
                    <div className="pointer-events-none w-full flex justify-center">
                        <NewsCard
                            id={0}
                            title={watchedTitle || 'Заголовок новости'}
                            description={watchedDesc || 'Текст описания будет здесь...'}
                            cover_url={previewImage || '/event.png'}
                            created_at={new Date().toISOString()}
                            mode="preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/news/new/page.tsx:
```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import { Title } from '@/shared/ui/Typography';
import NewsCard from '@/sections/News/components/NewsCard';
import apiClient from '@/shared/api/axios';

interface NewsForm {
    title: string;
    description: string;
    cover: FileList;
}

export default function CreateNewsPage() {
    const router = useRouter();
    const { register, handleSubmit, watch } = useForm<NewsForm>();
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const watchedTitle = watch('title');
    const watchedDesc = watch('description');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const onSubmit = async (data: NewsForm) => {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);

        if (data.cover?.[0]) {
            formData.append('cover', data.cover[0]);
        }

        try {
            await apiClient.post('/news', formData);
            toast.success('Новость создана!');
            router.push('/admin/news');
            router.refresh();
        } catch (e) {
            console.error(e);
            toast.error('Что-то пошло не так');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 h-auto lg:h-[calc(100vh-6rem)]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Title className="!text-3xl sm:!text-5xl tracking-tight">Создать новость</Title>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 sm:px-10 sm:py-4 rounded-3xl font-bold text-lg sm:text-xl shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                    {isSubmitting ? 'Сохранение...' : 'Опубликовать'}
                </button>
            </div>

            <div className="flex flex-col lg:flex-row flex-1 gap-10 overflow-visible lg:overflow-hidden">
                <div className="w-full xl:w-1/2 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-10 shadow-sm overflow-y-auto border border-gray-200 flex flex-col gap-8 h-auto lg:h-full">

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Заголовок</label>
                        <input
                            {...register('title', { required: true })}
                            className="p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 text-xl sm:text-2xl font-bold placeholder:font-normal outline-none transition-all"
                            placeholder="Введите громкий заголовок..."
                        />
                    </div>

                    <div className="flex flex-col gap-3 flex-1">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Контент</label>
                        <textarea
                            {...register('description')}
                            className="flex-1 p-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500/20 resize-none text-lg sm:text-xl leading-relaxed outline-none transition-all min-h-[200px]"
                            placeholder="Текст новости..."
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Обложка</label>

                        <input
                            type="file"
                            accept="image/*"
                            {...register('cover', {
                                onChange: (e) => handleImageChange(e)
                            })}
                            className="block w-full text-lg text-gray-500 file:mr-6 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-base file:font-bold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 transition-all cursor-pointer"
                        />
                    </div>
                </div>

                <div className="hidden xl:flex w-1/2 bg-gray-100 rounded-[2.5rem] p-10 flex-col items-center justify-center border border-dashed border-gray-300 relative overflow-hidden">
                    <div className="absolute top-8 right-8 bg-white px-4 py-2 rounded-full text-xs font-bold text-gray-400 tracking-widest uppercase z-10 shadow-sm">
                        Live Preview
                    </div>

                    <div className="pointer-events-none w-full flex justify-center">
                        <NewsCard
                            id={0}
                            title={watchedTitle || 'Заголовок новости'}
                            description={watchedDesc || 'Текст описания будет здесь...'}
                            cover_url={previewImage || '/event.png'}
                            created_at={new Date().toISOString()}
                            mode="preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/requests/page.tsx:
```tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Title, Text } from '@/shared/ui/Typography';
import apiClient from '@/shared/api/axios';
import { formatDate } from '@/shared/utils';

const DEPARTMENTS: Record<string, string> = {
    SCIENCE: 'Наука',
    ITS: 'ITS Tech',
    MEDIA: 'Медиа',
    PARTNERS: 'Партнеры',
    EVENT: 'Event',
    SPORT: 'Спорт',
};

const STATUSES: Record<string, string> = {
    NEW: 'Новая',
    VIEWED: 'Просмотрено',
    CONTACTED: 'Связались',
    INTERVIEW: 'Собеседование',
    ACCEPTED: 'Принят',
    REJECTED: 'Отказ',
};

const STATUS_COLORS: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    VIEWED: 'bg-gray-100 text-gray-700',
    CONTACTED: 'bg-yellow-100 text-yellow-700',
    INTERVIEW: 'bg-purple-100 text-purple-700',
    ACCEPTED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
};

export default function RequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterDept, setFilterDept] = useState('ALL');
    const [isLoading, setIsLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus !== 'ALL') params.append('status', filterStatus);
            if (filterDept !== 'ALL') params.append('department', filterDept);

            const res = await apiClient.get(`/join_requests?${params.toString()}`);
            setRequests(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [filterStatus, filterDept]);

    useEffect(() => {
        fetchRequests();
    }, [filterStatus, filterDept, fetchRequests]);

    return (
        <div className="space-y-8 sm:space-y-10">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
                <div>
                    <Title className="!text-3xl sm:!text-5xl mb-2 tracking-tight">Заявки</Title>
                    <Text className="!text-lg sm:!text-xl text-gray-500 font-medium">Кандидаты в команду</Text>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full sm:w-auto px-6 py-4 bg-white rounded-2xl font-bold text-gray-700 outline-none border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                    >
                        <option value="ALL">Все статусы</option>
                        {Object.entries(STATUSES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="w-full sm:w-auto px-6 py-4 bg-white rounded-2xl font-bold text-gray-700 outline-none border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                    >
                        <option value="ALL">Все направления</option>
                        {Object.entries(DEPARTMENTS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">Дата</th>
                            <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">Кандидат</th>
                            <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">Направление</th>
                            <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider">Статус</th>
                            <th className="px-6 py-6 sm:px-10 text-sm font-extrabold text-gray-400 uppercase tracking-wider text-right">Действия</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Загрузка...</td></tr>
                        ) : requests.length === 0 ? (
                            <tr><td colSpan={5} className="p-10 text-center text-gray-400">Заявок не найдено</td></tr>
                        ) : requests.map((req) => (
                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                                <td className="px-6 py-6 sm:px-10 font-medium text-gray-500 whitespace-nowrap">
                                    {formatDate(req.created_at)}
                                </td>
                                <td className="px-6 py-6 sm:px-10">
                                    <div className="font-bold text-lg sm:text-xl text-gray-900">{req.name}</div>
                                    <div className="text-gray-400 text-sm mt-1">{req.group}</div>
                                </td>
                                <td className="px-6 py-6 sm:px-10">
                                    <span className="font-bold text-gray-600 whitespace-nowrap">{DEPARTMENTS[req.department] || req.department}</span>
                                </td>
                                <td className="px-6 py-6 sm:px-10 whitespace-nowrap">
                                        <span className={`px-4 py-2 rounded-xl text-sm font-bold ${STATUS_COLORS[req.status] || 'bg-gray-100'}`}>
                                            {STATUSES[req.status] || req.status}
                                        </span>
                                </td>
                                <td className="px-6 py-6 sm:px-10 text-right">
                                    <Link
                                        href={`/admin/requests/${req.id}`}
                                        className="inline-block bg-blue-50 text-blue-600 hover:bg-blue-100 px-6 py-3 rounded-2xl font-bold transition-colors"
                                    >
                                        Открыть
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
```

src/app/admin/requests/[id]/page.tsx:
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Title, Text } from '@/shared/ui/Typography';
import apiClient from '@/shared/api/axios';
import { formatDate } from '@/shared/utils';

const DEPT_FIELDS: Record<string, string[]> = {
    'SCIENCE': ['science_role', 'science_interests', 'science_exp'],
    'ITS': ['its_github', 'its_roles', 'its_exp'],
    'MEDIA': ['media_portfolio', 'media_roles', 'media_soft'],
    'PARTNERS': ['partners_exp', 'partners_skill', 'partners_case'],
    'EVENT': ['event_roles', 'event_skills', 'event_exp'],
    'SPORT': ['sport_type', 'sport_roles', 'sport_disciplines'],
};

const FIELD_LABELS: Record<string, string> = {
    'science_role': 'Интересующая роль',
    'science_interests': 'Академические интересы',
    'science_exp': 'Опыт выступлений',
    'its_github': 'GitHub / GitLab',
    'its_roles': 'Направления разработки',
    'its_exp': 'Опыт и стек технологий',
    'media_portfolio': 'Портфолио',
    'media_roles': 'Интересующие направления',
    'media_soft': 'Софт и техника',
    'partners_exp': 'Опыт общения с партнерами',
    'partners_skill': 'Навык деловой переписки',
    'partners_case': 'Решение кейса (Red Bull)',
    'event_roles': 'Желаемая роль',
    'event_skills': 'Скиллы',
    'event_exp': 'Опыт организации ивентов',
    'sport_type': 'Направление спорта',
    'sport_roles': 'Роль в команде',
    'sport_disciplines': 'Дисциплины',
};

const STATUS_OPTIONS = [
    { value: 'NEW', label: 'Новая', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { value: 'VIEWED', label: 'Просмотрено', color: 'bg-gray-50 text-gray-700 border-gray-200' },
    { value: 'CONTACTED', label: 'Связались', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    { value: 'INTERVIEW', label: 'Собеседование', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    { value: 'ACCEPTED', label: 'Принят', color: 'bg-green-50 text-green-700 border-green-200' },
    { value: 'REJECTED', label: 'Отказ', color: 'bg-red-50 text-red-700 border-red-200' },
];

const valueClasses = "w-full px-6 py-5 sm:px-10 sm:py-8 bg-gray-50 rounded-2xl sm:rounded-[2.5rem] font-bold text-lg sm:text-3xl text-gray-900 border-2 border-transparent leading-normal break-words";
const labelClasses = "block text-sm sm:text-lg font-extrabold text-gray-400 uppercase tracking-widest ml-3 sm:ml-6 mb-2 sm:mb-4";

export default function RequestDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [req, setReq] = useState<any>(null);
    const [status, setStatus] = useState('');
    const [comment, setComment] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        apiClient.get(`/join_requests/${id}`).then(res => {
            setReq(res.data);
            setStatus(res.data.status);
            setComment(res.data.admin_comment || '');
        });
    }, [id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiClient.put(`/join_requests/${id}`, { status, admin_comment: comment });
            toast.success('Сохранено');
            router.refresh();
        } catch {
            toast.error('Ошибка');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if(!confirm('Удалить навсегда?')) return;
        await apiClient.delete(`/join_requests/${id}`);
        router.push('/admin/requests');
        router.refresh();
    };

    if (!req) return null;

    const currentFields = DEPT_FIELDS[req.department] || [];

    return (
        <div className="w-full h-full p-4 sm:p-8 md:p-12 pb-32">

            <div className="flex flex-col 2xl:flex-row justify-between items-start 2xl:items-center gap-6 sm:gap-8 mb-8 sm:mb-16">
                <div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-2 sm:mb-4">
                        <Title className="!text-3xl sm:!text-6xl md:!text-7xl tracking-tight break-all">{req.name}</Title>
                        <span className="bg-blue-600 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-xl sm:rounded-[2rem] font-bold text-sm sm:text-2xl tracking-wide shadow-xl shadow-blue-500/30">
                            {req.department}
                        </span>
                    </div>
                    <Text className="text-gray-400 font-medium !text-lg sm:!text-3xl ml-1 sm:ml-2">
                        Заявка от {formatDate(req.created_at)}
                    </Text>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full 2xl:w-auto">
                    <button onClick={() => router.back()} className="flex-1 2xl:flex-none px-8 py-4 sm:px-12 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-bold text-lg sm:text-2xl text-gray-500 bg-white border-2 border-gray-100 hover:bg-gray-50 transition-colors">
                        Назад
                    </button>
                    <button onClick={handleDelete} className="flex-1 2xl:flex-none px-8 py-4 sm:px-12 sm:py-6 rounded-2xl sm:rounded-[2.5rem] font-bold text-lg sm:text-2xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors">
                        Удалить
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 sm:gap-12 items-start">

                <div className="2xl:col-span-8 flex flex-col gap-6 sm:gap-12">

                    <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-gray-400 font-extrabold uppercase tracking-widest mb-6 sm:mb-10 text-base sm:text-xl ml-2">Контакты</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                            <div>
                                <span className={labelClasses}>Учебная группа</span>
                                <div className={valueClasses}>{req.group}</div>
                            </div>

                            <a href={`https://t.me/${req.telegram.replace('@', '')}`} target="_blank" className="block group cursor-pointer hover:opacity-90 transition-opacity">
                                <span className={`${labelClasses} text-blue-400`}>Telegram</span>
                                <div className={`${valueClasses} !bg-blue-50 !text-blue-700`}>
                                    {req.telegram}
                                </div>
                            </a>

                            {req.vk_link && (
                                <a href={req.vk_link} target="_blank" className="block col-span-1 md:col-span-2 group cursor-pointer hover:opacity-90 transition-opacity">
                                    <span className={`${labelClasses} text-blue-400`}>VK Link</span>
                                    <div className={`${valueClasses} !bg-blue-50 !text-blue-700 truncate`}>
                                        {req.vk_link}
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-gray-400 font-extrabold uppercase tracking-widest mb-6 sm:mb-12 text-base sm:text-xl ml-2">Ответы на вопросы</h3>

                        <div className="flex flex-col gap-8 sm:gap-12">
                            {currentFields.length > 0 ? (
                                currentFields.map((key) => {
                                    const value = req.answers?.[key];
                                    return (
                                        <div key={key}>
                                            <span className={labelClasses}>
                                                {FIELD_LABELS[key] || key}
                                            </span>
                                            <div className={`${valueClasses} min-h-[80px] sm:min-h-[100px] h-auto whitespace-pre-wrap`}>
                                                {Array.isArray(value) ? (
                                                    <div className="flex flex-wrap gap-2 sm:gap-4">
                                                        {value.map((tag: string) => (
                                                            <span key={tag} className="bg-white border-2 border-gray-200 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-[1.5rem] text-sm sm:text-2xl font-bold text-gray-700 shadow-sm">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    value || '—'
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-gray-400 text-lg sm:text-2xl font-bold ml-6">
                                    Нет вопросов для этого направления
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="2xl:col-span-4 space-y-6 sm:space-y-12 sticky top-12">

                    <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-xl shadow-blue-900/5 border border-blue-50">
                        <h3 className="text-gray-400 font-extrabold uppercase tracking-widest mb-6 sm:mb-10 text-base sm:text-xl ml-2">Статус</h3>

                        <div className="flex flex-col gap-3 sm:gap-4">
                            {STATUS_OPTIONS.map((opt) => (
                                <label
                                    key={opt.value}
                                    className={`cursor-pointer w-full p-2 pr-4 sm:pr-6 rounded-[1.5rem] sm:rounded-[2.5rem] transition-all flex items-center justify-between group border-2 ${
                                        status === opt.value
                                            ? opt.color
                                            : 'bg-white border-transparent hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[2rem] flex items-center justify-center ${
                                            status === opt.value ? 'bg-white/40' : 'bg-gray-100'
                                        }`}>
                                            <div className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full ${
                                                status === opt.value ? 'bg-current' : 'bg-gray-300'
                                            }`} />
                                        </div>
                                        <span className={`font-bold text-lg sm:text-2xl ${
                                            status === opt.value ? 'text-current' : 'text-gray-500'
                                        }`}>
                                            {opt.label}
                                        </span>
                                    </div>

                                    <input
                                        type="radio"
                                        name="status"
                                        value={opt.value}
                                        checked={status === opt.value}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="hidden"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-6 sm:p-12 rounded-[2rem] sm:rounded-[3.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-gray-400 font-extrabold uppercase tracking-widest mb-6 sm:mb-8 text-base sm:text-xl ml-2">Заметка</h3>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className={`${valueClasses} min-h-[150px] sm:min-h-[250px] resize-none focus:bg-white focus:border-blue-300 focus:outline-none transition-all placeholder:text-gray-300`}
                            placeholder="Комментарий..."
                        />
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full mt-6 sm:mt-8 bg-blue-600 hover:bg-blue-700 text-white py-4 sm:py-8 rounded-[2rem] sm:rounded-[3rem] font-bold text-xl sm:text-3xl shadow-xl shadow-blue-500/20 transition-transform active:scale-[0.98]"
                        >
                            {isSaving ? '...' : 'Сохранить'}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
```

src/sections/Events/index.tsx:
```tsx
'use client';

import type { FC } from 'react';
import { useRouter } from 'next/navigation';

import { usePastEvents } from '@/shared/hooks/useEvents';
import Button from '@/shared/ui/Button';
import { Text } from '@/shared/ui/Typography';
import EventCard from './components/EventCard';
import { EventCardSkeleton } from './components/EventCardSkeleton';

const Events: FC = () => {
    const router = useRouter();
    const { data: events, isLoading, isError } = usePastEvents(6);

    return (
        <section
            id="events"
            className="bg-black flex flex-col w-full mx-auto px-6 py-24 sm:py-40 gap-16"
        >
            <div className="flex flex-col w-full max-w-primary mx-auto gap-16">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <EventCardSkeleton key={index} mode="full" />
                        ))
                    ) : isError ? (
                        <div className="col-span-full text-center py-10">
                            <Text level={3} className="text-red-500">Не удалось загрузить события</Text>
                        </div>
                    ) : events && events.length > 0 ? (
                        events.map((event) => (
                            <EventCard key={event.id} {...event} mode="full" />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10">
                            <Text className="text-white/60">Нет прошедших событий</Text>
                        </div>
                    )}
                </div>

                <div className="w-full sm:w-auto mx-auto">
                    <Button variant="white" size="full" onClick={() => router.push('/events')}>
                        <Text level={4}>Все мероприятия</Text>
                    </Button>
                </div>

            </div>
        </section>
    );
};

export default Events;
```

src/sections/Events/components/EventCardSkeleton.tsx:
```tsx
import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface Props {
    mode?: 'compact' | 'minified' | 'full';
}

export const EventCardSkeleton: FC<Props> = ({ mode = 'full' }) => {
    const baseClass = "rounded-3xl bg-gray-200 overflow-hidden animate-pulse";

    if (mode === 'compact') {
        return (
            <div className={cn(baseClass, "w-full h-full min-h-[160px] flex")}>
                <div className="flex flex-col gap-4 p-6 sm:p-8 flex-1 justify-center min-w-0">
                    <div className="h-6 bg-gray-300 rounded w-3/4" />
                    <div className="h-4 bg-gray-300 rounded w-full" />
                </div>
                <div className="bg-gray-300 rounded-2xl sm:rounded-3xl w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] my-auto mr-6 sm:mr-8 shrink-0" />
            </div>
        );
    }

    return (
        <div className={cn(baseClass, mode === 'minified' ? "max-w-173 md:w-[270px]" : "max-w-220 w-[350px]")}>
            <div className="bg-gray-300 w-full h-[110px]" />
            <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-300 rounded w-full" />
                {mode === 'full' && <div className="h-4 bg-gray-300 rounded w-5/6" />}
            </div>
        </div>
    );
};

export default EventCardSkeleton;
```

src/sections/Events/components/EventCard.tsx:
```tsx
'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Caption, Title } from '@/shared/ui/Typography';
import type { FutureEvent } from '@/shared/api';
import { getImageUrl } from '@/shared/utils/getImageUrl';

type Props = FutureEvent & {
    mode?: 'full' | 'compact' | 'minified';
};

const EventCard: FC<Props> = ({ mode = 'full', ...props }) => {
    const router = useRouter();

    const imageUrl = getImageUrl(props.images?.[0]?.image);

    const handleClick = () => {
        if (props.id === 0) return;

        const path = mode === 'compact' ? 'future' : 'past';
        router.push(`/events/${path}/${props.id}`);
    };

    if (mode === 'compact') {
        return (
            <div
                onClick={handleClick}
                className="rounded-3xl overflow-hidden w-full h-full flex cursor-pointer select-none transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: props.color || 'var(--color-blue-primary)' }}
            >
                <div className="flex flex-col gap-3 text-white p-6 sm:p-8 flex-1 justify-center min-w-0">
                    <Title level={4} className="truncate">{props.name}</Title>
                    <Caption level={2} className="line-clamp-2 text-white/80 !text-sm sm:!text-base leading-snug">{props.description}</Caption>
                </div>
                <Image
                    width={150}
                    height={150}
                    alt={props.name}
                    src={imageUrl}
                    className="rounded-2xl sm:rounded-3xl object-cover w-[80px] h-[80px] sm:w-[120px] sm:h-[120px] my-auto mr-6 sm:mr-8 bg-white/10 shrink-0 self-center"
                />
            </div>
        );
    }

    if (mode === 'minified') {
        return (
            <div
                onClick={handleClick}
                className="rounded-[2.5rem] bg-white overflow-hidden w-full aspect-[3/4] relative cursor-pointer select-none shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 group"
            >
                <Image
                    src={imageUrl}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    alt={props.name}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col gap-2">
                    <Title level={4} className="text-white leading-tight line-clamp-2 drop-shadow-md">
                        {props.name}
                    </Title>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            className="rounded-[2rem] bg-white overflow-hidden w-full min-w-[320px] max-w-220 relative cursor-pointer select-none group shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="h-110 relative w-full">
                <Image
                    src={imageUrl}
                    fill
                    className="object-cover z-10"
                    alt={props.name}
                />

                <div
                    className="absolute inset-0 z-10"
                    style={{
                        background: `linear-gradient(135deg, ${props.color}, rgba(0,0,0,0) 90%)`,
                    }}
                />

                <Title level={4} className="absolute top-8 left-8 text-white z-20 max-w-[85%] break-words leading-tight">
                    {props.name}
                </Title>

                <div
                    className="absolute bottom-6 left-8 z-20 rounded-2xl px-6 py-3 shadow-lg"
                    style={{ backgroundColor: props.color }}
                >
                    <Caption level={2} className="text-white font-bold whitespace-nowrap">
                        Как это было
                    </Caption>
                </div>
            </div>

            <div className="p-8 bg-gray-50 min-h-35">
                <Caption level={2} className="text-gray-600 line-clamp-3 break-words text-base leading-relaxed">
                    {props.description}
                </Caption>
            </div>
        </div>
    );
};

export default EventCard;
```

src/sections/Additional/index.tsx:
```tsx
'use client';

import Image from 'next/image';
import type { FC } from 'react';
import { usePartners } from '@/shared/hooks/usePartners';
import { useHorizontalScroll } from '@/shared/utils';

import { Text, Title } from '@/shared/ui/Typography';
import Contact from './components/Contact';
import contacts from './contacts';
import { getImageUrl } from "@/shared/utils/getImageUrl";

const Additional: FC = () => {
    const { data: partners, isLoading, isError } = usePartners(12);

    const partnersScrollRef = useHorizontalScroll();
    const contactsScrollRef = useHorizontalScroll();

    return (
        <section
            id="additional"
            className="flex flex-col w-full mx-auto px-6 py-40 pb-32 bg-gradient-to-b from-black to-blue-primary"
        >
            <div className="flex flex-col mx-auto w-full max-w-primary gap-24 overflow-hidden">

                <div className="space-y-16">
                    <Title level={1} className="text-white text-center sm:text-7xl">
                        Наши партнёры
                    </Title>

                    <div ref={partnersScrollRef} className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide sm:justify-center sm:flex-wrap min-h-[160px]">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="w-40 h-40 bg-white/10 rounded-xl animate-pulse flex-shrink-0" />
                            ))
                        ) : isError ? (
                            <div className="flex items-center justify-center w-full">
                                <Text level={3} className="text-red-400 text-center">
                                    Не удалось загрузить партнёров
                                </Text>
                            </div>
                        ) : (
                            partners?.map((partner) => {
                                const Content = (
                                    <div className="w-40 h-40 bg-white rounded-xl flex items-center justify-center flex-shrink-0 p-4 hover:scale-105 transition-transform cursor-pointer">
                                        <Image
                                            width={120}
                                            height={120}
                                            src={getImageUrl(partner.image)}
                                            alt={partner.name}
                                            className="object-contain w-full h-full pointer-events-none"
                                        />
                                    </div>
                                );

                                if (partner.url) {
                                    return (
                                        <a key={partner.id} href={partner.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                                            {Content}
                                        </a>
                                    );
                                }

                                return <div key={partner.id} className="shrink-0">{Content}</div>;
                            })
                        )}
                    </div>
                </div>

                <div className="space-y-16" id="contacts">
                    <Title level={1} className="text-white text-center sm:text-7xl">
                        Контакты
                    </Title>

                    <div ref={contactsScrollRef} className="flex overflow-x-auto lg:overflow-x-visible lg:flex-row lg:justify-between items-center gap-8 lg:gap-16 w-full max-w-[1600px] mx-auto pb-4 px-4 sm:px-0 snap-x snap-mandatory scrollbar-hide">
                        {contacts.map((contact) => (
                            <div key={contact.name} className="snap-center shrink-0">
                                <Contact {...contact} />
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Additional;
```

src/sections/Additional/contacts.ts:
```typescript
export interface ContactProps {
    avatarUrl: string;
    name: string;
    role: string;
    tg_link: string;
}

const contacts: ContactProps[] = [
    {
        avatarUrl: '/images/a_evdokimova.jpg',
        name: 'Анастасия Евдокимова',
        role: 'Председатель',
        tg_link: '@epkoliptik'
    },
    {
        avatarUrl: '/images/k_zhikharev.jpg',
        name: 'Кирилл Жихарев',
        role: 'Заместитель председателя',
        tg_link: '@zhikhkirill'
    },
    {
        avatarUrl: '/images/d_domnich.jpg',
        name: 'Данил Домнич',
        role: 'Внешние коммуникации',
        tg_link: '@h1rotik'
    },
];

export default contacts;
```

src/sections/Additional/components/Contact.tsx:
```tsx
import Image from 'next/image';
import type { FC } from 'react';

import { Text, Title } from '@/shared/ui/Typography';
import type { ContactProps } from '../contacts';

const Contact: FC<ContactProps> = ({ avatarUrl, name, role, tg_link }) => {

    const href = tg_link.startsWith('http')
        ? tg_link
        : `https://t.me/${tg_link.replace('@', '')}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col gap-8 items-center text-center group cursor-pointer"
        >
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden border-4 border-white/10 group-hover:border-blue-500/50 transition-all duration-300">
                <Image
                    src={avatarUrl}
                    alt={`Фото ${name}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 288px, 384px"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Title level={3} className="text-white leading-tight group-hover:text-blue-400 transition-colors">
                    {name}
                </Title>
                <Text level={4} className="text-white/60 font-medium">
                    {role}
                </Text>
            </div>
        </a>
    );
};

export default Contact;
```

src/sections/News/index.tsx:
```tsx
'use client';

import { type FC, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useNewsList } from '@/shared/hooks/useNews';

import Button from '@/shared/ui/Button';
import { Text, Title } from '@/shared/ui/Typography';
import NewsCard from './components/NewsCard';
import { NewsCardSkeleton } from './components/NewsCardSkeleton';

const News: FC = () => {
    const router = useRouter();
    const { data: news, isLoading, isError } = useNewsList(3);

    const sortedNews = useMemo(() => {
        if (!news) return [];
        return [...news].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [news]);

    return (
        <section
            id="news"
            className="flex flex-col w-full mx-auto mt-24 sm:mt-48 px-6 2xl:px-0 max-w-primary gap-12 pb-24"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">

                <div className="flex flex-col gap-6 w-full justify-start py-2">
                    <Title className="leading-none">Наши новости</Title>
                    <Text className="text-gray-600 text-lg sm:text-xl max-w-6xl leading-relaxed">
                        Здесь вы можете найти наши новости, а также информацию о жизни факультета.
                        Мы регулярно публикуем отчеты о мероприятиях и важные анонсы.
                    </Text>
                </div>

                {isError ? (
                    <div className="flex items-center justify-center col-span-1 bg-gray-50 rounded-3xl h-64">
                        <Text className="text-red-500 text-center">Не удалось загрузить новости.</Text>
                    </div>
                ) : isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-full">
                            <NewsCardSkeleton />
                        </div>
                    ))
                ) : (
                    sortedNews.map((item) => (
                        <div key={item.id} className="w-full">
                            <NewsCard {...item} />
                        </div>
                    ))
                )}
            </div>

            <div className="w-full mt-4">
                <Button
                    variant="black"
                    size="inline"
                    onClick={() => router.push('/news')}
                >
                    <Text level={4}>Смотреть все</Text>
                </Button>
            </div>
        </section>
    );
};

export default News;
```

src/sections/News/components/NewsCardSkeleton.tsx:
```tsx
import type { FC } from 'react';

export const NewsCardSkeleton: FC = () => {
    return (
        <div className="flex flex-col gap-4 w-full xl:max-w-300 2xl:max-w-350 mx-auto lg:mx-0 animate-pulse">
            <div className="bg-gray-200 rounded-3xl w-full h-48 sm:h-64 xl:h-44 2xl:h-48"></div>
            <div className="flex justify-between items-center px-1">
                <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 rounded w-1/5"></div>
            </div>
            <div className="space-y-2 px-1">
                <div className="h-6 bg-gray-300 rounded w-full"></div>
                <div className="h-6 bg-gray-300 rounded w-5/6"></div>
            </div>
        </div>
    );
};

export default NewsCardSkeleton;
```

src/sections/News/components/NewsCard.tsx:
```tsx
import Image from 'next/image';
import Link from 'next/link';
import type { FC } from 'react';

import { Caption, Text, Title } from '@/shared/ui/Typography';
import type { News } from '@/shared/api';
import { formatDate } from '@/shared/utils';
import { cn } from '@/lib/utils';
import { getImageUrl } from '@/shared/utils/getImageUrl';

type Props = News & {
    mode?: 'default' | 'preview';
};

const NewsCard: FC<Props> = ({ mode = 'default', ...props }) => {
    const isPreview = mode === 'preview';
    const imageUrl = getImageUrl(props.cover_url);

    const CardContent = (
        <div
            className={cn(
                "flex flex-col gap-5 w-full group cursor-pointer h-full",
                isPreview
                    ? "max-w-[380px] mx-auto bg-white rounded-[2rem] shadow-sm p-5 pointer-events-none"
                    : "w-full"
            )}
        >
            <div className="overflow-hidden rounded-[2rem] relative w-full bg-gray-100">
                <Image
                    src={imageUrl}
                    width={800}
                    height={400}
                    className={cn(
                        "object-cover w-full transition-transform duration-500 group-hover:scale-105",
                        isPreview
                            ? "h-[220px]"
                            : "h-[240px] sm:h-[280px]"
                    )}
                    alt={props.title}
                />
            </div>

            <div className="flex flex-col gap-3 px-1">
                <div className="flex justify-between items-start gap-4">
                    <Title level={4} className="leading-tight line-clamp-2 font-bold group-hover:text-blue-600 transition-colors">
                        {props.title}
                    </Title>
                    <Caption level={2} className="text-gray-400 whitespace-nowrap pt-1">
                        {formatDate(props.created_at)}
                    </Caption>
                </div>

                <Text level={4} className="text-gray-600 line-clamp-3 leading-relaxed">
                    {props.description}
                </Text>
            </div>
        </div>
    );

    if (isPreview) return CardContent;

    return (
        <Link href={`/news/${props.id}`}>
            {CardContent}
        </Link>
    );
};

export default NewsCard;
```

scripts/create-admin.ts:
```typescript
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
```

prisma/schema.prisma:
```
generator client {
  provider   = "prisma-client-js"
  output     = "../node_modules/.prisma/client"
  engineType = "client"
}

datasource db {
  provider = "postgresql"
}

enum EventType {
  FUTURE
  PAST
}

enum Precision {
  year
  month
  day
  time
}

model BoardMember {
  id            Int      @id @default(autoincrement())
  name          String
  telegram_link String
  position      String
  start_date    DateTime
  description   String?
  image         String?
}

model News {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  cover_url   String?
  created_at  DateTime @default(now())
}

model Partner {
  id    Int     @id @default(autoincrement())
  name  String
  url   String?
  image String
}

model Event {
  id             Int       @id @default(autoincrement())
  type           EventType
  name           String
  description    String?
  place          String?
  color          String?
  precision      Precision @default(time)
  start_datetime DateTime
  end_datetime   DateTime?

  album_link        String?
  registration_link String?

  images EventImage[]
}

model EventImage {
  id       Int    @id @default(autoincrement())
  image    String
  event_id Int
  event    Event  @relation(fields: [event_id], references: [id], onDelete: Cascade)
}

model AdminUser {
  id       Int    @id @default(autoincrement())
  email    String @unique
  password String
}

enum RequestStatus {
  NEW
  VIEWED
  CONTACTED
  INTERVIEW
  ACCEPTED
  REJECTED
}

model JoinRequest {
  id       Int     @id @default(autoincrement())
  name     String
  group    String
  telegram String
  vk_link  String?

  department String
  answers    Json

  status        RequestStatus @default(NEW)
  admin_comment String?

  created_at DateTime @default(now())
}
```

