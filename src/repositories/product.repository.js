const productDAO = require("../dao/product.dao");

class ProductRepository {
  async createProduct(productData) {
    const existingProduct = await productDAO.findByCode(productData.code);
    if (existingProduct) {
      throw new Error("Ya existe un producto con ese código");
    }
    return await productDAO.create(productData);
  }

  async getProductById(id) {
    return await productDAO.findById(id);
  }

  async getProductByCode(code) {
    return await productDAO.findByCode(code);
  }

  async getAllProducts(filter = {}, options = {}) {
    return await productDAO.findAll(filter, options);
  }

  async updateProduct(id, data) {
    const product = await productDAO.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return await productDAO.update(id, data);
  }

  async deleteProduct(id) {
    const product = await productDAO.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return await productDAO.delete(id);
  }

  async countProducts(filter = {}) {
    return await productDAO.countDocuments(filter);
  }

  async checkStock(id, quantity) {
    const product = await productDAO.findById(id);
    if (!product) {
      throw new Error("Producto no encontrado");
    }
    return product.stock >= quantity;
  }

  async updateStock(id, quantity) {
    return await productDAO.updateStock(id, quantity);
  }
}

module.exports = new ProductRepository();
