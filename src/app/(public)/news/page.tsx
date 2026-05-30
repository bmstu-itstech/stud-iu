"use client";

import { useNewsList } from "@/shared/hooks/useNews";
import { Title, Text } from "@/shared/ui/Typography";
import NewsCard from "@/sections/News/components/NewsCard";
import { NewsCardSkeleton } from "@/sections/News/components/NewsCardSkeleton";

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
          Array.from({ length: 6 }).map((_, i) => <NewsCardSkeleton key={i} />)
        ) : isError ? (
          <Text className="text-red-500 col-span-full">
            Ошибка загрузки новостей
          </Text>
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
