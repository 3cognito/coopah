import "reflect-metadata";
import Koa from "koa";
import { Configs, validateConfigs } from "./src/packages/configs";
import { connectDB } from "./src/packages/db";
import bodyParser from "koa-bodyparser";

const app = new Koa();
app.use(bodyParser());

const port = Configs.PORT || 3412;
app.listen(port, async () => {
  await initializeAppDependencies();
  console.log(`🚀 Server is running on port ${port}`);
});

async function initializeAppDependencies() {
  validateConfigs();
  await connectDB();
}
