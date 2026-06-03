"use client";

import { type FC, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useNewsList } from "@/shared/hooks/useNews";

import Button from "@/shared/ui/Button";
import { Text, Title } from "@/shared/ui/Typography";
import NewsCard from "./components/NewsCard";
import { NewsCardSkeleton } from "./components/NewsCardSkeleton";

const News: FC = () => {
  const router = useRouter();
  const { data: news, isLoading, isError } = useNewsList(3);

  const sortedNews = useMemo(() => {
    if (!news) return [];
    return [...news].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
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
            Свежая информация о последних событиях в жизни факультета.
          </Text>
        </div>

        {isError ? (
          <div className="flex items-center justify-center col-span-1 bg-gray-50 rounded-3xl h-64">
            <Text className="text-red-500 text-center">
              Не удалось загрузить новости.
            </Text>
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
          onClick={() => router.push("/news")}
        >
          <Text level={4}>Смотреть все</Text>
        </Button>
      </div>
    </section>
  );
};

export default News;
