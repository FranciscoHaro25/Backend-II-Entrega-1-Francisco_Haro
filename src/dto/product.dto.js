class ProductDTO {
  constructor(product) {
    this.id = product._id;
    this.title = product.title;
    this.description = product.description;
    this.code = product.code;
    this.price = product.price;
    this.stock = product.stock;
    this.category = product.category;
    this.status = product.status;
  }

  static fromProduct(product) {
    return new ProductDTO(product);
  }
}

module.exports = ProductDTO;
