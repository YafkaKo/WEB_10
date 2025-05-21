import * as UserService from "../user/user.service.js";
// import * as AuthService from '../services/auth.service.js';
import "dotenv/config";
import { AmpqProvider } from "../ampq/ampq.service.js";
import handleError from "../utils/errorHandler.js";
import * as AuthSession from "./auth.service.js";

const setTokenCookie = (reply, token, id) => {
  reply.setCookie(`token_${id}`, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60, // 1 час в секундах
  });
};

const registerHandler = async (request, reply) => {
  const { username, password, email } = request.body; // Добавляем email

  try {
    if (!username || !password || !email) {
      throw {
        statusCode: 400,
        message: "Имя пользователя, пароль и email обязательны",
      };
    }

    const user = await UserService.createUser(username, password, email); // Модифицируем createUser
    const token = request.server.jwt.sign({
      id: user.id,
      role: user.role,
    });

    // Сохраняем сессию в Redis
    await AuthSession.addSession(user.id, token);

    setTokenCookie(reply, token, user.id);

    // Отправляем данные в RabbitMQ для отправки приветственного письма
    await AmpqProvider.sendEventToTheQueue("greetings", {
      username: user.username,
      email: user.email, // Добавляем email в сообщение
      userId: user.id,
    });

    return { message: "Регистрация прошла успешно" };
  } catch (error) {
    // console.log(error.name)
    if (
      error.name === "SequelizeUniqueConstraintError" ||
      error.details[0].message === "email must be unique" ||
      error.details[0].message === "username must be unique"
    ) {
      return reply
        .status(400)
        .send({ error: "Имя пользователя или email уже заняты" });
    }
    handleError(error, reply);
  }
};
const loginHandler = async (request, reply) => {
  const { username, password } = request.body;

  try {
    if (!username || !password) {
      throw {
        statusCode: 400,
        message: "Имя пользователя и пароль обязательны",
      };
    }

    const user = await UserService.validateUser(username, password);
    if (!user) {
      throw { statusCode: 401, message: "Неверные учетные данные" };
    }

    const token = request.server.jwt.sign({
      id: user.id,
      role: user.role,
    });

    // Сохраняем сессию в Redis
    await AuthSession.addSession(user.id, token);

    setTokenCookie(reply, token, user.id);
    return { message: "Вы вошли успешно" };
  } catch (error) {
    handleError(error, reply);
  }
};

const logoutHandler = async (request, reply) => {
  const { id } = request.params;
  const callToken = "token_" + id;
  try {
    const token = request.cookies[callToken];
    if (!token) {
      return reply.status(400).send({ error: "Токен отсутствует" });
    }

    // Верифицируем токен и получаем userId
    const decoded = await request.server.jwt.verify(token);

    // Удаляем конкретную сессию
    await AuthSession.removeSession(decoded.id, token);

    // Очищаем куки для конкретного пользователя
    reply.clearCookie(`token_${decoded.id}`);

    return { message: "Вы вышли успешно" };
  } catch (error) {
    handleError(error, reply);
  }
};

const logoutAllHandler = async (request, reply) => {
  try {
    // Удаляем все сессии из Redis
    await AuthSession.removeAllSessions();

    // Очищаем все куки, связанные с активными пользователями
    const cookies = request.cookies;
    const cookieNamesToClear = Object.keys(cookies).filter((name) =>
      name.startsWith("token_")
    );

    for (const cookieName of cookieNamesToClear) {
      reply.clearCookie(cookieName, { path: "/" });
    }

    return { message: "Все пользователи вышли из системы" };
  } catch (error) {
    handleError(error, reply);
  }
};

//TODO

export const checkSession = async (request, reply) => {
  let cookieTokenAndName = Object.entries(request.cookies).find(([name]) =>
    name.startsWith("token_")
  );
  if (cookieTokenAndName === undefined) {
    cookieTokenAndName = [];
    cookieTokenAndName[0] = "token";
    cookieTokenAndName[1] = "Unauthorized";
  }
  const { error, payload } = await AuthSession.isValidSession(
    cookieTokenAndName[0],
    cookieTokenAndName[1]
  );
  request.user = payload;
  request.sessionId = cookieTokenAndName[1];
  if (error !== null) {
    reply.code(403).send({ error: "Unauthorized" });
  }
};

export const verifyRole = (requiredRole) => async (request, reply) => {
  try {
    if (!request.user) {
      await customJwtVerify(request, reply);
    }

    if (request.user.role !== requiredRole) {
      throw new Error("Недостаточно прав");
    }
  } catch (err) {
    reply.code(403).send({
      error: "Запрещено",
      message: err.message,
    });
    throw err;
  }
};

export default async function authRoutes(fastify) {
  fastify.post("/register", registerHandler);
  fastify.post("/login", loginHandler);
  fastify.post("/logout/:id", logoutHandler);
  fastify.post("/logout/all", logoutAllHandler); // Новый эндпоинт
}
