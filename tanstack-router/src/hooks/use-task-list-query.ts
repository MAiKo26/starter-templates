import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { TaskListQuery, TaskListResponse } from "@/types"

export function useTaskListQuery(projectId: string, params?: TaskListQuery) {
  return useQuery({
    queryKey: ["projects", projectId, "tasks", "list", params],
    queryFn: () =>
      http.get<TaskListResponse>(`/api/v1/projects/${projectId}/tasks`, {
        params,
      }),
    enabled: !!projectId,
  })
}
