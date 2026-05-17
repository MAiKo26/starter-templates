import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { projectService } from "@/services/project-service";
import { db } from "@/db";
import { projects } from "@/db/schema";

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

describe("ProjectService", () => {
  beforeEach(async () => {
    await db.delete(projects);
  });

  afterEach(async () => {
    await db.delete(projects);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a project with all fields", async () => {
      const result = await projectService.create({
        name: "Test Project",
        description: "A test project",
        status: "active",
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe("Test Project");
      expect(result.description).toBe("A test project");
      expect(result.status).toBe("active");
    });

    it("should create a project with default status", async () => {
      const result = await projectService.create({
        name: "Minimal Project",
      });

      expect(result).toBeDefined();
      expect(result.name).toBe("Minimal Project");
      expect(result.status).toBe("active");
    });
  });

  describe("findById", () => {
    it("should find an existing project", async () => {
      const created = await projectService.create({
        name: "Find Me",
      });

      const found = await projectService.findById(created.id);

      expect(found.id).toBe(created.id);
      expect(found.name).toBe("Find Me");
    });

    it("should throw NotFoundError for non-existent project", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      await expect(projectService.findById(nonExistentId)).rejects.toThrow(
        "Project not found",
      );
    });
  });

  describe("list", () => {
    it("should return empty list when no projects exist", async () => {
      const result = await projectService.list({
        limit: 10,
        offset: 0,
      });

      expect(result.items).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it("should return paginated projects", async () => {
      await Promise.all([
        projectService.create({ name: "Project 1" }),
        projectService.create({ name: "Project 2" }),
        projectService.create({ name: "Project 3" }),
      ]);

      const result = await projectService.list({
        limit: 2,
        offset: 0,
      });

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(3);
    });

    it("should filter by search term", async () => {
      await projectService.create({ name: "Annual Report" });
      await projectService.create({ name: "Medical Guide" });

      const result = await projectService.list({
        search: "Report",
        limit: 10,
        offset: 0,
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].name).toBe("Annual Report");
    });
  });

  describe("update", () => {
    it("should update project name", async () => {
      const created = await projectService.create({ name: "Old Name" });

      const updated = await projectService.update(created.id, {
        name: "New Name",
      });

      expect(updated.name).toBe("New Name");
      expect(updated.id).toBe(created.id);
    });

    it("should throw NotFoundError for non-existent project", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      await expect(
        projectService.update(nonExistentId, { name: "New" }),
      ).rejects.toThrow("Project not found");
    });
  });

  describe("delete", () => {
    it("should delete a project", async () => {
      const created = await projectService.create({ name: "Delete Me" });

      const result = await projectService.delete(created.id);

      expect(result).toBe(true);
      await expect(projectService.findById(created.id)).rejects.toThrow(
        "Project not found",
      );
    });

    it("should throw NotFoundError for non-existent project", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      await expect(projectService.delete(nonExistentId)).rejects.toThrow(
        "Project not found",
      );
    });
  });

  describe("healthCheck", () => {
    it("should return true when database is accessible", async () => {
      const result = await projectService.healthCheck();
      expect(result).toBe(true);
    });
  });
});
