import { z } from "zod";

/** Parses env strings like "false" / "true" (z.coerce.boolean() treats "false" as true). */
export const envBoolean = (defaultValue: boolean) =>
  z
    .string()
    .default(defaultValue ? "true" : "false")
    .transform((value) => value === "true" || value === "1");
