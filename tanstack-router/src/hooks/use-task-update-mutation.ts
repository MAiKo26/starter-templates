import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { Task, TaskUpdate } from "@/types"

export function useTaskUpdateMutation(projectId: string, id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TaskUpdate) =>
      http.patch<Task>(`/api/v1/projects/${projectId}/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks", "list"],
      })
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks", id],
      })
    },
  })
}
