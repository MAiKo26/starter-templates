import { describe, it, expect } from "vitest";
import { buildPaginationMeta } from "@/core/pagination";

describe("pagination", () => {
  it("should build pagination meta", () => {
    const meta = buildPaginationMeta(100, 20, 0);
    expect(meta.total).toBe(100);
    expect(meta.limit).toBe(20);
    expect(meta.offset).toBe(0);
  });

  it("should handle zero results", () => {
    const meta = buildPaginationMeta(0, 20, 0);
    expect(meta.total).toBe(0);
  });

  it("should handle non-zero offset", () => {
    const meta = buildPaginationMeta(50, 10, 20);
    expect(meta.offset).toBe(20);
    expect(meta.limit).toBe(10);
  });
});
