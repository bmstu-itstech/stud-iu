import { useQuery } from "@tanstack/react-query";
import {
  getFutureEvents,
  getPastEvents,
  getFutureEventById,
  getPastEventById,
  type FutureEvent,
  type PastEvent,
} from "@/shared/api";

export const useFutureEvents = (limit = 10) => {
  return useQuery<FutureEvent[], Error>({
    queryKey: ["futureEvents", limit],
    queryFn: () => getFutureEvents({ limit }).then((res) => res.data.results),
    staleTime: 5 * 60 * 1000,
  });
};

export const usePastEvents = (limit = 6) => {
  return useQuery<PastEvent[], Error>({
    queryKey: ["pastEvents", limit],
    queryFn: () => getPastEvents({ limit }).then((res) => res.data.results),
  });
};

type EventDetailType = FutureEvent | PastEvent;

export const useEventDetails = (id: number, type: "future" | "past") => {
  return useQuery<EventDetailType, Error>({
    queryKey: [type, id],
    queryFn: async () => {
      const fn = type === "future" ? getFutureEventById : getPastEventById;
      const response = await fn(id);
      return response.data;
    },
    enabled: !isNaN(id),
  });
};
