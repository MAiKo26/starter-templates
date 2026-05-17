import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/lib/http-client"

export function useProjectDeleteMutation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => http.delete<void>(`/api/v1/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "list"] })
      queryClient.removeQueries({ queryKey: ["projects", id] })
    },
  })
}
