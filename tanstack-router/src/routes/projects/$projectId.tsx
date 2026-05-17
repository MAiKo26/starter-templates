import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"

import { ArrowLeft, MoreHorizontal, Paperclip, Plus } from "lucide-react"

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProjectQuery } from "@/hooks/use-project-query"
import { useTaskListQuery } from "@/hooks/use-task-list-query"

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectDetailPage,
})

function ProjectDetailPage() {
  const { projectId } = Route.useParams()
  const navigate = useNavigate()
  const { data: project, isLoading: projectLoading } =
    useProjectQuery(projectId)
  const { data: tasks, isLoading: tasksLoading } = useTaskListQuery(projectId)

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/projects">
              <ArrowLeft className="size-4" data-icon="inline-start" />
            </Link>
          </Button>
          <div className="flex-1">
            {projectLoading ? (
              <Skeleton className="h-8 w-48" />
            ) : (
              <h1 className="text-3xl font-bold tracking-tight">
                {project?.name}
              </h1>
            )}
            {projectLoading ? (
              <Skeleton className="mt-1 h-4 w-64" />
            ) : (
              <p className="text-muted-foreground mt-1">
                {project?.description || "No description"}
              </p>
            )}
          </div>
          {project && (
            <Badge
              variant={
                project.status === "active"
                  ? "default"
                  : project.status === "completed"
                    ? "secondary"
                    : "outline"
              }
            >
              {project.status}
            </Badge>
          )}
        </div>

        <Tabs defaultValue="tasks">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <Button>
              <Plus className="mr-2 size-4" data-icon="inline-start" />
              Add Task
            </Button>
          </div>

          <TabsContent value="tasks" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasks</CardTitle>
                <CardDescription>
                  {tasks?.meta.total ?? 0} tasks in this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                {tasksLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                )}

                {!tasksLoading && (!tasks || tasks.data.length === 0) && (
                  <Empty>
                    <EmptyHeader>
                      <EmptyTitle>No tasks yet</EmptyTitle>
                      <EmptyDescription>
                        Create your first task to get started
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}

                {!tasksLoading && tasks && tasks.data.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Attachments</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tasks.data.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            <Link
                              to="/projects/$projectId/tasks/$taskId"
                              params={{
                                projectId,
                                taskId: task.id,
                              }}
                              className="hover:underline"
                            >
                              {task.title}
                            </Link>
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "No due date"}
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Paperclip className="size-3" />0
                            </span>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate({
                                      to: "/projects/$projectId/tasks/$taskId",
                                      params: { projectId, taskId: task.id },
                                    })
                                  }
                                >
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground text-sm">Name</p>
                    <p className="font-medium">{project?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Status</p>
                    <Badge>{project?.status}</Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Created</p>
                    <p className="font-medium">
                      {project?.createdAt
                        ? new Date(project.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Last Updated
                    </p>
                    <p className="font-medium">
                      {project?.updatedAt
                        ? new Date(project.updatedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-sm">Description</p>
                  <p className="mt-1">
                    {project?.description || "No description provided."}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}
