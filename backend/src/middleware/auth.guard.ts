import { Context, Next } from "hono";

export const requireAuth = async (c: Context, next: Next) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!user || !session) {
    return c.json({ 
      error: "Unauthorized", 
      message: "You must be logged in to access this resource." 
    }, 401);
  }

  await next();
};