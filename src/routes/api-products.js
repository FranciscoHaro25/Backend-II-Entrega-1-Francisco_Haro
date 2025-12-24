const express = require("express");
const router = express.Router();
const { isAdmin, isAdminOrUser } = require("../middleware/authorization");
const productRepository = require("../repositories/product.repository");
const ProductDTO = require("../dto/product.dto");

// GET /api/products - Obtener todos los productos
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, category, status } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (status !== undefined) filter.status = status === "true";

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : undefined,
    };

    const products = await productRepository.getAllProducts(filter, options);
    const total = await productRepository.countProducts(filter);

    res.json({
      status: "success",
      payload: products.map((p) => ProductDTO.fromProduct(p)),
      totalPages: Math.ceil(total / options.limit),
      page: options.page,
      hasPrevPage: options.page > 1,
      hasNextPage: options.page < Math.ceil(total / options.limit),
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET /api/products/:pid - Obtener producto por ID
router.get("/:pid", async (req, res) => {
  try {
    const product = await productRepository.getProductById(req.params.pid);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }
    res.json({ status: "success", payload: ProductDTO.fromProduct(product) });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// POST /api/products - Crear producto (solo admin)
router.post("/", isAdmin, async (req, res) => {
  try {
    const product = await productRepository.createProduct(req.body);
    res
      .status(201)
      .json({ status: "success", payload: ProductDTO.fromProduct(product) });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// PUT /api/products/:pid - Actualizar producto (solo admin)
router.put("/:pid", isAdmin, async (req, res) => {
  try {
    const product = await productRepository.updateProduct(
      req.params.pid,
      req.body
    );
    res.json({ status: "success", payload: ProductDTO.fromProduct(product) });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

// DELETE /api/products/:pid - Eliminar producto (solo admin)
router.delete("/:pid", isAdmin, async (req, res) => {
  try {
    await productRepository.deleteProduct(req.params.pid);
    res.json({ status: "success", message: "Producto eliminado" });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});

module.exports = router;
