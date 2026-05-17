import { createMiddleware } from "hono/factory";

import { auth } from "@/core/auth";
import type { HonoEnv } from "@/core/hono-env";
import { resolveApiLogger } from "@/core/logger";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  const log = resolveApiLogger(c.var.logger);

  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    log.warn("Unauthenticated request to protected route");
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", { ...session.user, role: session.user.role ?? "user" });
  c.set("session", session.session);

  await next();
});

export const roleMiddleware = (roles: string[]) =>
  createMiddleware<HonoEnv>(async (c, next) => {
    const user = c.get("user");
    const log = resolveApiLogger(c.var.logger);

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (!roles.includes(user.role)) {
      log.warn(
        { userId: user.id, role: user.role, requiredRoles: roles },
        "Forbidden: insufficient role",
      );
      return c.json({ error: "Forbidden" }, 403);
    }

    await next();
  });
