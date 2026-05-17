import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { Project } from "@/types"

export function useProjectQuery(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => http.get<Project>(`/api/v1/projects/${id}`),
    enabled: !!id,
  })
}
