// Servicio de Carrito - Lógica de Negocio
const cartRepository = require("../repositories/cart.repository");
const productRepository = require("../repositories/product.repository");
const ticketRepository = require("../repositories/ticket.repository");
const CartDTO = require("../dto/cart.dto");
const TicketDTO = require("../dto/ticket.dto");

class CartService {
  async getCartByUser(userId) {
    let cart = await cartRepository.getOrCreateCart(userId);
    return CartDTO.fromCart(cart);
  }

  async getCartById(cartId) {
    const cart = await cartRepository.getCartById(cartId);
    return CartDTO.fromCart(cart);
  }

  async addProduct(cartId, productId, quantity, user) {
    const cart = await cartRepository.getCartById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    if (cart.user.toString() !== user._id.toString()) {
      throw new Error("No puedes modificar este carrito");
    }

    // Usuario premium no puede agregar su propio producto
    if (user.role === "premium") {
      const product = await productRepository.getProductById(productId);
      if (product && product.owner?.toString() === user._id.toString()) {
        throw new Error("No puedes agregar tu propio producto al carrito");
      }
    }

    const updatedCart = await cartRepository.addProductToCart(
      cartId,
      productId,
      quantity
    );
    return CartDTO.fromCart(updatedCart);
  }

  async updateProductQuantity(cartId, productId, quantity, user) {
    const cart = await cartRepository.getCartById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    if (cart.user.toString() !== user._id.toString()) {
      throw new Error("No puedes modificar este carrito");
    }

    const updatedCart = await cartRepository.updateProductQuantity(
      cartId,
      productId,
      quantity
    );
    return CartDTO.fromCart(updatedCart);
  }

  async removeProduct(cartId, productId, user) {
    const cart = await cartRepository.getCartById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    if (cart.user.toString() !== user._id.toString()) {
      throw new Error("No puedes modificar este carrito");
    }

    const updatedCart = await cartRepository.removeProductFromCart(
      cartId,
      productId
    );
    return CartDTO.fromCart(updatedCart);
  }

  async clearCart(cartId, user) {
    const cart = await cartRepository.getCartById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    if (cart.user.toString() !== user._id.toString()) {
      throw new Error("No puedes modificar este carrito");
    }

    const updatedCart = await cartRepository.clearCart(cartId);
    return CartDTO.fromCart(updatedCart);
  }

  // Procesa la compra: verifica stock, genera ticket, actualiza inventario
  async processPurchase(cartId, user) {
    const cart = await cartRepository.getCartById(cartId);
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }

    if (cart.user.toString() !== user._id.toString()) {
      throw new Error("No puedes realizar esta compra");
    }

    if (cart.products.length === 0) {
      throw new Error("El carrito está vacío");
    }

    const productsNotProcessed = [];
    const productsProcessed = [];
    let totalAmount = 0;

    for (const item of cart.products) {
      const product = await productRepository.getProductById(
        item.product._id || item.product
      );

      if (!product || product.stock < item.quantity) {
        productsNotProcessed.push(item.product._id || item.product);
      } else {
        await productRepository.updateStock(product._id, item.quantity);

        productsProcessed.push({
          product: product._id,
          title: product.title,
          quantity: item.quantity,
          price: product.price,
        });

        totalAmount += product.price * item.quantity;
      }
    }

    if (productsProcessed.length === 0) {
      return {
        success: false,
        message: "No se pudo procesar ningún producto por falta de stock",
        productsNotProcessed,
      };
    }

    const ticket = await ticketRepository.createTicket(
      user.email,
      totalAmount,
      productsProcessed
    );

    // Dejar en carrito los productos sin stock
    cart.products = cart.products.filter((item) =>
      productsNotProcessed.includes(
        (item.product._id || item.product).toString()
      )
    );
    cart.totalAmount = cart.products.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    await cart.save();

    return {
      success: true,
      ticket: TicketDTO.fromTicket(ticket),
      productsNotProcessed:
        productsNotProcessed.length > 0 ? productsNotProcessed : null,
      message:
        productsNotProcessed.length > 0
          ? "Compra parcial: algunos productos no tenían stock suficiente"
          : "Compra completada exitosamente",
    };
  }

  async getCartSummary(userId) {
    const cart = await cartRepository.getCartByUser(userId);
    if (!cart) {
      return { itemCount: 0, totalAmount: 0 };
    }

    const cartDTO = CartDTO.fromCart(cart);
    return cartDTO.toSummary();
  }
}

module.exports = new CartService();
