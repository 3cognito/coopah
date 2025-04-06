import "reflect-metadata";
import Koa from "koa";
import { Configs, validateConfigs } from "./src/packages/configs";
import { connectDB } from "./src/packages/db";
import bodyParser from "koa-bodyparser";
import { authRouter, runRouter } from "./src/routes";
import { connectRedis } from "./src/packages/db";
import { healthRoute } from "./src/routes/health";
import { handleError } from "./src/packages/response/response";
import { NotFoundError } from "./src/errors";

const app = new Koa();
app.use(bodyParser());

///configure security middlewares
app.use(healthRoute.routes()).use(healthRoute.allowedMethods());
app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(runRouter.routes()).use(runRouter.allowedMethods());

app.use(async (ctx) => {
  const error = new NotFoundError("Route not found");
  handleError(ctx, error);
});

const port = Configs.PORT || 3412;
app.listen(port, async () => {
  await initializeAppDependencies();
  console.log(`🚀 Server is running on port ${port}`);
});

async function initializeAppDependencies() {
  validateConfigs();
  await connectRedis();
  await connectDB();
}
