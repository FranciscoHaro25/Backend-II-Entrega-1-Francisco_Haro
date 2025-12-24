const userDAO = require("../dao/user.dao");
const bcrypt = require("bcrypt");

class UserRepository {
  async createUser(userData) {
    const { email, password } = userData;

    const existingUser = await userDAO.findByEmail(email);
    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    userData.password = hashedPassword;
    userData.email = email.toLowerCase().trim();

    return await userDAO.create(userData);
  }

  async getUserById(id) {
    return await userDAO.findById(id);
  }

  async getUserByEmail(email) {
    return await userDAO.findByEmail(email);
  }

  async getAllUsers() {
    return await userDAO.findAll();
  }

  async updateUser(id, data) {
    return await userDAO.update(id, data);
  }

  async deleteUser(id) {
    return await userDAO.delete(id);
  }

  async validatePassword(user, password) {
    return bcrypt.compareSync(password, user.password);
  }

  async changePassword(userId, newPassword) {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    return await userDAO.update(userId, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });
  }

  async setResetToken(userId, token, expires) {
    return await userDAO.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async findByResetToken(token) {
    return await userDAO.findByResetToken(token);
  }

  async isSamePassword(user, newPassword) {
    return bcrypt.compareSync(newPassword, user.password);
  }
}

module.exports = new UserRepository();
