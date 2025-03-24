import "reflect-metadata";
import Koa from "koa";
import { Configs, validateConfigs } from "./src/packages/configs";
import { connectDB } from "./src/packages/db/db";
import bodyParser from "koa-bodyparser";
import { authRouter, runRouter } from "./src/routes";

const app = new Koa();
app.use(bodyParser());

///configure security middlewares
app.use(authRouter.routes()).use(authRouter.allowedMethods());
app.use(runRouter.routes()).use(runRouter.allowedMethods());

const port = Configs.PORT || 3412;
app.listen(port, async () => {
  await initializeAppDependencies();
  console.log(`🚀 Server is running on port ${port}`);
});

async function initializeAppDependencies() {
  validateConfigs();
  await connectDB();
}
