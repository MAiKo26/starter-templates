import { createEnv } from "@t3-oss/env-core"
import { z } from "zod"

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_URL: z.url(),
    VITE_APP_NAME: z.string().min(1).default("TanStack App"),
    VITE_APP_ENV: z
      .enum(["development", "staging", "production"])
      .default("development"),
    VITE_APP_VERSION: z.string().default("0.0.0"),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
