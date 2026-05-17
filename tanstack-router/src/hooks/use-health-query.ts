import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { HealthResponse } from "@/types"

export function useHealthQuery() {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => http.get<HealthResponse>("/health"),
    staleTime: 30_000,
    retry: false,
  })
}
