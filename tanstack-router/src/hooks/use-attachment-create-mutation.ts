import { useMutation, useQueryClient } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { AttachmentCreate, AttachmentUploadResponse } from "@/types"

export function useAttachmentCreateMutation(taskId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: AttachmentCreate) =>
      http.post<AttachmentUploadResponse>(
        `/api/v1/tasks/${taskId}/attachments`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks", taskId, "attachments", "list"],
      })
    },
  })
}
