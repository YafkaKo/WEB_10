import bcrypt from "bcrypt";
import User from "./user.model.js";

export const generateSalt = async () => {
  return await bcrypt.genSalt(10);
};

export const generateHashWithSalt = async (password, salt) => {
  if (!password || password.length < 6) {
    throw new Error("Пароль должен содержать минимум 6 символов");
  }
  return await bcrypt.hash(password, salt);
};

export const createUser = async (username, password, email, role = "user") => {
  if (!username || !password || !email) {
    throw new Error("Имя пользователя и пароль обязательны");
  }

  try {
    const salt = await generateSalt();
    const hashedPassword = await generateHashWithSalt(password, salt);
    const user = await User.create({
      username,
      password: hashedPassword,
      email,
      role,
      salt,
    });
    return user;
  } catch (error) {
    console.error("Ошибка создания пользователя:", {
      username,
      email,
      error: error.message,
    });
    throw error;
  }
};

export const validateUser = async (username, password) => {
  if (!username || !password) {
    throw { statusCode: 400, message: "Имя пользователя и пароль обязательны" };
  }

  const user = await User.findOne({ where: { username } });
  if (!user) return false;

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return false;

  return user;
};

export const getUserById = async (id) => {
  return await User.findByPk(id);
};

export const updateUser = async (id, data) => {
  const user = await User.findByPk(id);
  if (!user) {
    throw { statusCode: 404, message: "Пользователь не найден" };
  }

  if (data.password) {
    const salt = await generateSalt();
    data.password = await generateHashWithSalt(data.password, salt);
    data.salt = salt;
  }

  return await user.update(data);
};

export const deleteUser = async (id) => {
  const deleted = await User.destroy({ where: { id } });
  if (!deleted) {
    throw { statusCode: 404, message: "Пользователь не найден" };
  }
  return true;
};
