import { randomUUID } from "node:crypto";

import { and, count, eq } from "drizzle-orm";

import { NotFoundError } from "@/core/errors/not-found-error";
import { resolveApiLogger } from "@/core/logger";
import { buildPaginationMeta } from "@/core/pagination";
import { db } from "@/db";
import { type NewTask, type Task, tasks } from "@/db/schema";

interface ListParams {
  projectId: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  limit: number;
  offset: number;
}

interface CreateParams {
  projectId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
}

interface UpdateParams {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const taskService = {
  async list({
    projectId,
    status: statusFilter,
    priority: priorityFilter,
    assigneeId,
    limit,
    offset,
  }: ListParams) {
    const logger = resolveApiLogger();
    logger.debug({ projectId, statusFilter, limit, offset }, "Listing tasks");

    const conditions: ReturnType<typeof eq>[] = [
      eq(tasks.projectId, projectId),
    ];
    if (statusFilter) conditions.push(eq(tasks.status, statusFilter));
    if (priorityFilter) conditions.push(eq(tasks.priority, priorityFilter));
    if (assigneeId) conditions.push(eq(tasks.assigneeId, assigneeId));
    const where = and(...conditions);

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(tasks)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(tasks.createdAt),
      db.select({ count: count() }).from(tasks).where(where),
    ]);

    return {
      items,
      meta: buildPaginationMeta(totalResult[0].count, limit, offset),
    };
  },

  async findById(id: string): Promise<Task> {
    const logger = resolveApiLogger();
    logger.debug({ id }, "Finding task by ID");

    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("Task");
    }

    return result[0];
  },

  async create(params: CreateParams): Promise<Task> {
    const logger = resolveApiLogger();
    logger.info(
      { title: params.title, projectId: params.projectId },
      "Creating task",
    );

    const newTask: NewTask = {
      id: randomUUID(),
      projectId: params.projectId,
      title: params.title,
      description: params.description,
      status: params.status ?? "todo",
      priority: params.priority ?? "medium",
      assigneeId: params.assigneeId ?? null,
      dueDate: params.dueDate ? new Date(params.dueDate) : null,
    };

    const result = await db.insert(tasks).values(newTask).returning();
    return result[0];
  },

  async update(id: string, params: UpdateParams): Promise<Task> {
    const logger = resolveApiLogger();
    logger.info({ id, ...params }, "Updating task");

    await this.findById(id);

    const updates: Partial<NewTask> = {};
    if (params.title !== undefined) updates.title = params.title;
    if (params.description !== undefined)
      updates.description = params.description;
    if (params.status !== undefined) updates.status = params.status;
    if (params.priority !== undefined) updates.priority = params.priority;
    if (params.assigneeId !== undefined) updates.assigneeId = params.assigneeId;
    if (params.dueDate !== undefined) {
      updates.dueDate = params.dueDate ? new Date(params.dueDate) : null;
    }

    const result = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();

    return result[0];
  },

  async delete(id: string): Promise<boolean> {
    const logger = resolveApiLogger();
    logger.info({ id }, "Deleting task");

    await this.findById(id);

    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();

    return result.length > 0;
  },
};
