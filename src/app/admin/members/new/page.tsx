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
