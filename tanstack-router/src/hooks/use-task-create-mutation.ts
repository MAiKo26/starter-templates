import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { Task, TaskCreate } from "@/types"

export function useTaskCreateMutation(projectId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TaskCreate) =>
      http.post<Task>(`/api/v1/projects/${projectId}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks", "list"],
      })
    },
  })
}
