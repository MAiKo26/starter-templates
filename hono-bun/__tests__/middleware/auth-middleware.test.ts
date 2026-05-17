import { describe, it, expect } from "vitest";
import { authMiddleware, roleMiddleware } from "@/middleware/auth-middleware";

describe("auth-middleware", () => {
  it("should export authMiddleware", () => {
    expect(authMiddleware).toBeDefined();
  });

  it("should export roleMiddleware as a function", () => {
    expect(roleMiddleware).toBeDefined();
    expect(typeof roleMiddleware).toBe("function");
  });

  it("should create role middleware with specified roles", () => {
    const middleware = roleMiddleware(["admin"]);
    expect(middleware).toBeDefined();
  });
});
