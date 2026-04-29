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
