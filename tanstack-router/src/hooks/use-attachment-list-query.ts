import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { AttachmentListQuery, AttachmentListResponse } from "@/types"

export function useAttachmentListQuery(
  taskId: string,
  params?: AttachmentListQuery,
) {
  return useQuery({
    queryKey: ["tasks", taskId, "attachments", "list", params],
    queryFn: () =>
      http.get<AttachmentListResponse>(`/api/v1/tasks/${taskId}/attachments`, {
        params,
      }),
    enabled: !!taskId,
  })
}
