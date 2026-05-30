"use client";

import { useFutureEvents, usePastEvents } from "@/shared/hooks/useEvents";
import EventCard from "@/sections/Events/components/EventCard";
import { EventCardSkeleton } from "@/sections/Events/components/EventCardSkeleton";
import { Text, Title } from "@/shared/ui/Typography";
import { useHorizontalScroll } from "@/shared/utils";

export default function EventsPage() {
  const {
    data: futureEvents,
    isLoading: isFutureLoading,
    isError: isFutureError,
  } = useFutureEvents(10);
  const {
    data: pastEvents,
    isLoading: isPastLoading,
    isError: isPastError,
  } = usePastEvents(100);
  const scrollRef = useHorizontalScroll();

  return (
    <>
      <section className="flex flex-col lg:flex-row gap-8 lg:gap-16 w-full mx-auto px-6 2xl:px-0 max-w-primary pb-24 pt-12 overflow-hidden">
        <div className="flex flex-col gap-4 w-full lg:w-[350px] xl:w-[400px] shrink-0">
          <Title level={2} className="leading-none">
            Будущие мероприятия
          </Title>
          <Text level={2} className="text-gray-500">
            Регистрируйтесь на наши новые мероприятия
          </Text>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 min-w-0 flex items-stretch gap-6 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
        >
          {isFutureLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 snap-start w-[320px] sm:w-[450px]"
              >
                <EventCardSkeleton mode="compact" />
              </div>
            ))
          ) : isFutureError ? (
            <Text className="text-red-500">Ошибка загрузки</Text>
          ) : (
            futureEvents?.map((event) => (
              <div
                key={event.id}
                className="shrink-0 snap-start h-auto w-[320px] sm:w-[450px]"
              >
                <EventCard mode="compact" {...event} />
              </div>
            ))
          )}
        </div>
      </section>

      <section className="flex flex-1 py-24 gap-30 w-dvw mx-auto px-6 2xl:px-0 bg-gradient-to-b from-blue-primary to-black text-white">
        <div className="flex flex-col flex-1 max-w-primary mx-auto">
          <Title level={2} className="text-white mb-12">
            Прошедшие мероприятия
          </Title>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {isPastLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <EventCardSkeleton mode="minified" />
                </div>
              ))
            ) : isPastError ? (
              <Text className="text-white/50 col-span-full">
                Не удалось загрузить историю
              </Text>
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
