import { Hono } from 'hono';
import { createPrompt } from '../services';

const app = new Hono();

const promptRoute = app.post('/', async (c) => {
  const data = await c.req.json();
  console.log('prompt data', data);
  const prompt = createPrompt(c);
  return c.json({
    data: data,
  });
});

export default promptRoute;
