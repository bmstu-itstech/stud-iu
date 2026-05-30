import { useQuery } from "@tanstack/react-query";
import { getPartners } from "@/shared/api";

export const usePartners = (limit = 12) => {
  return useQuery({
    queryKey: ["partnersList", limit],
    queryFn: () => getPartners({ limit }).then((res) => res.data.results),
    staleTime: 10 * 60 * 1000,
  });
};
