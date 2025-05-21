import fastifyCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import Fastify from "fastify";

import "dotenv/config";
import { AmpqProvider } from "./ampq/ampq.service.js";
import queueConfig from "./config/queue.js";

import { seedDatabase, sequelize } from "./database/database.service.js";

import authRoutes, {
  checkSession,
  verifyRole,
} from "./auth/auth.controller.js";
import charactersRoutes from "./controllers/laughariki.controller.js";
import { FileController } from "./file/file.controller.js";

import Character from "./character/laughariki.model.js";
import { appConfig } from "./config/app.js";
import { createUser } from "./user/user.service.js";
import { RedisProvider } from "./redis/redis.service.js";

export const fastify = Fastify({
  logger: true,
});

const instanceId = Math.random().toString(36).slice(2); // Check 10 lab

fastify.register(cors, {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
});
fastify.register(fastifyMultipart);
fastify.register(fastifyCookie, {
  secret: process.env.AUTH_JWT_SECRET,
  hook: "onRequest",
  parseOptions: {}, // options for parsing cookies
});
fastify.register(fastifyJwt, {
  secret: process.env.AUTH_JWT_SECRET,
  decode: { complete: true },
});
fastify.decorate("authenticate", checkSession);
fastify.decorate("verifyRole", verifyRole);

fastify.register(authRoutes, { prefix: "/api/auth" });
fastify.register(charactersRoutes, { prefix: "/api" });

fastify.get("/health", async function handler(request, reply) {
  return { status: "ok", instanceId };
});

fastify.post("/files", FileController.saveFile);
fastify.get("/files/:fileId", FileController.getFile);

try {
  await RedisProvider.connect();
  await sequelize.authenticate();
  if (process.env.NODE_ENV !== "test") {
    await sequelize.sync({ force: false });
    await seedDatabase(Character);
    // await createUser("admin", "admin123", "mail@mail.ru", "admin");
    // await createUser("user", "user123", "user@mail.ru");
  }

  await AmpqProvider.connect(queueConfig);
  await fastify.listen({ port: appConfig.port, host: appConfig.host });

  fastify.log.info(`Сервер запущен на ${fastify.server.address().port}`);
} catch (err) {
  fastify.log.error(err);
  throw err;
}
