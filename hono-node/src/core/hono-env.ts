import type { Env } from "hono";
import type { Logger } from "pino";

import type { auth } from "@/core/auth";

type Session = typeof auth.$Infer.Session;

export interface HonoEnv extends Env {
  Variables: {
    logger: Logger;
    user: Session["user"] & { role: string };
    session: Session["session"];
  };
}
