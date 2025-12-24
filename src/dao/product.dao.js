const Product = require("../models/Product");

class ProductDAO {
  async create(productData) {
    const product = new Product(productData);
    return await product.save();
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async findByCode(code) {
    return await Product.findOne({ code: code.toUpperCase() });
  }

  async findAll(filter = {}, options = {}) {
    const { limit = 10, page = 1, sort } = options;
    const skip = (page - 1) * limit;

    let query = Product.find(filter);

    if (sort) {
      query = query.sort(sort);
    }

    // Usar .lean() para obtener objetos planos en lugar de documentos Mongoose
    return await query.skip(skip).limit(limit).lean();
  }

  async update(id, data) {
    return await Product.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Product.findByIdAndDelete(id);
  }

  async countDocuments(filter = {}) {
    return await Product.countDocuments(filter);
  }

  async updateStock(id, quantity) {
    return await Product.findByIdAndUpdate(
      id,
      { $inc: { stock: -quantity } },
      { new: true }
    );
  }
}

module.exports = new ProductDAO();
