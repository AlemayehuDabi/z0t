import app from "./index";

const port = Number(process.env.PORT) || 8787;

console.log(`🚀 Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};