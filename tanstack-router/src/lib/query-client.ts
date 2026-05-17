import { QueryClient } from "@tanstack/react-query"

import { FIVE_MINUTES_MS, ONE_MINUTE_MS } from "@/constants/time"

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: ONE_MINUTE_MS,
        gcTime: FIVE_MINUTES_MS,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}
