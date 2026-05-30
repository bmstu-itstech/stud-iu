"use client";

import type { FC } from "react";
import { useRouter } from "next/navigation";

import { usePastEvents } from "@/shared/hooks/useEvents";
import Button from "@/shared/ui/Button";
import { Text } from "@/shared/ui/Typography";
import EventCard from "./components/EventCard";
import { EventCardSkeleton } from "./components/EventCardSkeleton";

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
              <Text level={3} className="text-red-500">
                Не удалось загрузить события
              </Text>
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
          <Button
            variant="white"
            size="full"
            onClick={() => router.push("/events")}
          >
            <Text level={4}>Все мероприятия</Text>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Events;
