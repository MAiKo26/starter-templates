import { Link, createFileRoute } from "@tanstack/react-router"

import {
  ArrowLeft,
  Calendar,
  Flag,
  Paperclip,
  Upload,
  User,
} from "lucide-react"

import { AppLayout } from "@/components/layouts/app-layout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAttachmentListQuery } from "@/hooks/use-attachment-list-query"
import { useTaskQuery } from "@/hooks/use-task-query"

export const Route = createFileRoute("/projects/$projectId/tasks/$taskId")({
  component: TaskDetailPage,
})

function TaskDetailPage() {
  const { projectId, taskId } = Route.useParams()
  const { data: task, isLoading: taskLoading } = useTaskQuery(projectId, taskId)
  const { data: attachments, isLoading: attachmentsLoading } =
    useAttachmentListQuery(taskId)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects/$projectId" params={{ projectId }}>
              <ArrowLeft className="size-4" data-icon="inline-start" />
            </Link>
          </Button>
          <div className="flex-1">
            {taskLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">
                {task?.title}
              </h1>
            )}
          </div>
          {task && (
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  task.status === "done"
                    ? "secondary"
                    : task.status === "in_progress"
                      ? "default"
                      : "outline"
                }
              >
                {task.status.replace("_", " ")}
              </Badge>
              <Badge
                variant={
                  task.priority === "urgent"
                    ? "destructive"
                    : task.priority === "high"
                      ? "outline"
                      : "secondary"
                }
              >
                {task.priority}
              </Badge>
            </div>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                {taskLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {task?.description || "No description provided."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Due Date</p>
                    <p className="font-medium">
                      {task?.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "Not set"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <User className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Assignee</p>
                    <p className="font-medium">
                      {task?.assigneeId ? "Assigned" : "Unassigned"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Flag className="text-muted-foreground size-4" />
                  <div>
                    <p className="text-muted-foreground text-sm">Priority</p>
                    <p className="font-medium capitalize">{task?.priority}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>
                {attachments?.meta.total ?? 0} files
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Upload className="mr-2 size-4" data-icon="inline-start" />
              Upload
            </Button>
          </CardHeader>
          <CardContent>
            {attachmentsLoading && (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            )}

            {!attachmentsLoading &&
              (!attachments || attachments.data.length === 0) && (
                <Empty>
                  <EmptyHeader>
                    <EmptyTitle>No attachments</EmptyTitle>
                    <EmptyDescription>
                      Upload files to attach them to this task
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

            {!attachmentsLoading &&
              attachments &&
              attachments.data.length > 0 && (
                <div className="space-y-2">
                  {attachments.data.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="text-muted-foreground size-4" />
                        <div>
                          <p className="font-medium">{attachment.fileName}</p>
                          <p className="text-muted-foreground text-sm">
                            {(attachment.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
