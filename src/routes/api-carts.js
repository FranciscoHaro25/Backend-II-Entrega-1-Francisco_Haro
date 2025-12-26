const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  isUser,
  isAdminOrUser,
  canBuy,
  isUserOrPremium,
} = require("../middleware/authorization");
const cartRepository = require("../repositories/cart.repository");
const productRepository = require("../repositories/product.repository");
const ticketRepository = require("../repositories/ticket.repository");
const {
  sendPurchaseConfirmation,
  sendLowStockAlert,
} = require("../services/mail.service");
const TicketDTO = require("../dto/ticket.dto");

// Umbral para considerar stock bajo
const LOW_STOCK_THRESHOLD = 10;

// GET /api/carts/:cid - Obtener carrito por ID
router.get("/:cid", isUserOrPremium, async (req, res) => {
  try {
    const cart = await cartRepository.getCartById(req.params.cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// POST /api/carts/:cid/products/:pid - Agregar producto al carrito (user y premium)
// Premium no puede agregar sus propios productos al carrito
router.post("/:cid/products/:pid", canBuy, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    const cart = await cartRepository.getCartById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    if (cart.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ status: "error", message: "No puedes modificar este carrito" });
    }

    // Verificar si el usuario premium intenta agregar su propio producto
    if (req.user.role === "premium") {
      const product = await productRepository.getProductById(pid);
      if (product && product.owner?.toString() === req.user._id.toString()) {
        return res.status(403).json({
          status: "error",
          message: "No puedes agregar tu propio producto al carrito",
        });
      }
    }

    const updatedCart = await cartRepository.addProductToCart(
      cid,
      pid,
      quantity
    );
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito
router.delete("/:cid/products/:pid", canBuy, async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await cartRepository.getCartById(cid);
    if (cart.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ status: "error", message: "No puedes modificar este carrito" });
    }

    const updatedCart = await cartRepository.removeProductFromCart(cid, pid);
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de producto
router.put("/:cid/products/:pid", canBuy, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await cartRepository.getCartById(cid);
    if (cart.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ status: "error", message: "No puedes modificar este carrito" });
    }

    const updatedCart = await cartRepository.updateProductQuantity(
      cid,
      pid,
      quantity
    );
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// DELETE /api/carts/:cid - Vaciar carrito
router.delete("/:cid", canBuy, async (req, res) => {
  try {
    const cart = await cartRepository.getCartById(req.params.cid);
    if (cart.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ status: "error", message: "No puedes modificar este carrito" });
    }

    const updatedCart = await cartRepository.clearCart(req.params.cid);
    res.json({ status: "success", payload: updatedCart });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// POST /api/carts/:cid/purchase - Finalizar compra (user y premium)
router.post("/:cid/purchase", canBuy, async (req, res) => {
  try {
    const cart = await cartRepository.getCartById(req.params.cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    if (cart.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ status: "error", message: "No puedes realizar esta compra" });
    }

    if (cart.products.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "El carrito está vacío" });
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
      return res.status(400).json({
        status: "error",
        message: "No se pudo procesar ningún producto",
        productsNotProcessed,
      });
    }

    const ticket = await ticketRepository.createTicket(
      req.user.email,
      totalAmount,
      productsProcessed
    );

    // Actualizar carrito con productos no procesados
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

    // Enviar email de confirmación
    try {
      await sendPurchaseConfirmation(req.user.email, ticket);
    } catch (mailError) {
      console.log("Error al enviar email de confirmación:", mailError.message);
    }

    // Verificar productos con stock bajo y notificar al admin
    try {
      const lowStockProducts = [];
      for (const item of productsProcessed) {
        const product = await productRepository.getProductById(item.product);
        if (product && product.stock <= LOW_STOCK_THRESHOLD) {
          lowStockProducts.push({
            title: product.title,
            stock: product.stock,
            price: product.price,
          });
        }
      }

      if (lowStockProducts.length > 0 && process.env.ADMIN_EMAIL) {
        await sendLowStockAlert(process.env.ADMIN_EMAIL, lowStockProducts);
        console.log(
          `Alerta de stock bajo enviada: ${lowStockProducts.length} producto(s)`
        );
      }
    } catch (stockAlertError) {
      console.log(
        "Error al enviar alerta de stock bajo:",
        stockAlertError.message
      );
    }

    res.json({
      status: "success",
      ticket: TicketDTO.fromTicket(ticket),
      productsNotProcessed:
        productsNotProcessed.length > 0 ? productsNotProcessed : undefined,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

module.exports = router;
