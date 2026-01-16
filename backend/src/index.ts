import { Hono } from 'hono'
import {cors} from "hono/cors"
import authRouter from './routes/auth';

const app = new Hono()

app.use(
	cors({
		origin: ["http://localhost:3000", "http://localhost:5173"], // replace with your origin
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

app.route("/api/auth/*", authRouter)


export default app
