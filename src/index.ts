import { Elysia, t } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { dataRoutes } from "./routes/data";

const app = new Elysia()
  .use(swagger())
  .get("/", () => "Hello Elysia")
  .get("/user/:id", ({ params: { id } }) => id, {
    params: t.Object({
      id: t.Numeric(),
    }),
  })
  .use(dataRoutes)
  .listen(3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
export type App = typeof app;
