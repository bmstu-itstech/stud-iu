import { useQuery } from "@tanstack/react-query";
import { getNews, getNewsById } from "@/shared/api";

export const useNewsList = (limit = 3) => {
  return useQuery({
    queryKey: ["newsList", limit],
    queryFn: () => getNews({ limit }).then((res) => res.data.results),
    staleTime: 5 * 60 * 1000,
  });
};

export const useNewsDetails = (id: number) => {
  return useQuery({
    queryKey: ["newsDetails", id],
    queryFn: () => getNewsById(id).then((res) => res.data),
    enabled: !isNaN(id),
  });
};
