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
