"use client";

import { useParams } from "next/navigation";
import { useEventDetails } from "@/shared/hooks/useEvents";
import { Text, Title } from "@/shared/ui/Typography";
import Carousel, { CarouselSkeleton } from "@/widgets/EventDetails";
import Button from "@/shared/ui/Button";
import type { PastEvent } from "@/shared/api";
import { formatDate } from "@/shared/utils";

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-[calc(100dvh-5rem)] bg-black">
    <Title className="text-white/50">{message}</Title>
  </div>
);

export default function PastEventDetailsPage() {
  const params = useParams();
  const eventId = params?.id ? Number(params.id) : NaN;

  const { data, isLoading, isError } = useEventDetails(eventId, "past");

  if (isLoading || isNaN(eventId)) {
    return <CarouselSkeleton />;
  }

  if (isError) {
    return <ErrorState message="Не удалось загрузить мероприятие." />;
  }

  if (!data) {
    return <ErrorState message="Мероприятие не найдено." />;
  }

  const event = data as PastEvent;

  return (
    <Carousel
      slides={[
        {
          ...event,
          color: event.color,
          before: event.album_link ? (
            <Button
              variant="white"
              size="primary"
              onClick={() => window.open(event.album_link!, "_blank")}
            >
              <Title level={5}>Смотреть фото</Title>
            </Button>
          ) : (
            <Text className="text-white/40 italic">
              Фотоотчет пока не загружен
            </Text>
          ),
          after: (
            <div className="flex flex-col items-end text-right gap-1">
              <Title level={4} className="text-white">
                {event.place || "Место проведения"}
              </Title>
              <Text level={4} className="text-white/60">
                {formatDate(event.start_datetime)}
              </Text>
            </div>
          ),
        },
      ]}
      options={{ loop: false }}
    />
  );
}
