import { RedisProvider} from "../redis/redis.service.js";
import { createVerifier } from "fast-jwt";
import "dotenv/config";
import { AmpqProvider } from "../ampq/ampq.service.js";

export class AuthService {
  static async register(username, password) {
    const { error, data: result } = await AmpqProvider.sendEventToTheQueue(
      "greetings",
      { username, password }
    );

    // Type your old code
  }
}

const SESSION_PREFIX = "token_";
const SESSION_TTL = 60 * 60; // 1 час в секундах

export const addSession = async (userId, token) => {
  const key = `${SESSION_PREFIX}${userId}`;
  await RedisProvider.getClient().sadd(key, token);
  await RedisProvider.getClient().expire(key, SESSION_TTL);
};

export const removeSession = async (userId, token) => {
  await RedisProvider.getClient().srem(`${SESSION_PREFIX}${userId}`, token);
};

export const removeAllSessions = async () => {
  let cursor = "0";
  do {
    const result = await RedisProvider.getClient().scan(cursor, "MATCH", `${SESSION_PREFIX}*`);
    cursor = result[0];
    if (result[1].length > 0) {
      await RedisProvider.getClient().del(...result[1]);
    }
  } while (cursor !== "0");
};

export const isValidSession = async (cookieName, token) => {
  try {
    // await printAllRedisProvider.getClient()Data(
    const verifySync = createVerifier({
      key: process.env.AUTH_JWT_SECRET,
    });
    const { iat, exp, ...payload } = verifySync(token);
    const existingToken = await RedisProvider.getClient().smembers(cookieName);

    if (token !== existingToken[0] && existingToken.length < 3) {
      return { error: "Invalid token", payload: null };
    }
    return { error: null, payload };
  } catch (error) {
    return { error, payload: null };
  }
};
