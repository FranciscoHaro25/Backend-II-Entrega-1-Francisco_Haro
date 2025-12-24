const Cart = require("../models/Cart");

class CartDAO {
  async create(cartData) {
    const cart = new Cart(cartData);
    return await cart.save();
  }

  async findById(id) {
    return await Cart.findById(id).populate("products.product");
  }

  async findByUser(userId) {
    return await Cart.findOne({ user: userId, status: "active" }).populate(
      "products.product"
    );
  }

  async update(id, data) {
    return await Cart.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Cart.findByIdAndDelete(id);
  }

  async addProduct(cartId, productData) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { $push: { products: productData } },
      { new: true }
    );
  }

  async removeProduct(cartId, productId) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { $pull: { products: { product: productId } } },
      { new: true }
    );
  }

  async clearCart(cartId) {
    return await Cart.findByIdAndUpdate(
      cartId,
      { products: [], totalAmount: 0 },
      { new: true }
    );
  }
}

module.exports = new CartDAO();
