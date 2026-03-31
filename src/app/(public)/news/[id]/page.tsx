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

            <div className="flex flex-col mx-auto w-full max-w-[60dvw]">
                <Title level={2} className="leading-tight mb-6 !text-3xl sm:!text-4xl md:!text-5xl lg:!text-6xl text-gray-900">
                    {news.title}
                </Title>

                <div className="flex flex-col gap-1 mb-8 text-gray-500">
                    <Caption className="font-medium text-sm sm:text-base">{formatDate(news.created_at)}</Caption>
                    <Caption className="font-medium text-sm sm:text-base">Текст: Ред. СтудСовет ИУ</Caption>
                    <Caption className="font-medium text-sm sm:text-base">Фото: Архив</Caption>
                </div>

                <div className="w-full aspect-[4/3] sm:aspect-video relative overflow-hidden bg-gray-100 mb-10">
                    <Image src={getImageUrl(news.cover_url)} fill className="object-cover" alt={news.title} priority />
                </div>

                <div className="w-full">
                    <p className="text-lg sm:text-xl md:text-[22px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {news.description}
                    </p>
                </div>
            </div>
        </article>
    );
}
