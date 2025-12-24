const User = require("../models/User");

class UserDAO {
  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
  }

  async findAll() {
    return await User.find({});
  }

  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async findByResetToken(token) {
    return await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
  }
}

module.exports = new UserDAO();
