"use client";

import type { FC } from "react";
import { useFutureEvents } from "@/shared/hooks/useEvents";
import Carousel, { CarouselSkeleton } from "../EventDetails";
import { Text, Title } from "@/shared/ui/Typography";
import Button from "@/shared/ui/Button";
import { formatDate } from "@/shared/utils";

const EventsCarousel: FC = () => {
  const { data: events, isLoading, isError } = useFutureEvents(5);

  if (isLoading) return <CarouselSkeleton />;

  if (isError || !events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-5rem)] bg-black">
        <Title className="text-white/50">
          {isError
            ? "Ошибка загрузки мероприятий"
            : "Нет предстоящих мероприятий"}
        </Title>
      </div>
    );
  }

  const slides = events.map((event) => ({
    ...event,
    before: event.registration_link ? (
      <Button
        variant="white"
        size="primary"
        onClick={() => window.open(event.registration_link!, "_blank")}
      >
        <Title level={5}>Зарегистрироваться</Title>
      </Button>
    ) : null,
    after: (
      <div className="flex flex-col items-end text-right gap-1">
        <Title level={4} className="text-white">
          {event.place || "Место уточняется"}
        </Title>

        <Text level={4} className="text-white/60">
          {formatDate(event.start_datetime)}
        </Text>
      </div>
    ),
  }));

  return <Carousel slides={slides} options={{ loop: true }} />;
};

export default EventsCarousel;
