import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { AttachmentDownloadResponse } from "@/types"

export function useAttachmentDownloadQuery(id: string) {
  return useQuery({
    queryKey: ["attachments", id, "download"],
    queryFn: () =>
      http.get<AttachmentDownloadResponse>(
        `/api/v1/attachments/${id}/download`,
      ),
    enabled: !!id,
    staleTime: 5 * 60_000,
  })
}
