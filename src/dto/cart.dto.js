// DTO del Carrito
class CartDTO {
  constructor(cart) {
    this._id = cart._id;
    this.user = cart.user;
    this.status = cart.status;
    this.products = cart.products.map((item) => ({
      product: {
        _id: item.product._id,
        title: item.product.title,
        description: item.product.description,
        price: Number(item.product.price).toFixed(2),
        stock: item.product.stock,
        category: item.product.category,
      },
      quantity: item.quantity,
      price: Number(item.price || item.product.price).toFixed(2),
      subtotal: Number(
        (item.price || item.product.price) * item.quantity
      ).toFixed(2),
      addedAt: item.addedAt,
    }));
    this.totalAmount = Number(
      this.products.reduce(
        (total, item) => total + parseFloat(item.subtotal),
        0
      )
    ).toFixed(2);
    this.itemCount = this.products.reduce(
      (count, item) => count + item.quantity,
      0
    );
    this.createdAt = cart.createdAt;
    this.updatedAt = cart.updatedAt;
  }

  static fromCart(cart) {
    if (!cart) return null;
    return new CartDTO(cart);
  }

  static emptyCart(userId) {
    return {
      _id: null,
      user: userId,
      products: [],
      totalAmount: 0,
      itemCount: 0,
      status: "active",
    };
  }

  toSummary() {
    return {
      _id: this._id,
      itemCount: this.itemCount,
      totalAmount: this.totalAmount,
    };
  }
}

module.exports = CartDTO;
