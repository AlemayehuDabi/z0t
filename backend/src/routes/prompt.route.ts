import { Hono } from 'hono';
import { createPrompt } from '../services';

const app = new Hono();

const promptRoute = app.post('/', async (c) => {
  return createPrompt(c); // streaming logic must live inside createPrompt
});

export default promptRoute;
