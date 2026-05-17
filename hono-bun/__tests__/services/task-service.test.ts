import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { taskService } from "@/services/task-service";
import { projectService } from "@/services/project-service";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";

vi.mock("@/core/s3-client", () => ({
  s3Client: {
    bucketExists: vi.fn().mockResolvedValue(true),
    presignedPutObject: vi.fn().mockResolvedValue("https://example.com/upload"),
    presignedGetObject: vi.fn().mockResolvedValue("https://example.com/download"),
  },
  initializeBuckets: vi.fn().mockResolvedValue(undefined),
  ensureBucketExists: vi.fn().mockResolvedValue(undefined),
  getPresignedUrl: vi.fn().mockResolvedValue("https://example.com/download"),
  getPresignedPutUrl: vi.fn().mockResolvedValue("https://example.com/upload"),
}));

describe("TaskService", () => {
  let projectId: string;

  beforeEach(async () => {
    await db.delete(tasks);
    await db.delete(projects);
    const project = await projectService.create({ name: "Test Project" });
    projectId = project.id;
  });

  afterEach(async () => {
    await db.delete(tasks);
    await db.delete(projects);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a task with all fields", async () => {
      const result = await taskService.create({
        projectId,
        title: "Test Task",
        description: "A test task",
        status: "todo",
        priority: "high",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe("Test Task");
      expect(result.projectId).toBe(projectId);
      expect(result.status).toBe("todo");
      expect(result.priority).toBe("high");
    });
  });

  describe("findById", () => {
    it("should find an existing task", async () => {
      const created = await taskService.create({
        projectId,
        title: "Find Me",
      });

      const found = await taskService.findById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.title).toBe("Find Me");
    });

    it("should throw NotFoundError for non-existent task", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      await expect(taskService.findById(nonExistentId)).rejects.toThrow(
        "Task not found",
      );
    });
  });

  describe("list", () => {
    it("should return empty list when no tasks exist", async () => {
      const result = await taskService.list({
        projectId,
        limit: 10,
        offset: 0,
      });

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it("should return paginated tasks", async () => {
      await Promise.all([
        taskService.create({ projectId, title: "Task 1" }),
        taskService.create({ projectId, title: "Task 2" }),
      ]);

      const result = await taskService.list({
        projectId,
        limit: 1,
        offset: 0,
      });

      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(2);
    });
  });

  describe("update", () => {
    it("should update task status", async () => {
      const created = await taskService.create({
        projectId,
        title: "Update Me",
        status: "todo",
      });

      const updated = await taskService.update(created.id, {
        status: "done",
      });

      expect(updated.status).toBe("done");
    });
  });

  describe("delete", () => {
    it("should delete a task", async () => {
      const created = await taskService.create({
        projectId,
        title: "Delete Me",
      });

      const result = await taskService.delete(created.id);

      expect(result).toBe(true);
      await expect(taskService.findById(created.id)).rejects.toThrow(
        "Task not found",
      );
    });
  });
});
