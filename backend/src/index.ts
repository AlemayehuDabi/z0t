import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRouter from './routes/auth.route';
import promptRoute from './routes/prompt.route';
import { auth } from '../libs/auth';
import { requireAuth } from './middleware/auth.guard';

// later for production
// import { serve } from 'inngest/hono';
// import { inngest } from './inngest';
// import { functions } from './inngest/functions';

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

app.use(
  '*',
  cors({
    origin: ['*', 'http://localhost:3000', 'http://localhost:5173'], // replace with your origin
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
);

// Set up the "/api/inngest" (recommended) routes with the serve handler
// later in the production
// app.use('/api/inngest', serve({ client: inngest, functions }));

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  console.log('session', session);
  if (!session) {
    c.set('user', null);
    c.set('session', null);
  } else {
    c.set('user', session.user);
    c.set('session', session.session);
  }
  await next();
});

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

// better auth
app.route('/api/auth/*', authRouter);

// rpc only
const rpc =
  // protected route
  app.use('/api/generate/*', requireAuth).route('/api/generate', promptRoute);

export type AppType = typeof rpc;

export default app;
