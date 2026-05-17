import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/lib/http-client"

export function useTaskDeleteMutation(projectId: string, id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      http.delete<void>(`/api/v1/projects/${projectId}/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", projectId, "tasks", "list"],
      })
      queryClient.removeQueries({
        queryKey: ["projects", projectId, "tasks", id],
      })
    },
  })
}
