import { Hono } from 'hono'
import {cors} from "hono/cors"
import authRouter from './routes/auth.route';
import promptRoute from './routes/prompt.route';
import { auth } from '../libs/auth';
import { requireAuth } from './middleware/auth.guard';


const app = new Hono<{
	Variables: {
		user: typeof auth.$Infer.Session.user | null;
		session: typeof auth.$Infer.Session.session | null
	}
}>()

app.use("*",
	cors({
		origin: ["*", "http://localhost:3000", "http://localhost:5173"], // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	console.log("session", session)
	if (!session) {
    	c.set("user", null);
    	c.set("session", null);
  	} else {
        c.set("user", session.user);
        c.set("session", session.session);
    }
  	await next();
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("/api/auth/*", authRouter)

// protected route
// app.use("/api/prompt/*", requireAuth)
app.route("/api/prompt", promptRoute)

export default app
