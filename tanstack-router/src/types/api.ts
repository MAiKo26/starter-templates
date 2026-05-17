export interface ErrorResponse {
  error: string
}

export interface HealthResponse {
  status: string
  timestamp: string
  services: {
    database: string
    storage: string
  }
}

export interface PaginationQuery {
  limit?: number
  offset?: number
}

export interface PaginationMeta {
  total: number
  limit: number
  offset: number
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: string
  ownerId: string | null
  createdAt: string
  updatedAt: string
}

export type ProjectStatus = "active" | "planning" | "completed" | "archived"

export interface ProjectCreate {
  name: string
  description?: string
  status?: ProjectStatus
}

export interface ProjectUpdate {
  name?: string
  description?: string | null
  status?: ProjectStatus
}

export interface ProjectListQuery extends PaginationQuery {
  search?: string
  status?: string
}

export interface ProjectListResponse {
  data: Project[]
  meta: PaginationMeta
}

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "urgent"

export interface Task {
  id: string
  projectId: string
  title: string
  description: string | null
  status: string
  priority: string
  assigneeId: string | null
  dueDate: string | null
  createdAt: string
  updatedAt: string
}

export interface TaskCreate {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string | null
  dueDate?: string | null
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  assigneeId?: string | null
  dueDate?: string | null
}

export interface TaskListQuery extends PaginationQuery {
  status?: string
  priority?: string
  assigneeId?: string
}

export interface TaskListResponse {
  data: Task[]
  meta: PaginationMeta
}

export interface Attachment {
  id: string
  taskId: string
  fileName: string
  fileKey: string
  mimeType: string
  fileSize: number
  uploadedBy: string | null
  createdAt: string
}

export interface AttachmentCreate {
  fileName: string
  mimeType: string
  fileSize: number
}

export interface AttachmentListQuery extends PaginationQuery {
  _brand?: never
}

export interface AttachmentListResponse {
  data: Attachment[]
  meta: PaginationMeta
}

export interface AttachmentUploadResponse {
  uploadUrl: string
  attachment: Attachment
}

export interface AttachmentDownloadResponse {
  downloadUrl: string
}
