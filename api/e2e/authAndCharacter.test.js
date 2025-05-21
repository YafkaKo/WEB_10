import request from "supertest";
import { faker } from "@faker-js/faker";
import { fastify } from "../src/server.js";
import { sequelize } from "../src/database/database.service.js";
import { createUser } from "../src/user/user.service.js";
import { jest } from "@jest/globals";
import { RedisProvider } from "../src/redis/redis.service.js";

const redis = RedisProvider.getClient()
// Мокаем redis
jest.unstable_mockModule("../src/redis/redis.service.js", () => ({
  redis: {
    sadd: jest.fn().mockResolvedValue(1),
    srem: jest.fn().mockResolvedValue(1),
    del: jest.fn().mockResolvedValue(1),
    smembers: jest.fn().mockResolvedValue(["mocked_token"]),
    expire: jest.fn().mockResolvedValue(1),
    scan: jest.fn().mockResolvedValue(["0", []]),
  },
}));

// Мокаем AmpqProvider
jest.unstable_mockModule("../src/ampq/ampq.service.js", () => ({
  AmpqProvider: {
    sendEventToTheQueue: jest.fn().mockResolvedValue({ error: null, data: {} }),
  },
}));

describe("Тестирование аутентификации и управления персонажами", () => {
  let testCharacter;
  let authCookiesAdmin;
  let testUserAdmin;

  beforeAll(async () => {
    await fastify.ready();

    testUserAdmin = {
      username: faker.internet.username().substring(0, 15),
      password: faker.internet.password(12),
      email: faker.internet.email(),
      role: "admin",
    };

    await sequelize.sync({ force: true });

    // Создаем пользователя

    // Данные для создания персонажа
    testCharacter = {
      name: faker.person.firstName(),
      avatar: faker.image.avatar(),
      description: faker.lorem.paragraph(),
      character: faker.lorem.words(10),
      hobbies: faker.lorem.words(5),
      favoritePhrases: [faker.lorem.sentence(), faker.lorem.sentence()],
      friends: [faker.person.firstName(), faker.person.firstName()],
    };
  });

  afterAll(async () => {
    // await sequelize.query("TRUNCATE TABLE users, characters CASCADE;");
    // await sequelize.close();
    await fastify.close(); // Закрываем сервер
  });

  beforeEach(async () => {
    await sequelize.sync({ force: true });

        await createUser(
      testUserAdmin.username,
      testUserAdmin.password,
      testUserAdmin.email,
      testUserAdmin.role
    );

    // Логинимся для получения сессии
    const loginResponseAdmin = await request(fastify.server)
      .post("/api/auth/login")
      .send({
        username: testUserAdmin.username,
        password: testUserAdmin.password,
      });
    authCookiesAdmin = loginResponseAdmin.header["set-cookie"];
  });

  // Тестируем регистрацию, логин и создание персонажа
  it("Регистрация, логин и создание персонажа (админ)", async () => {
    // Регистрация пользователя (если это нужно для теста)
    const testUserReg = {
      username: faker.internet.username(),
      password: faker.internet.password(),
      email: faker.internet.email(),
    };
    const registerResponse = await request(fastify.server)
      .post("/api/auth/register")
      .send(testUserReg)
      .expect(200);
    expect(registerResponse.body).toHaveProperty("message");

    // Пытаемся войти в систему
    const loginResponse = await request(fastify.server)
      .post("/api/auth/login")
      .send({
        username: testUserReg.username,
        password: testUserReg.password,
      })
      .expect(200);
    const authCookies = loginResponse.headers["set-cookie"];
    expect(authCookies).toBeDefined();

    // Пытаемся создать персонажа как администратор
    const createCharacterResponse = await request(fastify.server)
      .post("/api/characters")
      .set("Cookie", authCookiesAdmin) // Используем cookies администратора
      .send(testCharacter)
      .expect(201);
    expect(createCharacterResponse.body).toMatchObject(testCharacter);

    // Проверяем, что персонаж добавлен
    const getCharactersResponse = await request(fastify.server)
      .get("/api/characters")
      .set("Cookie", authCookiesAdmin) // Используем cookies администратора
      .expect(200);
    expect(getCharactersResponse.body.data).toHaveLength(1);
    expect(getCharactersResponse.body.pagination.totalItems).toBe(1);
  });

  it("Ошибка при неверном пароле при логине", async () => {
    const loginResponse = await request(fastify.server)
      .post("/api/auth/login")
      .send({
        username: testUserAdmin.username,
        password: "wrong_password",
      })
      .expect(401);

    expect(loginResponse.body.message).toContain("Неверные учетные данные");
  });

  // Тестируем завершение сессии
  it("Завершение текущей сессии", async () => {
    const userId = 1; // Получать из ответа регистрации/логина
    await request(fastify.server)
      .post(`/api/auth/logout/${userId}`)
      .set("Cookie", authCookiesAdmin)
      .expect(200);
  });

  it("Завершение всех сессий", async () => {
    await request(fastify.server)
      .post("/api/auth/logout/all")
      .set("Cookie", authCookiesAdmin)
      .expect(200);
  });
});
