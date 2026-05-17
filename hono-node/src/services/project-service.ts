import { and, count, eq, ilike } from "drizzle-orm";

import { NotFoundError } from "@/core/errors/not-found-error";
import { resolveApiLogger } from "@/core/logger";
import { buildPaginationMeta } from "@/core/pagination";
import { db } from "@/db";
import { type NewProject, type Project, projects } from "@/db/schema";

interface ListParams {
  search?: string;
  status?: string;
  limit: number;
  offset: number;
}

interface CreateParams {
  name: string;
  description?: string;
  status?: string;
  ownerId?: string;
}

interface UpdateParams {
  name?: string;
  description?: string | null;
  status?: string;
}

export const projectService = {
  async list({ search, status: statusFilter, limit, offset }: ListParams) {
    const logger = resolveApiLogger();
    logger.debug({ search, statusFilter, limit, offset }, "Listing projects");

    const conditions: ReturnType<typeof eq>[] = [];
    if (search) {
      conditions.push(ilike(projects.name, `%${search}%`));
    }
    if (statusFilter) {
      conditions.push(eq(projects.status, statusFilter));
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(projects)
        .where(where)
        .limit(limit)
        .offset(offset)
        .orderBy(projects.createdAt),
      db.select({ count: count() }).from(projects).where(where),
    ]);

    return {
      items,
      meta: buildPaginationMeta(totalResult[0].count, limit, offset),
    };
  },

  async findById(id: string): Promise<Project> {
    const logger = resolveApiLogger();
    logger.debug({ id }, "Finding project by ID");

    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    if (result.length === 0) {
      throw new NotFoundError("Project");
    }

    return result[0];
  },

  async create(params: CreateParams): Promise<Project> {
    const logger = resolveApiLogger();
    logger.info({ name: params.name }, "Creating project");

    const newProject: NewProject = {
      name: params.name,
      description: params.description,
      status: params.status ?? "active",
      ownerId: params.ownerId,
    };

    const result = await db.insert(projects).values(newProject).returning();
    return result[0];
  },

  async update(id: string, params: UpdateParams): Promise<Project> {
    const logger = resolveApiLogger();
    logger.info({ id, ...params }, "Updating project");

    await this.findById(id);

    const updates: Partial<NewProject> = {};
    if (params.name !== undefined) updates.name = params.name;
    if (params.description !== undefined)
      updates.description = params.description;
    if (params.status !== undefined) updates.status = params.status;

    const result = await db
      .update(projects)
      .set(updates)
      .where(eq(projects.id, id))
      .returning();

    return result[0];
  },

  async delete(id: string): Promise<boolean> {
    const logger = resolveApiLogger();
    logger.info({ id }, "Deleting project");

    await this.findById(id);

    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning();

    return result.length > 0;
  },

  async healthCheck(): Promise<boolean> {
    try {
      await db.select({ count: count() }).from(projects).limit(1);
      return true;
    } catch {
      return false;
    }
  },
};
