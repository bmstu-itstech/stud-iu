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
