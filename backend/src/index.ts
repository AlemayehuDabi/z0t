import { Hono } from 'hono'
import {cors} from "hono/cors"
import authRouter from './routes/auth';

const app = new Hono()

app.use(
	"*", // or replace with "*" to enable cors for all routes
	cors({
		origin: "http://localhost:3001", // replace with your origin
		allowHeaders: ["Content-Type", "Authorization"],
		allowMethods: ["POST", "GET", "OPTIONS"],
		exposeHeaders: ["Content-Length"],
		maxAge: 600,
		credentials: true,
	}),
);

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

const route = app.route("/api/auth/*", authRouter)


export default app
