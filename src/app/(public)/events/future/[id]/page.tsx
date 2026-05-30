"use client";
import { useParams } from "next/navigation";
import { useEventDetails } from "@/shared/hooks/useEvents";
import { Text, Title } from "@/shared/ui/Typography";
import Carousel, { CarouselSkeleton } from "@/widgets/EventDetails";
import Button from "@/shared/ui/Button";
import type { FutureEvent } from "@/shared/api";
import { formatDate } from "@/shared/utils";

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex items-center justify-center h-[calc(100dvh-5rem)] bg-black">
    <Title className="text-white/50">{message}</Title>
  </div>
);

export default function FutureEventDetailsPage() {
  const params = useParams();
  const eventId = params?.id ? Number(params.id) : NaN;

  const { data, isLoading, isError } = useEventDetails(eventId, "future");

  if (isLoading || isNaN(eventId)) {
    return <CarouselSkeleton />;
  }

  if (isError) {
    return <ErrorState message="Не удалось загрузить мероприятие." />;
  }

  if (!data) {
    return <ErrorState message="Мероприятие не найдено." />;
  }

  const event = data as FutureEvent;

  return (
    <Carousel
      slides={[
        {
          ...event,
          color: event.color,
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
        },
      ]}
      options={{ loop: false }}
    />
  );
}
