import { useQuery } from "@tanstack/react-query"

import { http } from "@/lib/http-client"
import type { ProjectListQuery, ProjectListResponse } from "@/types"

export function useProjectListQuery(params?: ProjectListQuery) {
  return useQuery({
    queryKey: ["projects", "list", params],
    queryFn: () =>
      http.get<ProjectListResponse>("/api/v1/projects", { params }),
  })
}
