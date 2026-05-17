import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { Project, ProjectCreate } from "@/types"

export function useProjectCreateMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProjectCreate) =>
      http.post<Project>("/api/v1/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] })
    },
  })
}
