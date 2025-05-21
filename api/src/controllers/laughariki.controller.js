import Character from "../character/laughariki.model.js";
import handleError from "../utils/errorHandler.js";
import {
  characterPatchSchema,
  characterSchema,
} from "../validate/character.validator.js";

const postCharactersHandler = async (request, reply) => {
  try {
    const character = await Character.create(request.body);
    return reply.status(201).send(character);
  } catch (error) {
    handleError(error, reply);
  }
};

const deleteCharactersHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const deleted = await Character.destroy({
      where: { id },
    });

    if (!deleted) {
      throw { statusCode: 404, message: "Ресурс не найден" };
    }

    return reply.status(204).send();
  } catch (error) {
    handleError(error, reply);
  }
};

const putCharactersHandler = async (request, reply) => {
  try {
    const { id } = request.params;
    const [updated] = await Character.update(request.body, {
      where: { id },
    });

    if (!updated) {
      throw { statusCode: 404, message: "Ресурс не найден" };
    }

    const updatedCharacter = await Character.findByPk(id);
    return reply.status(200).send(updatedCharacter);
  } catch (error) {
    handleError(error, reply);
  }
};

const patchCharactersHandler = async (request, reply) => {
  try {
    const { id } = request.params;

    if (Object.keys(request.body).length === 0) {
      throw {
        statusCode: 400,
        message: "Необходимо указать хотя бы одно поле для обновления",
      };
    }

    const [updated] = await Character.update(request.body, {
      where: { id },
    });

    if (!updated) {
      throw { statusCode: 404, message: "Ресурс не найден" };
    }

    const updatedCharacter = await Character.findByPk(id);
    return reply.status(200).send(updatedCharacter);
  } catch (error) {
    handleError(error, reply);
  }
};

const getCharactersHandler = async (request, reply) => {
  try {
    const page = parseInt(request.query.page, 10) || 1;
    const limit = parseInt(request.query.limit, 10) || 5;

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      throw { statusCode: 400, message: "Невалидные параметры пагинации" };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Character.findAndCountAll({
      limit,
      offset,
      order: [["id", "ASC"]],
    });

    return reply.status(200).send({
      data: rows,
      pagination: {
        totalItems: count,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.log(error);
    handleError(error, reply);
    throw error;
  }
};

export default async function charactersRoutes(fastify) {
  fastify.post(
    "/characters",
    {
      schema: {
        body: characterSchema,
      },
      preHandler: [fastify.authenticate, fastify.verifyRole("admin")],
    },
    postCharactersHandler
  );
  fastify.get(
    "/characters",
    { preHandler: fastify.authenticate },
    getCharactersHandler
  );
  fastify.put(
    "/characters/:id",
    {
      schema: {
        body: characterSchema,
      },
      preHandler: [fastify.authenticate, fastify.verifyRole("admin")],
    },
    putCharactersHandler
  );
  fastify.patch(
    "/characters/:id",
    {
      schema: {
        body: characterPatchSchema,
      },
      preHandler: [fastify.authenticate, fastify.verifyRole("admin")],
    },
    patchCharactersHandler
  );
  fastify.delete(
    "/characters/:id",
    {
      preHandler: [fastify.authenticate, fastify.verifyRole("admin")],
    },
    deleteCharactersHandler
  );
}
