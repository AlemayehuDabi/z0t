import { Hono } from "hono";
import { auth } from "../../libs/auth";

const app = new Hono();

const authRouter = app.on(["POST", "GET"], "", (c) => {
	return auth.handler(c.req.raw);
});

export default authRouter