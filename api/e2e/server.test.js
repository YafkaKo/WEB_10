import { fastify } from "../src/server.js";

describe("Тестирование служебных роутов", () => {
  afterAll(async () => {
    await fastify.close();

  });

  beforeAll(async () => {
     try {
        await fastify.ready();
  } catch (err) {
    console.error('Ошибка запуска сервера:', err);
    throw err;
  }
  });

  it("Health check", async () => {

    const response = await fastify.inject({
      method: "GET",
      url: "/health",
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe(
      "application/json; charset=utf-8"
    );
    expect(response.json()).toEqual({
      status: expect.stringMatching("ok"),
      instanceId: expect.any(String),
    });
  });
});
