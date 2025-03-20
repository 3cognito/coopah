import Koa from "koa";
import { Configs, validateConfigs } from "./src/packages/configs";
import { connectDB } from "./src/packages/db";

const app = new Koa();

const port = Configs.PORT || 3412;
app.listen(port, async () => {
  await initializeAppDependencies();
  console.log(`🚀 Server is running on port ${port}`);
});

async function initializeAppDependencies() {
  validateConfigs();
  await connectDB();
}
