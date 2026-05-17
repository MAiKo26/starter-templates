import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { Task } from "@/types"

export function useTaskQuery(projectId: string, id: string) {
  return useQuery({
    queryKey: ["projects", projectId, "tasks", id],
    queryFn: () => http.get<Task>(`/api/v1/projects/${projectId}/tasks/${id}`),
    enabled: !!projectId && !!id,
  })
}
