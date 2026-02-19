import { Hono } from 'hono';
import { createPrompt } from '../services';

const app = new Hono();

const promptRoute = app.post('/', async (c) => {
  const prompt = await createPrompt(c);

  console.log();

  return c.json({
    prompt,
  });
});

export default promptRoute;
