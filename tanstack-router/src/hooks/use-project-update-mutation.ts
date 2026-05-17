import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { Project, ProjectUpdate } from "@/types"

export function useProjectUpdateMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectUpdate) =>
      http.patch<Project>(`/api/v1/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] })
      queryClient.invalidateQueries({ queryKey: ["projects", id] })
    },
  })
}
